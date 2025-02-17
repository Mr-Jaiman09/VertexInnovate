const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const supabase = require('../config/supabase');

router.get('/recommendations', authenticateToken, async (req, res) => {
  try {
    // Get user's latest assessment
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .select('*, assessment_responses(*)')
      .eq('user_id', req.user.userId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (assessmentError) throw assessmentError;

    // Generate career recommendations based on assessment
    // This would typically involve more complex logic with ML models
    const recommendations = generateRecommendations(assessment[0]);

    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/progress', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', req.user.userId);

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;