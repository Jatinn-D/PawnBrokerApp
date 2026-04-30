import express from 'express';
import { supabase } from '../lib/supabase.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { data, count, error } = await supabase
      .from('activity_logs')
      .select('*', { count: 'exact' })
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (error) throw error;
    res.json({ logs: data, total: count, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Log navigation
router.post('/nav', authenticate, async (req, res) => {
  try {
    const { from_section, to_section } = req.body;
    await supabase.from('activity_logs').insert({
      user_id: req.user.id,
      action: `${req.user.name} navigated from ${from_section} to ${to_section}`,
      section: to_section
    });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Clear all logs for the user
router.delete('/all', authenticate, async (req, res) => {
  try {
    await supabase
      .from('activity_logs')
      .delete()
      .eq('user_id', req.user.id);

    // Log the clearing action itself (fresh start)
    await supabase.from('activity_logs').insert({
      user_id: req.user.id,
      action: `${req.user.name} cleared all activity logs`,
      section: 'account',
    });

    res.json({ message: 'All logs cleared successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
