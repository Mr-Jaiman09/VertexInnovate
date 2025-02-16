const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const supabase = require('../config/supabase');

router.get('/matches', authenticateToken, async (req, res) => {
  try {
    // Get user's skills and preferences
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', req.user.userId)
      .single();

    if (profileError) throw profileError;

    // Get matching jobs
    const { data: jobs, error: jobsError } = await supabase
      .from('jobs')
      .select('*')
      .contains('required_skills', userProfile.skills);

    if (jobsError) throw jobsError;

    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;