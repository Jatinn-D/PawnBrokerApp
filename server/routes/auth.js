import express from "express";
import { supabase } from "../lib/supabase.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// ─── NEW ROUTES WE NEEDED TO ADD BACK ─────────────────────────────

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;
    if (!name || !email || !mobile || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // 1. Check if user already exists (using maybeSingle to prevent 406 errors)
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .or(`email.eq.${email},mobile.eq.${mobile}`)
      .maybeSingle();

    if (existing) return res.status(409).json({ error: 'Email or mobile already registered' });

    // 2. Create the user securely in Supabase Auth via Admin API
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, mobile } // Your SQL trigger will grab these!
    });

    if (authError) throw authError;

    // 3. Log them in to generate the token for the frontend
    const { data: sessionData, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
    if (loginError) throw loginError;

    // 4. Fetch the newly created profile from your public.users table
    const { data: userProfile } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    res.status(201).json({ user: userProfile, token: sessionData.session.access_token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { mobile, password } = req.body;
    if (!mobile || !password) return res.status(400).json({ error: 'Mobile and password required' });

    // 1. Look up the user's email based on the mobile number
    const { data: userProfile, error: dbError } = await supabase
      .from('users')
      .select('*')
      .eq('mobile', mobile)
      .maybeSingle();

    if (dbError || !userProfile) return res.status(401).json({ error: 'Invalid mobile number or password' });

    // 2. Log them into Supabase Auth using the retrieved email
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: userProfile.email,
      password
    });

    if (authError) return res.status(401).json({ error: 'Invalid mobile number or password' });

    res.json({ user: userProfile, token: authData.session.access_token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:5173/reset-password', // Make sure this matches your frontend URL!
    });

    if (error) return res.status(400).json({ error: error.message });

    res.json({ message: "Reset link sent." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get current user profile
router.get("/me", authenticate, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, name, email, mobile, created_at")
      .eq("id", req.user.id)
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update profile (name, mobile)
router.put("/profile", authenticate, async (req, res) => {
  try {
    const { name, mobile } = req.body;
    const { data, error } = await supabase
      .from("users")
      .update({ name, mobile })
      .eq("id", req.user.id)
      .select("id, name, email, mobile")
      .single();
    if (error) throw error;

    await supabase.from("activity_logs").insert({
      user_id: req.user.id,
      action: `${req.user.name} updated their profile`,
      section: "account",
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mobile to email lookup (server-side, safe)
router.post("/lookup-email", async (req, res) => {
  try {
    const { mobile } = req.body;
    if (!mobile) return res.status(400).json({ error: "Mobile required" });

    const { data, error } = await supabase
      .from("users")
      .select("email")
      .eq("mobile", mobile)
      .single();

    if (error || !data) {
      // Don't reveal whether user exists — generic message
      return res
        .status(404)
        .json({ error: "Invalid mobile number or password" });
    }

    res.json({ email: data.email });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
