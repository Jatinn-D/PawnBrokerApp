import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase puts the token in the URL hash — getSession picks it up automatically
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
      else navigate("/auth");
    });
  }, []);

  const handleReset = async (e) => {
    e.preventDefault();
    if (newPassword !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      setSuccess(true);
      setTimeout(() => navigate("/auth"), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!ready) return null;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-bg)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          padding: "40px 32px",
          border: "1px solid var(--color-linen)",
          background: "white",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "24px",
            color: "var(--color-navy)",
            fontWeight: 400,
            marginBottom: "8px",
          }}
        >
          Set New Password
        </h2>
        <p
          style={{
            fontSize: "13px",
            color: "var(--color-warm-gray)",
            marginBottom: "24px",
          }}
        >
          Enter your new password below.
        </p>

        {success ? (
          <div
            style={{
              padding: "16px",
              background: "#EAF7EF",
              border: "1px solid rgba(39,174,96,0.25)",
              color: "#1e8449",
              fontSize: "14px",
            }}
          >
            Password updated! Redirecting to login…
          </div>
        ) : (
          <form onSubmit={handleReset}>
            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "11px",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--color-slate)",
                  marginBottom: "6px",
                }}
              >
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "11px 12px",
                  border: "1px solid var(--color-linen)",
                  background: "var(--color-bg)",
                  fontSize: "14px",
                  fontFamily: "var(--font-body)",
                  outline: "none",
                }}
              />
            </div>
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "11px",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--color-slate)",
                  marginBottom: "6px",
                }}
              >
                Confirm Password
              </label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "11px 12px",
                  border: "1px solid var(--color-linen)",
                  background: "var(--color-bg)",
                  fontSize: "14px",
                  fontFamily: "var(--font-body)",
                  outline: "none",
                }}
              />
            </div>
            {error && (
              <p
                style={{
                  fontSize: "12px",
                  color: "#C0392B",
                  marginBottom: "16px",
                }}
              >
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "13px",
                background: "var(--color-navy)",
                color: "#fff",
                border: "none",
                fontSize: "14px",
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "var(--font-body)",
              }}
            >
              {loading ? "Updating…" : "Update Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
