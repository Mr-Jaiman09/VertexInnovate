// pages/api/auth/[...route].js
import { supabase } from '@/lib/supabase'
import * as jose from 'jose'
import { validateEmail } from '@/middleware/auth'

export const config = {
  runtime: 'edge'
}

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }), 
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    )
  }

  try {
    const { route } = req.query
    const body = await req.json()

    if (route === 'register') {
      return handleRegister(body)
    } else if (route === 'login') {
      return handleLogin(body)
    }

    return new Response(
      JSON.stringify({ error: 'Route not found' }), 
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

async function handleRegister({ email, password, name }) {
  if (!email || !validateEmail(email)) {
    return new Response(
      JSON.stringify({ error: 'Invalid email' }), 
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  if (!password || password.length < 6) {
    return new Response(
      JSON.stringify({ error: 'Password must be at least 6 characters' }), 
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  if (!name) {
    return new Response(
      JSON.stringify({ error: 'Name is required' }), 
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const { data: user, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } }
  })

  if (error) throw error

  const token = await generateToken(user.id)

  return new Response(
    JSON.stringify({ user, token }), 
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  )
}

async function handleLogin({ email, password }) {
  const { data: { user }, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) throw error

  const token = await generateToken(user.id)

  return new Response(
    JSON.stringify({ user, token }), 
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  )
}

async function generateToken(userId) {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET)
  return await new jose.SignJWT({ sub: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .sign(secret)
}