import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import api from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper function to fetch your public.users profile after Supabase logs in
  const fetchProfile = async (supabaseUser) => {
    try {
      const res = await api.get("/api/auth/me");
      // Merge Supabase auth data with your custom database profile
      setUser({ ...supabaseUser, ...res.data });
    } catch (err) {
      setUser(supabaseUser);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 1. Initial Check on Page Load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        localStorage.setItem("vaulta_token", session.access_token);
        fetchProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    // 2. The Single Source of Truth for Tokens!
    // This listener handles everything automatically. We never call localStorage manually in login/register again.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        localStorage.setItem("vaulta_token", session.access_token);
        fetchProfile(session.user);
      } else {
        localStorage.removeItem("vaulta_token");
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (mobile, password) => {
    // Step 1: Let Express safely look up the email without RLS blocking it
    const res = await api.post("/api/auth/lookup-email", { mobile });
    const { email } = res.data;

    // Step 2: Log into Supabase natively in the browser!
    // (This triggers onAuthStateChange automatically, safely saving the token)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw new Error("Invalid mobile number or password");
    return data.user;
  };

  const register = async (formData) => {
    // Step 1: Let Express create the user safely (Admin bypasses RLS to hit public.users)
    await api.post("/api/auth/register", formData);

    // Step 2: Log into Supabase natively in the browser!
    // (This triggers onAuthStateChange automatically, safely saving the token)
    const { data, error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (error) throw error;
    return data.user;
  };

  const logout = async () => {
    // Automatically triggers onAuthStateChange to clear everything
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
