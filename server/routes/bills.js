import express from 'express';
import { supabase } from '../lib/supabase.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Helper: format text fields
const formatInitial = (s) => {
  if (!s) return '';
  return s.trim().toUpperCase().replace(/\.?$/, '.');
};
const formatName = (s) => {
  if (!s) return '';
  return s.trim().replace(/^\w/, c => c.toUpperCase());
};
const formatDoorNo = (s) => {
  if (!s) return '';
  return s.trim().toUpperCase();
};
const formatAddress = (s) => {
  if (!s) return '';
  return s.trim().replace(/^\w/, c => c.toUpperCase());
};
const formatArea = (s) => {
  if (!s) return '';
  return s.trim().toUpperCase();
};
const formatNetWt = (n) => {
  if (n === null || n === undefined) return '';
  return parseFloat(n).toFixed(3) + ' gm';
};

// Get next bill number
router.get('/next-number', authenticate, async (req, res) => {
  try {
    const { data: settings } = await supabase
      .from('settings')
      .select('bill_prefix, bill_current_number')
      .eq('user_id', req.user.id)
      .single();

    if (!settings) return res.status(404).json({ error: 'Settings not configured' });

    const prefix = settings.bill_prefix || '';
    const num = settings.bill_current_number || 1;
    res.json({ bill_number: `${prefix}${num}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create bill
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      jewel_type, bill_date,
      customer_initial, customer_name, customer_mobile, customer_alt_mobile,
      customer_email, relation_type, relation_name, door_no, address, area, pincode,
      aadhar_number, aadhar_front_url, aadhar_back_url, customer_photo_url,
      articles, principal_amount, present_value
    } = req.body;

    // Get settings for bill number and threshold
    const { data: settings } = await supabase
      .from('settings')
      .select('*')
      .eq('user_id', req.user.id)
      .single();

    if (!settings) return res.status(400).json({ error: 'Please configure settings first' });

    const prefix = settings.bill_prefix || '';
    const currentNum = settings.bill_current_number || 1;
    const bill_number = `${prefix}${currentNum}`;

    // Format fields
    const fmt_initial = formatInitial(customer_initial);
    const fmt_name = formatName(customer_name);
    const fmt_door = formatDoorNo(door_no);
    const fmt_address = formatAddress(address);
    const fmt_area = formatArea(area);

    // Calculate total net weight
    const total_net_weight = (articles || []).reduce((sum, a) => sum + (parseFloat(a.net_weight) || 0), 0);

    // Article descriptions
    const article_descriptions = (articles || []).map(a => a.description).filter(Boolean).join(', ');

    // H/S/O calculation
    const hso = parseFloat(principal_amount) < parseFloat(settings.threshold_value) ? 'S' : 'H';

    // Upsert customer
    let customer_id = null;
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('user_id', req.user.id)
      .eq('mobile', customer_mobile)
      .single();

    if (existingCustomer) {
      customer_id = existingCustomer.id;
      // Update customer info
      await supabase.from('customers').update({
        initial: fmt_initial, name: fmt_name, alt_mobile: customer_alt_mobile,
        email: customer_email, relation_type, relation_name,
        door_no: fmt_door, address: fmt_address, area: fmt_area, pincode,
        aadhar_number, aadhar_front_url, aadhar_back_url, photo_url: customer_photo_url
      }).eq('id', customer_id);
    } else {
      const { data: newCustomer } = await supabase.from('customers').insert({
        user_id: req.user.id, initial: fmt_initial, name: fmt_name,
        mobile: customer_mobile, alt_mobile: customer_alt_mobile,
        email: customer_email, relation_type, relation_name,
        door_no: fmt_door, address: fmt_address, area: fmt_area, pincode,
        aadhar_number, aadhar_front_url, aadhar_back_url, photo_url: customer_photo_url
      }).select('id').single();
      customer_id = newCustomer?.id;
    }

    // Create bill
    const { data: bill, error: billError } = await supabase.from('bills').insert({
      user_id: req.user.id,
      customer_id,
      bill_number,
      bill_date: bill_date || new Date().toISOString().split('T')[0],
      bill_time: new Date().toTimeString().split(' ')[0],
      jewel_type,
      customer_initial: fmt_initial,
      customer_name: fmt_name,
      customer_mobile,
      customer_alt_mobile,
      customer_email,
      relation_type,
      relation_name,
      door_no: fmt_door,
      address: fmt_address,
      area: fmt_area,
      pincode,
      aadhar_number,
      aadhar_front_url,
      aadhar_back_url,
      customer_photo_url,
      principal_amount: parseFloat(principal_amount),
      present_value: parseFloat(present_value),
      current_principal: parseFloat(principal_amount),
      total_net_weight,
      article_descriptions,
      hso
    }).select().single();

    if (billError) throw billError;

    // Insert articles
    if (articles && articles.length > 0) {
      const articleRows = articles.map((a, i) => ({
        bill_id: bill.id,
        user_id: req.user.id,
        description: a.description,
        net_weight: parseFloat(a.net_weight) || 0,
        gross_weight: parseFloat(a.gross_weight) || 0,
        description_tags: a.description_tags || [],
        purity_tag: a.purity_tag || '',
        image_url: a.image_url || '',
        image_urls: a.image_urls || [],
        sort_order: i
      }));
      await supabase.from('articles').insert(articleRows);
    }

    // Increment bill number
    await supabase.from('settings').update({
      bill_current_number: currentNum + 1
    }).eq('user_id', req.user.id);

    // Update customer stats
    if (customer_id) {
      const { data } = await supabase.rpc('update_customer_stats', { p_customer_id: customer_id });
    }

    // Activity log
    await supabase.from('activity_logs').insert({
      user_id: req.user.id,
      action: `${req.user.name} created bill ${bill_number} for ${fmt_name}`,
      section: 'new_bill',
      details: { bill_id: bill.id, bill_number, customer_name: fmt_name }
    });

    res.status(201).json(bill);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get bills (paginated + search)
router.get('/', authenticate, async (req, res) => {
  try {
    const {
      page = 1, limit = 20,
      search = '',
      status,
      sort_by = 'bill_date',
      sort_order = 'desc',
      min_amount, max_amount,
      search_columns
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    let query = supabase
      .from('bills')
      .select(`
        id, bill_number, bill_date, bill_time,
        customer_initial, customer_name, customer_mobile,
        door_no, address, area, pincode, aadhar_number,
        principal_amount, current_principal, present_value,
        article_descriptions, total_net_weight,
        status, hso, bill_with, release_renew_date, release_renew_time,
        renewed_bill_number, jewel_type, created_at
      `, { count: 'exact' })
      .eq('user_id', req.user.id);

    if (status) query = query.eq('status', status);
    if (min_amount) query = query.gte('principal_amount', parseFloat(min_amount));
    if (max_amount) query = query.lte('principal_amount', parseFloat(max_amount));

    if (search && search.trim()) {
      const cols = search_columns ? search_columns.split(',') : null;
      if (cols && cols.length > 0) {
        const conditions = cols.map(c => `${c}.ilike.%${search}%`).join(',');
        query = query.or(conditions);
      } else {
        // Global search across key columns
        query = query.or(
          `bill_number.ilike.%${search}%,customer_name.ilike.%${search}%,customer_mobile.ilike.%${search}%,` +
          `area.ilike.%${search}%,aadhar_number.ilike.%${search}%,article_descriptions.ilike.%${search}%,` +
          `address.ilike.%${search}%,door_no.ilike.%${search}%`
        );
      }
    }

    // Sorting
    const validSorts = ['bill_date', 'bill_number', 'customer_name', 'principal_amount'];
    const col = validSorts.includes(sort_by) ? sort_by : 'bill_date';
    query = query.order(col, { ascending: sort_order === 'asc' });
    // Secondary sort by time when sorting by date
    if (col === 'bill_date') {
      query = query.order('bill_time', { ascending: sort_order === 'asc' });
    }

    query = query.range(offset, offset + parseInt(limit) - 1);

    const { data: bills, count, error } = await query;
    if (error) throw error;

    res.json({ bills, total: count, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single bill detail
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { data: bill, error } = await supabase
      .from('bills')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (error || !bill) return res.status(404).json({ error: 'Bill not found' });

    // Get articles
    const { data: articles } = await supabase
      .from('articles')
      .select('*')
      .eq('bill_id', bill.id)
      .order('sort_order');

    // Get transactions
    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('bill_id', bill.id)
      .order('created_at', { ascending: true });

    // Get other bills for same customer
    const { data: related_bills } = await supabase
      .from('bills')
      .select('id, bill_number, principal_amount, article_descriptions, status, bill_date')
      .eq('user_id', req.user.id)
      .eq('customer_mobile', bill.customer_mobile)
      .neq('id', bill.id)
      .order('bill_date', { ascending: false });

    await supabase.from('activity_logs').insert({
      user_id: req.user.id,
      action: `${req.user.name} viewed bill ${bill.bill_number}`,
      section: 'database'
    });

    res.json({ ...bill, articles, transactions, related_bills });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update bill (edit)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { articles, ...billData } = req.body;

    if (billData.customer_initial) billData.customer_initial = formatInitial(billData.customer_initial);
    if (billData.customer_name) billData.customer_name = formatName(billData.customer_name);
    if (billData.door_no) billData.door_no = formatDoorNo(billData.door_no);
    if (billData.address) billData.address = formatAddress(billData.address);
    if (billData.area) billData.area = formatArea(billData.area);

    // Recalculate articles
    if (articles) {
      const total_net_weight = articles.reduce((sum, a) => sum + (parseFloat(a.net_weight) || 0), 0);
      const article_descriptions = articles.map(a => a.description).filter(Boolean).join(', ');
      billData.total_net_weight = total_net_weight;
      billData.article_descriptions = article_descriptions;

      // Delete old articles and re-insert
      await supabase.from('articles').delete().eq('bill_id', req.params.id);
      const articleRows = articles.map((a, i) => ({
        bill_id: req.params.id,
        user_id: req.user.id,
        description: a.description,
        net_weight: parseFloat(a.net_weight) || 0,
        gross_weight: parseFloat(a.gross_weight) || 0,
        description_tags: a.description_tags || [],
        purity_tag: a.purity_tag || '',
        image_url: a.image_url || '',
        sort_order: i
      }));
      await supabase.from('articles').insert(articleRows);
    }

    const { data, error } = await supabase
      .from('bills')
      .update(billData)
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) throw error;

    await supabase.from('activity_logs').insert({
      user_id: req.user.id,
      action: `${req.user.name} edited bill ${data.bill_number}`,
      section: 'database'
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Release bill
router.post('/:id/release', authenticate, async (req, res) => {
  try {
    const now = new Date();
    const { data, error } = await supabase
      .from('bills')
      .update({
        status: 'released',
        release_renew_date: now.toISOString().split('T')[0],
        release_renew_time: now.toTimeString().split(' ')[0]
      })
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) throw error;

    // Update customer stats
    if (data.customer_id) {
      await supabase.rpc('update_customer_stats', { p_customer_id: data.customer_id });
    }

    await supabase.from('activity_logs').insert({
      user_id: req.user.id,
      action: `${req.user.name} released bill ${data.bill_number}`,
      section: 'database'
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Renew bill (marks old as renewed, returns customer data for new bill)
router.post('/:id/renew', authenticate, async (req, res) => {
  try {
    const { new_bill_number } = req.body;
    const now = new Date();

    const { data, error } = await supabase
      .from('bills')
      .update({
        status: 'renewed',
        release_renew_date: now.toISOString().split('T')[0],
        release_renew_time: now.toTimeString().split(' ')[0],
        renewed_bill_number: new_bill_number ? `Bill no. ${new_bill_number}` : ''
      })
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select('*')
      .single();

    if (error) throw error;

    // Get articles for prefill
    const { data: articles } = await supabase
      .from('articles').select('*').eq('bill_id', req.params.id);

    await supabase.from('activity_logs').insert({
      user_id: req.user.id,
      action: `${req.user.name} renewed bill ${data.bill_number}`,
      section: 'database'
    });

    res.json({ bill: data, articles });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete bill (only latest)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    // Check if this is the latest bill
    const { data: settings } = await supabase
      .from('settings')
      .select('bill_prefix, bill_current_number')
      .eq('user_id', req.user.id)
      .single();

    const currentNum = (settings?.bill_current_number || 2) - 1;
    const latestBillNumber = `${settings?.bill_prefix || ''}${currentNum}`;

    const { data: bill } = await supabase
      .from('bills')
      .select('id, bill_number, customer_id')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (!bill) return res.status(404).json({ error: 'Bill not found' });
    if (bill.bill_number !== latestBillNumber)
      return res.status(400).json({ error: 'Only the latest bill can be deleted' });

    await supabase.from('bills').delete().eq('id', req.params.id);

    // Decrement bill counter
    await supabase.from('settings').update({
      bill_current_number: currentNum
    }).eq('user_id', req.user.id);

    // Update customer stats
    if (bill.customer_id) {
      await supabase.rpc('update_customer_stats', { p_customer_id: bill.customer_id });
    }

    await supabase.from('activity_logs').insert({
      user_id: req.user.id,
      action: `${req.user.name} deleted bill ${bill.bill_number}`,
      section: 'database'
    });

    res.json({ message: 'Bill deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add transaction (interest or principal payment)
router.post('/:id/transactions', authenticate, async (req, res) => {
  try {
    const { type, months_paid, amount_paid } = req.body;

    const { data: bill } = await supabase
      .from('bills').select('*').eq('id', req.params.id).single();

    if (!bill) return res.status(404).json({ error: 'Bill not found' });

    let note = '';
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-IN');

    if (type === 'interest') {
      // Validate months
      const billDate = new Date(bill.bill_date);
      const monthsElapsed = Math.max(0,
        (now.getFullYear() - billDate.getFullYear()) * 12 +
        now.getMonth() - billDate.getMonth() - 
        (now.getDate() < billDate.getDate() ? 1 : 0)
      );
      if (parseInt(months_paid) > monthsElapsed)
        return res.status(400).json({ error: `Cannot pay more than ${monthsElapsed} months` });
      
      note = `${months_paid} month${parseInt(months_paid) > 1 ? 's' : ''} interest paid on ${dateStr} at ${timeStr}`;
    } else if (type === 'principal') {
      note = `Rs. ${parseFloat(amount_paid).toLocaleString('en-IN')} cash paid on ${dateStr} at ${timeStr}`;
      
      // Update current_principal
      const newPrincipal = parseFloat(bill.current_principal) - parseFloat(amount_paid);
      await supabase.from('bills').update({ current_principal: Math.max(0, newPrincipal) })
        .eq('id', req.params.id);
    }

    const { data: transaction, error } = await supabase
      .from('transactions')
      .insert({
        bill_id: req.params.id,
        user_id: req.user.id,
        type,
        months_paid: months_paid ? parseInt(months_paid) : null,
        amount_paid: amount_paid ? parseFloat(amount_paid) : null,
        note
      })
      .select()
      .single();

    if (error) throw error;

    await supabase.from('activity_logs').insert({
      user_id: req.user.id,
      action: `${req.user.name} recorded ${type} payment on bill ${bill.bill_number}: ${note}`,
      section: 'database'
    });

    res.status(201).json(transaction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update H/S/O value for a specific bill
router.patch('/:id/hso', authenticate, async (req, res) => {
  try {
    const { hso } = req.body;
    if (!['H', 'S', 'O'].includes(hso)) {
      return res.status(400).json({ error: 'Invalid H/S/O value. Must be H, S, or O.' });
    }

    const { data, error } = await supabase
      .from('bills')
      .update({ hso })
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select('id, bill_number, hso')
      .single();

    if (error) throw error;

    await supabase.from('activity_logs').insert({
      user_id: req.user.id,
      action: `${req.user.name} updated H/S/O to "${hso}" for bill ${data.bill_number}`,
      section: 'database'
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update "bill is with" value
router.patch('/:id/bill-with', authenticate, async (req, res) => {
  try {
    const { bill_with } = req.body;
    if (!['customer', 'shop'].includes(bill_with)) {
      return res.status(400).json({ error: 'Value must be customer or shop' });
    }
    const { data, error } = await supabase
      .from('bills')
      .update({ bill_with })
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select('id, bill_number, bill_with')
      .single();
    if (error) throw error;
    await supabase.from('activity_logs').insert({
      user_id: req.user.id,
      action: `${req.user.name} updated "Bill is with" to "${bill_with}" for bill ${data.bill_number}`,
      section: 'database'
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
