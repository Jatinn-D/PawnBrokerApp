import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// ─── Shared Input ───────────────────────────────────────────────
function Field({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
  maxLength,
  hint,
  error,
}) {
  const [focused, setFocused] = useState(false);
  const [show, setShow] = useState(false);
  const isPassword = type === "password";

  return (
    <div style={{ marginBottom: "20px" }}>
      <label
        style={{
          display: "block",
          fontSize: "12px",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--color-slate)",
          marginBottom: "8px",
        }}
      >
        {label}{" "}
        {required && <span style={{ color: "var(--color-danger)" }}>*</span>}
      </label>
      <div style={{ position: "relative" }}>
        <input
          type={isPassword && show ? "text" : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          maxLength={maxLength}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: "100%",
            padding: isPassword ? "13px 44px 13px 14px" : "13px 14px",
            fontSize: "15px",
            border: `1px solid ${error ? "var(--color-danger)" : focused ? "var(--color-slate)" : "var(--color-linen)"}`,
            background: "var(--color-bg)",
            color: "var(--color-navy)",
            outline: "none",
            transition: "border-color 0.2s",
            fontFamily: "var(--font-body)",
          }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            style={{
              position: "absolute",
              right: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              color: "var(--color-warm-gray)",
              cursor: "pointer",
              padding: "4px",
              display: "flex",
            }}
          >
            {show ? (
              <svg
                width="18"
                height="18"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="square"
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                />
              </svg>
            ) : (
              <svg
                width="18"
                height="18"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="square"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="square"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            )}
          </button>
        )}
      </div>
      {error && (
        <p
          style={{
            fontSize: "12px",
            color: "var(--color-danger)",
            marginTop: "5px",
          }}
        >
          {error}
        </p>
      )}
      {hint && !error && (
        <p
          style={{
            fontSize: "12px",
            color: "var(--color-warm-gray)",
            marginTop: "5px",
          }}
        >
          {hint}
        </p>
      )}
    </div>
  );
}

// ─── Vaulta Logo ────────────────────────────────────────────────
function VaultaLogo({ size = 32, color = "var(--color-navy)" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect x="4" y="6" width="32" height="28" stroke={color} strokeWidth="2" />
      <circle cx="20" cy="20" r="8" stroke={color} strokeWidth="1.5" />
      <circle cx="20" cy="20" r="3" stroke={color} strokeWidth="1.5" />
      <line x1="20" y1="12" x2="20" y2="6" stroke={color} strokeWidth="1.5" />
      <line x1="20" y1="28" x2="20" y2="34" stroke={color} strokeWidth="1.5" />
      <line x1="12" y1="20" x2="6" y2="20" stroke={color} strokeWidth="1.5" />
      <line x1="28" y1="20" x2="36" y2="20" stroke={color} strokeWidth="1.5" />
      <line
        x1="14.34"
        y1="14.34"
        x2="10.1"
        y2="10.1"
        stroke={color}
        strokeWidth="1.5"
      />
      <line
        x1="25.66"
        y1="25.66"
        x2="29.9"
        y2="29.9"
        stroke={color}
        strokeWidth="1.5"
      />
      <line
        x1="25.66"
        y1="14.34"
        x2="29.9"
        y2="10.1"
        stroke={color}
        strokeWidth="1.5"
      />
      <line
        x1="14.34"
        y1="25.66"
        x2="10.1"
        y2="29.9"
        stroke={color}
        strokeWidth="1.5"
      />
      <rect x="32" y="18" width="4" height="4" fill={color} />
    </svg>
  );
}

