import express from 'express';
import { supabase } from '../lib/supabase.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    // All-time stats
    const { data: allBills } = await supabase
      .from('bills').select('id, status, principal_amount').eq('user_id', userId);

    const total_bills = allBills?.length || 0;
    const active_bills = allBills?.filter(b => b.status === 'active').length || 0;
    const released_bills = allBills?.filter(b => b.status !== 'active').length || 0;
    const total_pledge_ever = allBills?.reduce((s, b) => s + parseFloat(b.principal_amount), 0) || 0;
    const active_pledge = allBills?.filter(b => b.status === 'active').reduce((s, b) => s + parseFloat(b.principal_amount), 0) || 0;
    const released_pledge = allBills?.filter(b => b.status !== 'active').reduce((s, b) => s + parseFloat(b.principal_amount), 0) || 0;

    // Today stats
    const { data: todayBills } = await supabase
      .from('bills').select('id, status, principal_amount, release_renew_date')
      .eq('user_id', userId).eq('bill_date', today);

    const today_created = todayBills?.length || 0;
    const today_pledge = todayBills?.reduce((s, b) => s + parseFloat(b.principal_amount), 0) || 0;

    const { data: todayReleased } = await supabase
      .from('bills').select('id, principal_amount')
      .eq('user_id', userId).eq('release_renew_date', today).neq('status', 'active');

    const today_released = todayReleased?.length || 0;
    const today_released_pledge = todayReleased?.reduce((s, b) => s + parseFloat(b.principal_amount), 0) || 0;

    // Total customers
    const { count: total_customers } = await supabase
      .from('customers').select('id', { count: 'exact' }).eq('user_id', userId);

    // Monthly chart data (last 12 months)
    const { data: monthlyBills } = await supabase
      .from('bills')
      .select('bill_date, status, principal_amount')
      .eq('user_id', userId)
      .gte('bill_date', new Date(new Date().setMonth(new Date().getMonth() - 12)).toISOString().split('T')[0]);

    // Group by month
    const monthlyMap = {};
    for (const bill of monthlyBills || []) {
      const month = bill.bill_date.substring(0, 7); // YYYY-MM
      if (!monthlyMap[month]) monthlyMap[month] = { created: 0, released: 0, pledge: 0 };
      monthlyMap[month].created++;
      monthlyMap[month].pledge += parseFloat(bill.principal_amount);
      if (bill.status !== 'active') monthlyMap[month].released++;
    }

    const monthly_chart = Object.entries(monthlyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({ month, ...data }));

    res.json({
      total_bills, active_bills, released_bills,
      total_pledge_ever, active_pledge, released_pledge,
      today_created, today_pledge, today_released, today_released_pledge,
      total_customers,
      monthly_chart
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Custom date range stats
router.get('/custom', authenticate, async (req, res) => {
  try {
    const { from, to } = req.query;
    if (!from || !to) return res.status(400).json({ error: 'from and to dates required' });

    const { data: bills } = await supabase
      .from('bills')
      .select('id, status, principal_amount, bill_date, release_renew_date')
      .eq('user_id', req.user.id)
      .gte('bill_date', from)
      .lte('bill_date', to);

    res.json({
      period: { from, to },
      bills_created: bills?.length || 0,
      bills_released: bills?.filter(b => b.status !== 'active').length || 0,
      pledge_amount: bills?.reduce((s, b) => s + parseFloat(b.principal_amount), 0) || 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
