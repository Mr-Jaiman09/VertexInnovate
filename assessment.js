const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const supabase = require('../config/supabase');

router.post('/start', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('assessments')
      .insert([
        { user_id: req.user.userId, status: 'in_progress' }
      ])
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/submit', authenticateToken, async (req, res) => {
  try {
    const { assessmentId, answers } = req.body;
    
    const { data, error } = await supabase
      .from('assessment_responses')
      .insert([
        {
          assessment_id: assessmentId,
          user_id: req.user.userId,
          responses: answers
        }
      ])
      .select();

    if (error) throw error;

    // Update assessment status
    await supabase
      .from('assessments')
      .update({ status: 'completed' })
      .eq('id', assessmentId);

    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;