// ─── Register Form ──────────────────────────────────────────────
function RegisterForm({ onSwitch }) {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    confirm: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Valid email required";
    if (!form.mobile.trim() || !/^\d{10}$/.test(form.mobile))
      errs.mobile = "Enter a valid 10-digit mobile number";
    if (!form.password || form.password.length < 6)
      errs.password = "Password must be at least 6 characters";
    if (form.password !== form.confirm) errs.confirm = "Passwords do not match";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        mobile: form.mobile,
        password: form.password,
      });
      navigate("/dashboard");
    } catch (err) {
      setApiError(
        err.response?.data?.error || "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Field
        label="Full Name"
        value={form.name}
        onChange={set("name")}
        placeholder="Eg. Ramesh Kumar"
        required
        error={errors.name}
      />
      <Field
        label="Email Address"
        type="email"
        value={form.email}
        onChange={set("email")}
        placeholder="you@example.com"
        required
        error={errors.email}
      />
      <Field
        label="Mobile Number"
        type="tel"
        value={form.mobile}
        onChange={set("mobile")}
        placeholder="10-digit mobile number"
        required
        maxLength={10}
        error={errors.mobile}
        hint="This will be used to log in"
      />
      <Field
        label="Password"
        type="password"
        value={form.password}
        onChange={set("password")}
        placeholder="Minimum 6 characters"
        required
        error={errors.password}
      />
      <Field
        label="Confirm Password"
        type="password"
        value={form.confirm}
        onChange={set("confirm")}
        placeholder="Re-enter your password"
        required
        error={errors.confirm}
      />

      {apiError && (
        <div
          style={{
            background: "var(--color-danger-light)",
            border: "1px solid rgba(192,57,43,0.2)",
            padding: "12px 16px",
            marginBottom: "20px",
            fontSize: "13px",
            color: "var(--color-danger)",
          }}
        >
          {apiError}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        style={{
          width: "100%",
          padding: "15px",
          background: loading ? "var(--color-warm-gray)" : "var(--color-navy)",
          color: "#fff",
          border: "none",
          fontSize: "15px",
          letterSpacing: "0.04em",
          cursor: loading ? "not-allowed" : "pointer",
          transition: "background 0.2s",
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
        }}
      >
        {loading ? (
          <>
            <div
              style={{
                width: "16px",
                height: "16px",
                border: "2px solid rgba(255,255,255,0.3)",
                borderTop: "2px solid white",
                borderRadius: "50%",
                animation: "spin 0.7s linear infinite",
              }}
            />
            Creating account...
          </>
        ) : (
          "Create Account"
        )}
      </button>

      <p
        style={{
          textAlign: "center",
          fontSize: "14px",
          color: "var(--color-warm-gray)",
        }}
      >
        Already have an account?{" "}
        <button
          type="button"
          onClick={onSwitch}
          style={{
            background: "none",
            border: "none",
            color: "var(--color-slate)",
            cursor: "pointer",
            fontSize: "14px",
            textDecoration: "underline",
            textUnderlineOffset: "3px",
          }}
        >
          Log in
        </button>
      </p>
    </form>
  );
}

// ─── Login Form ─────────────────────────────────────────────────
function LoginForm({ onSwitch }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ mobile: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.mobile.trim()) errs.mobile = "Mobile number is required";
    if (!form.password) errs.password = "Password is required";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await login(form.mobile, form.password);
      navigate("/dashboard");
    } catch (err) {
      setApiError(
        err.response?.data?.error || "Invalid mobile number or password",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setForgotLoading(true);
    try {
      const { supabase } = await import("../lib/supabase");
      const { error } = await supabase.auth.resetPasswordForEmail(
        forgotEmail.trim(),
        { redirectTo: `${window.location.origin}/auth/reset-password` },
      );
      if (error) throw error;
      setForgotSent(true);
    } catch (err) {
      alert("Could not send reset email: " + err.message);
    } finally {
      setForgotLoading(false);
    }
  };

  if (showForgot) {
    return (
      <div style={{ animation: "fadeIn 0.2s ease-out" }}>
        <button
          type="button"
          onClick={() => {
            setShowForgot(false);
            setForgotSent(false);
            setForgotEmail("");
          }}
          style={{
            background: "none",
            border: "none",
            color: "var(--color-slate)",
            cursor: "pointer",
            fontSize: "13px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            marginBottom: "28px",
            padding: 0,
          }}
        >
          <svg
            width="16"
            height="16"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="square" d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to login
        </button>

        <h3
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "24px",
            color: "var(--color-navy)",
            marginBottom: "8px",
            fontWeight: 400,
          }}
        >
          Reset Password
        </h3>
        <p
          style={{
            fontSize: "14px",
            color: "var(--color-warm-gray)",
            marginBottom: "28px",
            lineHeight: "1.6",
          }}
        >
          Enter your registered email address and we'll send you a link to reset
          your password.
        </p>

        {forgotSent ? (
          <div
            style={{
              background: "var(--color-success-light)",
              border: "1px solid rgba(39,174,96,0.25)",
              padding: "20px",
              textAlign: "center",
            }}
          >
            <svg
              width="32"
              height="32"
              fill="none"
              viewBox="0 0 24 24"
              stroke="var(--color-success)"
              strokeWidth="1.5"
              style={{ margin: "0 auto 12px", display: "block" }}
            >
              <path
                strokeLinecap="square"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <p
              style={{
                color: "var(--color-success)",
                fontSize: "14px",
                lineHeight: "1.6",
              }}
            >
              A password reset link has been sent to{" "}
              <strong>{forgotEmail}</strong>. Please check your inbox.
            </p>
          </div>
        ) : (
          <form onSubmit={handleForgotPassword}>
            <Field
              label="Registered Email"
              type="email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
            <button
              type="submit"
              disabled={forgotLoading}
              style={{
                width: "100%",
                padding: "15px",
                background: forgotLoading
                  ? "var(--color-warm-gray)"
                  : "var(--color-navy)",
                color: "#fff",
                border: "none",
                fontSize: "15px",
                cursor: forgotLoading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
              }}
            >
              {forgotLoading ? (
                <>
                  <div
                    style={{
                      width: "16px",
                      height: "16px",
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderTop: "2px solid white",
                      borderRadius: "50%",
                      animation: "spin 0.7s linear infinite",
                    }}
                  />
                  Sending...
                </>
              ) : (
                "Send Reset Link"
              )}
            </button>
          </form>
        )}
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      style={{ animation: "fadeIn 0.2s ease-out" }}
    >
      <Field
        label="Mobile Number"
        type="tel"
        value={form.mobile}
        onChange={set("mobile")}
        placeholder="Your registered mobile number"
        required
        maxLength={10}
        error={errors.mobile}
      />
      <Field
        label="Password"
        type="password"
        value={form.password}
        onChange={set("password")}
        placeholder="Your password"
        required
        error={errors.password}
      />

      <div
        style={{ textAlign: "right", marginTop: "-12px", marginBottom: "20px" }}
      >
        <button
          type="button"
          onClick={() => setShowForgot(true)}
          style={{
            background: "none",
            border: "none",
            color: "var(--color-slate)",
            cursor: "pointer",
            fontSize: "13px",
            textDecoration: "underline",
            textUnderlineOffset: "3px",
          }}
        >
          Forgot password?
        </button>
      </div>

      {apiError && (
        <div
          style={{
            background: "var(--color-danger-light)",
            border: "1px solid rgba(192,57,43,0.2)",
            padding: "12px 16px",
            marginBottom: "20px",
            fontSize: "13px",
            color: "var(--color-danger)",
          }}
        >
          {apiError}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        style={{
          width: "100%",
          padding: "15px",
          background: loading ? "var(--color-warm-gray)" : "var(--color-navy)",
          color: "#fff",
          border: "none",
          fontSize: "15px",
          letterSpacing: "0.04em",
          cursor: loading ? "not-allowed" : "pointer",
          transition: "background 0.2s",
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
        }}
      >
        {loading ? (
          <>
            <div
              style={{
                width: "16px",
                height: "16px",
                border: "2px solid rgba(255,255,255,0.3)",
                borderTop: "2px solid white",
                borderRadius: "50%",
                animation: "spin 0.7s linear infinite",
              }}
            />
            Logging in...
          </>
        ) : (
          "Log In"
        )}
      </button>

      <p
        style={{
          textAlign: "center",
          fontSize: "14px",
          color: "var(--color-warm-gray)",
        }}
      >
        Don't have an account?{" "}
        <button
          type="button"
          onClick={onSwitch}
          style={{
            background: "none",
            border: "none",
            color: "var(--color-slate)",
            cursor: "pointer",
            fontSize: "14px",
            textDecoration: "underline",
            textUnderlineOffset: "3px",
          }}
        >
          Create one
        </button>
      </p>
    </form>
  );
}

// ─── Auth Page ──────────────────────────────────────────────────
export default function AuthPage() {
  const [mode, setMode] = useState("login"); // 'login' | 'register'

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        background: "var(--color-bg)",
      }}
    >
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 768px) {
          .auth-panel-left { display: none !important; }
          .auth-panel-right { grid-column: 1 / -1 !important; }
        }
      `}</style>

      {/* LEFT PANEL — decorative */}
      <div
        className="auth-panel-left"
        style={{
          background: "var(--color-navy)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "48px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Grid texture */}
        <div style={{ position: "absolute", inset: 0, opacity: 0.04 }}>
          <svg width="100%" height="100%">
            <defs>
              <pattern
                id="auth-grid"
                width="48"
                height="48"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 48 0 L 0 0 0 48"
                  fill="none"
                  stroke="white"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#auth-grid)" />
          </svg>
        </div>

        {/* Vault rings decoration */}
        <div
          style={{
            position: "absolute",
            bottom: "-80px",
            right: "-80px",
            width: "400px",
            height: "400px",
            border: "1px solid rgba(255,255,255,0.05)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "300px",
              height: "300px",
              border: "1px solid rgba(255,255,255,0.07)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: "200px",
                height: "200px",
                border: "1px solid rgba(255,255,255,0.09)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div style={{ opacity: 0.07 }}>
                <VaultaLogo size={100} color="white" />
              </div>
            </div>
          </div>
        </div>

        {/* Logo */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "42px",
              color: "var(--color-linen)",
              fontStyle: "italic",
            }}
          >
            Suvarna
          </span>
        </div>

        {/* Quote / tagline */}
        <div style={{ position: "relative", zIndex: 2 }}>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "28px",
              fontStyle: "italic",
              color: "rgba(231,226,222,0.6)",
              lineHeight: "1.35",
              marginBottom: "20px",
            }}
          >
            "Every jewel has a story. Every pledge has a promise."
          </p>
          <div
            style={{
              width: "40px",
              height: "1px",
              background: "rgba(231,226,222,0.2)",
            }}
          />
        </div>

        {/* Stats row */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            display: "flex",
            gap: "40px",
          }}
        >
          {[
            { label: "Sections", value: "7" },
            { label: "Search speed", value: "Instant" },
            { label: "Devices", value: "All" },
          ].map((s, i) => (
            <div key={i}>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "28px",
                  color: "var(--color-linen)",
                  lineHeight: 1,
                }}
              >
                {s.value}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "rgba(231,226,222,0.35)",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginTop: "6px",
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL — form */}
      <div
        className="auth-panel-right"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 32px",
          overflowY: "auto",
        }}
      >
        <div style={{ width: "100%", maxWidth: "440px" }}>
          {/* Mode tabs */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              border: "1px solid var(--color-linen)",
              marginBottom: "36px",
            }}
          >
            {["login", "register"].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                style={{
                  padding: "14px",
                  background: mode === m ? "var(--color-navy)" : "transparent",
                  color: mode === m ? "#fff" : "var(--color-warm-gray)",
                  border: "none",
                  fontSize: "14px",
                  letterSpacing: "0.04em",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  textTransform: "capitalize",
                }}
              >
                {m === "login" ? "Log In" : "Create Account"}
              </button>
            ))}
          </div>

          {/* Heading */}
          <div style={{ marginBottom: "32px" }}>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "30px",
                color: "var(--color-navy)",
                fontWeight: 400,
                marginBottom: "8px",
              }}
            >
              {mode === "login" ? "Welcome back." : "Create your account."}
            </h2>
            <p
              style={{
                fontSize: "14px",
                color: "var(--color-warm-gray)",
                lineHeight: "1.6",
              }}
            >
              {mode === "login"
                ? "Log in to manage your pledge business."
                : "Set up your account in under a minute."}
            </p>
          </div>

          {/* Form */}
          {mode === "login" ? (
            <LoginForm key="login" onSwitch={() => setMode("register")} />
          ) : (
            <RegisterForm key="register" onSwitch={() => setMode("login")} />
          )}
        </div>
      </div>
    </div>
  );
}
