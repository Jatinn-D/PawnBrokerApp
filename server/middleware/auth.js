import { supabase } from "../lib/supabase.js";

export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verify the token with Supabase
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    // Get the user's profile from your users table
    const { data: profile } = await supabase
      .from("users")
      .select("id, name, email, mobile")
      .eq("id", user.id)
      .single();

    req.user = {
      id: user.id,
      name: profile?.name || user.email,
      email: user.email,
    };

    next();
  } catch (err) {
    return res.status(401).json({ error: "Authentication failed" });
  }
};
