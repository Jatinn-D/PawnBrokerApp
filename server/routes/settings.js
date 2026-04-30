import express from "express";
import { supabase } from "../lib/supabase.js";
import { authenticate } from "../middleware/auth.js";
import ExcelJS from 'exceljs';

const router = express.Router();

// Get settings
router.get("/", authenticate, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("settings")
      .select("*")
      .eq("user_id", req.user.id)
      .single();

    if (error && error.code === "PGRST116") {
      // No settings yet, create default
      const { data: newSettings } = await supabase
        .from("settings")
        .insert({ user_id: req.user.id })
        .select()
        .single();
      return res.json(newSettings);
    }

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update settings
router.put("/", authenticate, async (req, res) => {
  try {
    const {
      bill_prefix,
      bill_start_number,
      mandatory_fields,
      gold_interest_rate,
      silver_interest_rate,
      shop_name,
      shop_phone,
      shop_address,
    } = req.body;

    const updateData = {};
    if (bill_prefix !== undefined) updateData.bill_prefix = bill_prefix;
    if (bill_start_number !== undefined) {
      updateData.bill_start_number = parseInt(bill_start_number);
      updateData.bill_current_number = parseInt(bill_start_number);
    }
    if (mandatory_fields !== undefined)
      updateData.mandatory_fields = mandatory_fields;
    if (gold_interest_rate !== undefined)
      updateData.gold_interest_rate = parseFloat(gold_interest_rate);
    if (silver_interest_rate !== undefined)
      updateData.silver_interest_rate = parseFloat(silver_interest_rate);

    // 2. Attach them to the payload going to Supabase
    if (shop_name !== undefined) updateData.shop_name = shop_name;
    if (shop_phone !== undefined) updateData.shop_phone = shop_phone;
    if (shop_address !== undefined) updateData.shop_address = shop_address;

    const { data, error } = await supabase
      .from("settings")
      .update(updateData)
      .eq("user_id", req.user.id)
      .select()
      .single();

    if (error) throw error;

    await supabase.from("activity_logs").insert({
      user_id: req.user.id,
      action: `${req.user.name} updated settings`,
      section: "settings",
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update threshold value (triggers H/S/O recalculation)
router.put("/threshold", authenticate, async (req, res) => {
  try {
    const { threshold_value } = req.body;
    if (!threshold_value)
      return res.status(400).json({ error: "Threshold value required" });

    const threshold = parseFloat(threshold_value);

    // Update setting
    await supabase
      .from("settings")
      .update({ threshold_value: threshold })
      .eq("user_id", req.user.id);

    // Recalculate H/S/O for all active bills
    const { data: activeBills } = await supabase
      .from("bills")
      .select("id, principal_amount, hso")
      .eq("user_id", req.user.id)
      .eq("status", "active");

    for (const bill of activeBills || []) {
      const newHso =
        parseFloat(bill.principal_amount) < threshold
          ? "S"
          : bill.hso === "S"
            ? "H"
            : bill.hso;
      await supabase.from("bills").update({ hso: newHso }).eq("id", bill.id);
    }

    await supabase.from("activity_logs").insert({
      user_id: req.user.id,
      action: `${req.user.name} updated threshold value to ${threshold.toLocaleString("en-IN")}`,
      section: "settings",
      details: { old_value: null, new_value: threshold },
    });

    res.json({
      message: "Threshold updated and H/S/O recalculated",
      threshold_value: threshold,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get late bills filter options
router.get("/late-bills/options", authenticate, async (req, res) => {
  try {
    const now = new Date();
    const { data: bills } = await supabase
      .from("bills")
      .select("bill_date")
      .eq("user_id", req.user.id)
      .eq("status", "active");

    const monthsSet = new Set();
    for (const bill of bills || []) {
      const bd = new Date(bill.bill_date);
      const months =
        (now.getFullYear() - bd.getFullYear()) * 12 +
        now.getMonth() -
        bd.getMonth();
      if (months >= 3) monthsSet.add(3);
      if (months >= 6) monthsSet.add(6);
      if (months >= 8) monthsSet.add(8);
      if (months >= 10) monthsSet.add(10);
      if (months >= 12) monthsSet.add(12);
      if (months >= 18) monthsSet.add(18);
      if (months >= 24) monthsSet.add(24);
    }

    res.json({ options: Array.from(monthsSet).sort((a, b) => a - b) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get late bills data
router.get("/late-bills/data", authenticate, async (req, res) => {
  try {
    const { months } = req.query;
    if (!months) return res.status(400).json({ error: "months required" });

    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - parseInt(months));

    const { data, error } = await supabase
      .from("bills")
      .select("*")
      .eq("user_id", req.user.id)
      .eq("status", "active")
      .lte("bill_date", cutoffDate.toISOString().split("T")[0]);

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Export full database as CSV (used by auto-backup and manual download)
router.get('/export/database', authenticate, async (req, res) => {
  try {
    const { frequency } = req.query;

    const { data: bills, error } = await supabase
      .from('bills')
      .select('*')
      .eq('user_id', req.user.id)
      .order('bill_date', { ascending: true })
      .order('bill_time', { ascending: true });

    if (error) throw error;

    const fmtDate = (d) => {
      if (!d) return '';
      const [y, m, day] = String(d).split('T')[0].split('-');
      return `${day}-${m}-${y}`;
    };
    const fmtINR = (n) => {
      if (!n && n !== 0) return '';
      const int = Math.round(parseFloat(n)).toString();
      const last3 = int.slice(-3);
      const rest = int.slice(0, -3);
      return rest ? rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + last3 : last3;
    };

    const headers = [
      'BILL NO.', 'BILL DATE', 'INITIAL', 'CUSTOMER NAME',
      'DOOR NO.', 'ADDRESS', 'AREA', 'PINCODE', 'AADHAR NO.',
      'PHONE', 'PRINCIPAL AMOUNT', 'ARTICLES', 'NET WEIGHT (GM)',
      'PRESENT VALUE', 'H/S/O', 'BILL IS WITH',
      'RELEASE/RENEW DATE', 'RELEASE/RENEW TIME',
      'RENEWED BILL NO.', 'STATUS', 'JEWEL TYPE'
    ];

    const workbook  = new ExcelJS.Workbook();
    workbook.creator = 'Vaulta';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Database');

    // Column definitions with widths
    sheet.columns = headers.map((h, i) => ({
      header: h,
      key:    `col${i}`,
      width:  Math.max(h.length + 2, 16),
    }));

    // Style header row — yellow background, bold, uppercase, centered
    const headerRow = sheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.fill = {
        type:    'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFD700' }, // yellow
      };
      cell.font = { bold: true, size: 11, color: { argb: 'FF000000' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top:    { style: 'thin' },
        left:   { style: 'thin' },
        bottom: { style: 'thin' },
        right:  { style: 'thin' },
      };
    });
    headerRow.height = 20;

    // Add data rows
    bills.forEach((bill) => {
      const rowData = [
        bill.bill_number,
        fmtDate(bill.bill_date),
        bill.customer_initial || '',
        bill.customer_name || '',
        bill.door_no || '',
        bill.address || '',
        bill.area || '',
        bill.pincode || '',
        bill.aadhar_number || '',
        bill.customer_mobile || '',
        fmtINR(bill.principal_amount),
        bill.article_descriptions || '',
        bill.total_net_weight ? parseFloat(bill.total_net_weight).toFixed(3) + ' gm' : '',
        fmtINR(bill.present_value),
        bill.hso || '',
        bill.bill_with || '',
        fmtDate(bill.release_renew_date),
        bill.release_renew_time ? bill.release_renew_time.slice(0, 5) : '',
        bill.renewed_bill_number || '',
        bill.status || '',
        bill.jewel_type || '',
      ];

      const row = sheet.addRow(rowData);

      // Determine row fill colour
      let fillArgb = null;
      if (bill.status === 'released') fillArgb = 'FFFFCCCC'; // light red
      if (bill.status === 'renewed')  fillArgb = 'FFCCE5FF'; // light blue

      if (fillArgb) {
        row.eachCell({ includeEmpty: true }, (cell) => {
          cell.fill = {
            type:    'pattern',
            pattern: 'solid',
            fgColor: { argb: fillArgb },
          };
        });
      }

      // Light border on every row
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.border = {
          top:    { style: 'hair' },
          left:   { style: 'hair' },
          bottom: { style: 'hair' },
          right:  { style: 'hair' },
        };
      });
    });

    // Freeze the header row so it stays visible when scrolling
    sheet.views = [{ state: 'frozen', ySplit: 1 }];

    // Auto-fit column widths based on content
    sheet.columns.forEach((col) => {
      let maxLen = col.header ? col.header.length : 10;
      col.eachCell({ includeEmpty: false }, (cell) => {
        const len = cell.value ? String(cell.value).length : 0;
        if (len > maxLen) maxLen = len;
      });
      col.width = Math.min(maxLen + 3, 50); // cap at 50
    });

    // Filename based on frequency
    const now = new Date();
    let filename = '';
    if (frequency === 'monthly') {
      const monthNames = ['January','February','March','April','May','June',
        'July','August','September','October','November','December'];
      filename = `${monthNames[now.getMonth()]}-${now.getFullYear()}.xlsx`;
    } else if (frequency === 'yearly') {
      const yr = now.getFullYear();
      filename = `${yr}-${String(yr + 1).slice(2)}.xlsx`;
    } else {
      const d = String(now.getDate()).padStart(2, '0');
      const m = String(now.getMonth() + 1).padStart(2, '0');
      filename = `${d}-${m}-${now.getFullYear()}.xlsx`;
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    await workbook.xlsx.write(res);
    res.end();

    await supabase.from('activity_logs').insert({
      user_id: req.user.id,
      action:  `${req.user.name} exported the full database as ${filename}`,
      section: 'settings',
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
