import express from "express";
import { supabase } from "../lib/supabase.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// Get all customers
router.get("/", authenticate, async (req, res) => {
  try {
    const { search = "", rating_min, rating_max, has_active } = req.query;

    // 1. Build the base customer query
    let query = supabase
      .from("customers")
      .select("*", { count: "exact" })
      .eq("user_id", req.user.id);

    if (search.trim()) {
      query = query.or(
        `name.ilike.%${search}%,mobile.ilike.%${search}%,area.ilike.%${search}%,aadhar_number.ilike.%${search}%`,
      );
    }

    if (rating_min) query = query.gte("rating", parseFloat(rating_min));
    if (rating_max) query = query.lte("rating", parseFloat(rating_max));
    if (has_active === "true") query = query.gt("active_bills", 0);
    if (has_active === "false") query = query.eq("active_bills", 0);

    query = query.order("created_at", { ascending: false });

    // 2. Fetch the customers
    const { data: customers, count, error } = await query;
    if (error) throw error;

    // 3. If no customers match, send empty response early
    if (!customers || customers.length === 0) {
      return res.json({ customers: [], total: 0 });
    }

    // ── THE NEW MATH SECTION ──

    // 4. Get the IDs of the customers we just found
    const customerIds = customers.map((c) => c.id);

    // 5. Fetch all bills for these specific customers
    const { data: bills, error: billsError } = await supabase
      .from("bills")
      .select("customer_id, principal_amount, status")
      .in("customer_id", customerIds)
      .eq("user_id", req.user.id);

    if (billsError) throw billsError;

    // 6. Loop through customers and calculate their totals
    const customersWithPledges = customers.map((customer) => {
      // Find all bills belonging to this specific customer
      const customerBills = bills.filter((b) => b.customer_id === customer.id);

      // Sum ALL bills for lifetime total
      const lifetime_pledge_amount = customerBills.reduce(
        (sum, b) => sum + (parseFloat(b.principal_amount) || 0),
        0,
      );

      // Sum ONLY 'active' bills for the current exposure
      const active_pledge_amount = customerBills
        .filter((b) => b.status === "active")
        .reduce((sum, b) => sum + (parseFloat(b.principal_amount) || 0), 0);

      // Return the customer object with our two new fields attached
      return {
        ...customer,
        lifetime_pledge_amount,
        active_pledge_amount,
      };
    });

    // 7. Send the enriched data back to the React frontend
    res.json({ customers: customersWithPledges, total: count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get customer by ID
router.get("/:id", authenticate, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("id", req.params.id)
      .eq("user_id", req.user.id)
      .single();

    if (error) throw error;

    await supabase.from("activity_logs").insert({
      user_id: req.user.id,
      action: `${req.user.name} viewed customer ${data.name}`,
      section: "customers",
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
