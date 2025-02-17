// pages/api/assessment/[action].js
import { supabase } from '@/lib/supabase'
import { verifyAuth } from '@/middleware/auth'
import { skillAnalyzer } from '@/lib/ml/skill-analyzer'

export const config = {
  runtime: 'edge'
}

export default async function handler(req) {
  // Verify authentication
  const auth = await verifyAuth(req)
  if (auth.error) {
    return new Response(
      JSON.stringify({ error: auth.error }), 
      { status: auth.status, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const { action } = req.query

  try {
    if (action === 'start') {
      return handleStartAssessment(auth.userId)
    } else if (action === 'submit') {
      const body = await req.json()
      return handleSubmitAssessment(auth.userId, body)
    } else if (action === 'analyze-skills') {
      const body = await req.json()
      return handleAnalyzeSkills(auth.userId, body)
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }), 
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

async function handleStartAssessment(userId) {
  const { data, error } = await supabase
    .from('assessments')
    .insert([{ user_id: userId, status: 'in_progress' }])
    .select()

  if (error) throw error

  return new Response(
    JSON.stringify(data[0]), 
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  )
}

async function handleSubmitAssessment(userId, { assessmentId, answers }) {
  const { data, error } = await supabase
    .from('assessment_responses')
    .insert([{
      assessment_id: assessmentId,
      user_id: userId,
      responses: answers
    }])
    .select()

  if (error) throw error

  await supabase
    .from('assessments')
    .update({ status: 'completed' })
    .eq('id', assessmentId)

  return new Response(
    JSON.stringify(data[0]), 
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  )
}

async function handleAnalyzeSkills(userId, { skills }) {
  // Get user's profile
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (profileError) throw profileError

  // Analyze skills
  const skillsAnalysis = await skillAnalyzer.analyze(skills)

  // Store analysis results
  const { error: analysisError } = await supabase
    .from('skill_assessments')
    .insert([{
      user_id: userId,
      assessment_data: skillsAnalysis,
      timestamp: new Date().toISOString()
    }])

  if (analysisError) throw analysisError

  return new Response(
    JSON.stringify(skillsAnalysis), 
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  )
}