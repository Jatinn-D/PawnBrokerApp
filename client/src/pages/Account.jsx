import { useState, useEffect, useCallback } from "react";
import api from "../lib/api";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { fmtDate } from "../lib/format";
import {
  Field,
  Btn,
  Spinner,
  Toast,
  ConfirmModal,
} from "../components/ui/index.jsx";

const Ico = ({ d, size = 16 }) => (
  <svg
    width={size}
    height={size}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <path strokeLinecap="square" d={d} />
  </svg>
);

export function SettingsCard({ title, subtitle, icon, action, children }) {
  return (
    <div
      style={{
        border: "1px solid var(--color-linen)",
        background: "white",
        marginBottom: "20px",
      }}
    >
      {/* Header Container - Now using responsive class */}
      <div
        className="card-header"
        style={{
          padding: "16px 24px",
          borderBottom: "1px solid var(--color-linen)",
        }}
      >
        {/* Left Side: Icon, Title, Subtitle */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ color: "var(--color-slate)" }}>{icon}</div>
          <div>
            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "17px",
                color: "var(--color-navy)",
                fontWeight: 400,
                marginBottom: subtitle ? "2px" : 0,
              }}
            >
              {title}
            </h3>
            {subtitle && (
              <p style={{ fontSize: "12px", color: "var(--color-warm-gray)" }}>
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right Side: The Action Button */}
        {action && <div className="card-header-actions">{action}</div>}
      </div>

      {/* Main Content */}
      <div className="card-body" style={{ padding: "20px 24px" }}>
        {children}
      </div>
    </div>
  );
}

export default function Account() {
  const { user, login } = useAuth();
  const [profile, setProfile] = useState({ name: "", email: "", mobile: "" });
  const [profileEditing, setProfileEditing] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);

  const [passwords, setPasswords] = useState({
    current: "",
    new_password: "",
    confirm: "",
  });
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdErrors, setPwdErrors] = useState({});

  const [logs, setLogs] = useState([]);
  const [logTotal, setLogTotal] = useState(0);
  const [logPage, setLogPage] = useState(1);
  const [logLoading, setLogLoading] = useState(false);
  const LOG_LIMIT = 50;

  const [toast, setToast] = useState(null);

  const [clearLogsConfirm, setClearLogsConfirm] = useState(false);

  // Load profile
  useEffect(() => {
    api
      .get("/api/auth/me")
      .then((r) => {
        setProfile({
          name: r.data.name,
          email: r.data.email,
          mobile: r.data.mobile,
        });
      })
      .catch(() => {});
  }, []);

  const clearAllLogs = async () => {
    try {
      await api.delete("/api/activity/all");
      setLogs([]);
      setLogTotal(0);
      setToast({ message: "All activity logs cleared.", type: "success" });
    } catch {
      setToast({ message: "Failed to clear logs.", type: "error" });
    }
    setClearLogsConfirm(false);
  };

  // Load activity logs
  const fetchLogs = useCallback(async () => {
    setLogLoading(true);
    try {
      const res = await api.get(
        `/api/activity?page=${logPage}&limit=${LOG_LIMIT}`,
      );
      setLogs(res.data.logs || []);
      setLogTotal(res.data.total || 0);
    } catch {
      /* noop */
    } finally {
      setLogLoading(false);
    }
  }, [logPage]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const saveProfile = async () => {
    setProfileSaving(true);
    try {
      await api.put("/api/auth/profile", profile);
      setToast({ message: "Profile updated successfully.", type: "success" });
      setProfileEditing(false);
    } catch (e) {
      setToast({
        message: e.response?.data?.error || "Failed to update profile.",
        type: "error",
      });
    } finally {
      setProfileSaving(false);
    }
  };

  const changePassword = async () => {
    const errs = {};
    if (!passwords.current) errs.current = "Enter your current password";
    if (!passwords.new_password || passwords.new_password.length < 6)
      errs.new_password = "New password must be at least 6 characters";
    if (passwords.new_password !== passwords.confirm)
      errs.confirm = "Passwords do not match";
    if (Object.keys(errs).length) {
      setPwdErrors(errs);
      return;
    }
    setPwdErrors({});
    setPwdSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwords.new_password,
      });

      if (error) throw error;

      setToast({ message: "Password changed successfully.", type: "success" });
      setPasswords({ current: "", new_password: "", confirm: "" });
    } catch (e) {
      setToast({
        message: e.message || "Failed to change password.",
        type: "error",
      });
    } finally {
      setPwdSaving(false);
    }
  };

  const downloadLogs = async () => {
    try {
      const res = await api.get(`/api/activity?page=1&limit=10000`);
      const allLogs = res.data.logs || [];
      const rows = [["Action", "Section", "Date & Time"]];
      allLogs.forEach((log) => {
        rows.push([
          `"${log.action}"`,
          log.section || "",
          new Date(log.created_at).toLocaleString("en-IN"),
        ]);
      });
      const csv = rows.map((r) => r.join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `vaulta-activity-log-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setToast({ message: "Failed to download logs.", type: "error" });
    }
  };

  const totalLogPages = Math.ceil(logTotal / LOG_LIMIT);
  const createdAt = user?.created_at
    ? new Date(user.created_at).toLocaleString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  const sectionColors = {
    auth: "#2471A3",
    new_bill: "#27AE60",
    database: "#2F3A55",
    customers: "#5C6B8A",
    dashboard: "#6E6F73",
    settings: "#D4A017",
    account: "#8E44AD",
  };

  return (
    <div
      className="mobile-page-pad"
      style={{
        background: "var(--color-bg)",
        minHeight: "100%",
      }}
    >
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(6px) } to { opacity:1; transform:translateY(0) } }
        @keyframes _spin  { to { transform:rotate(360deg) } }

        /* Responsive Layouts */
        .mobile-page-pad { padding: 20px 20px 0px; }
        .resp-grid-2 { display: grid; grid-template-columns: 1fr; gap: 14px; }
        
        .card-header { display: flex; flex-direction: column; align-items: flex-start; gap: 16px; }
        .card-header-actions { display: flex; flex-direction: column; width: 100%; gap: 10px; }
        .card-header-actions button { width: 100%; justify-content: center; }

        @media (min-width: 768px) {
          .mobile-page-pad { padding: 28px 32px 0px; }
          .resp-grid-2 { grid-template-columns: 1fr 1fr; }
          
          .card-header { flex-direction: row; align-items: center; justify-content: space-between; }
          .card-header-actions { flex-direction: row; width: auto; }
          .card-header-actions button { width: auto; justify-content: flex-start; }
        }
      `}</style>

      <div style={{ marginBottom: "28px" }}>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "28px",
            color: "var(--color-navy)",
            fontWeight: 400,
            marginBottom: "4px",
          }}
        >
          Account
        </h1>
        <p style={{ fontSize: "13px", color: "var(--color-warm-gray)" }}>
          Manage your profile and review activity
        </p>
      </div>

      {/* ── Profile ── */}
      <SettingsCard
        title="Profile"
        subtitle="Your personal information"
        icon={
          <Ico d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        }
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "20px",
            marginBottom: "20px",
            flexWrap: "wrap",
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width: "60px",
              height: "60px",
              background: "var(--color-navy)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontFamily: "var(--font-display)",
              fontSize: "24px",
              flexShrink: 0,
            }}
          >
            {profile.name?.charAt(0).toUpperCase() || "?"}
          </div>
          <div>
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "20px",
                color: "var(--color-navy)",
                marginBottom: "2px",
              }}
            >
              {profile.name}
            </p>
            <p style={{ fontSize: "12px", color: "var(--color-warm-gray)" }}>
              Member since {createdAt}
            </p>
          </div>
        </div>

        {/* Responsive Grid replacing rigid 1fr 1fr */}
        <div className="resp-grid-2" style={{ marginBottom: "16px" }}>
          <Field
            label="Full Name"
            value={profile.name}
            onChange={(e) =>
              setProfile((p) => ({ ...p, name: e.target.value }))
            }
            disabled={!profileEditing}
            style={{ gridColumn: "1/-1" }}
          />
          <Field
            label="Email"
            type="email"
            value={profile.email}
            onChange={(e) =>
              setProfile((p) => ({ ...p, email: e.target.value }))
            }
            disabled={!profileEditing}
          />
          <Field
            label="Mobile"
            type="tel"
            value={profile.mobile}
            onChange={(e) =>
              setProfile((p) => ({
                ...p,
                mobile: e.target.value.replace(/\D/g, "").slice(0, 10),
              }))
            }
            disabled={!profileEditing}
            maxLength={10}
          />
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          {!profileEditing ? (
            <button
              onClick={() => setProfileEditing(true)}
              style={{
                padding: "9px 16px",
                border: "1px solid var(--color-linen)",
                background: "transparent",
                fontSize: "12px",
                cursor: "pointer",
                fontFamily: "var(--font-body)",
                color: "var(--color-navy)",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--color-linen)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <Ico d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              Edit Profile
            </button>
          ) : (
            <>
              <Btn
                variant="primary"
                onClick={saveProfile}
                loading={profileSaving}
                size="sm"
              >
                Save Changes
              </Btn>
              <Btn
                variant="secondary"
                onClick={() => setProfileEditing(false)}
                size="sm"
              >
                Cancel
              </Btn>
            </>
          )}
        </div>
      </SettingsCard>

      {/* ── Change Password ── */}
      <SettingsCard
        title="Change Password"
        subtitle="Update your login password"
        icon={
          <Ico d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <Field
            label="Current Password"
            type="password"
            value={passwords.current}
            onChange={(e) =>
              setPasswords((p) => ({ ...p, current: e.target.value }))
            }
            error={pwdErrors.current}
            required
          />
          <Field
            label="New Password"
            type="password"
            value={passwords.new_password}
            onChange={(e) =>
              setPasswords((p) => ({ ...p, new_password: e.target.value }))
            }
            error={pwdErrors.new_password}
            required
            hint="Minimum 6 characters"
          />
          <Field
            label="Confirm New Password"
            type="password"
            value={passwords.confirm}
            onChange={(e) =>
              setPasswords((p) => ({ ...p, confirm: e.target.value }))
            }
            error={pwdErrors.confirm}
            required
          />
          <div>
            <Btn
              variant="primary"
              onClick={changePassword}
              loading={pwdSaving}
              size="sm"
            >
              Change Password
            </Btn>
          </div>
        </div>
      </SettingsCard>

      {/* ── Activity Log ── */}
      <SettingsCard
        title="Activity Log"
        subtitle={`${logTotal.toLocaleString("en-IN")} total activities recorded`}
        icon={
          <Ico d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        }
        action={
          <>
            <button
              onClick={downloadLogs}
              style={{
                padding: "8px 14px",
                border: "1px solid var(--color-linen)",
                background: "transparent",
                fontSize: "12px",
                cursor: "pointer",
                fontFamily: "var(--font-body)",
                color: "var(--color-navy)",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--color-linen)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              ↓ Download All Logs
            </button>

            <button
              onClick={() => setClearLogsConfirm(true)}
              style={{
                padding: "8px 14px",
                border: "1px solid rgba(192,57,43,0.3)",
                background: "transparent",
                fontSize: "12px",
                cursor: "pointer",
                fontFamily: "var(--font-body)",
                color: "#C0392B",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(192,57,43,0.05)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              X Clear All Logs
            </button>
          </>
        }
      >
        {logLoading ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              color: "var(--color-warm-gray)",
              padding: "20px 0",
            }}
          >
            <Spinner size={16} />
            <span style={{ fontSize: "13px" }}>Loading logs…</span>
          </div>
        ) : logs.length === 0 ? (
          <p
            style={{
              fontSize: "13px",
              color: "var(--color-warm-gray)",
              fontStyle: "italic",
            }}
          >
            No activity recorded yet.
          </p>
        ) : (
          <>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "2px",
                marginBottom: "14px",
              }}
            >
              {logs.map((log, i) => {
                const sectionColor =
                  sectionColors[log.section] || "var(--color-slate)";
                const ts = new Date(log.created_at);
                const timeStr = ts.toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                });
                const dateStr = ts.toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                });
                return (
                  <div
                    key={log.id}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "12px",
                      padding: "10px 12px",
                      background: i % 2 === 0 ? "var(--color-bg)" : "white",
                      border: "1px solid var(--color-linen)",
                      animation: `fadeIn 0.15s ease-out ${Math.min(i * 0.02, 0.3)}s both`,
                    }}
                  >
                    <div
                      style={{
                        width: "3px",
                        alignSelf: "stretch",
                        background: sectionColor,
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontSize: "13px",
                          color: "var(--color-navy)",
                          marginBottom: "2px",
                          lineHeight: "1.5",
                        }}
                      >
                        {log.action}
                      </p>
                      {log.section && (
                        <span
                          style={{
                            fontSize: "10px",
                            padding: "1px 7px",
                            background: sectionColor + "18",
                            color: sectionColor,
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                          }}
                        >
                          {log.section.replace("_", " ")}
                        </span>
                      )}
                    </div>
                    {/* Log Date/Time keeps its alignment naturally */}
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <p
                        style={{
                          fontSize: "11px",
                          color: "var(--color-slate)",
                        }}
                      >
                        {timeStr}
                      </p>
                      <p
                        style={{
                          fontSize: "10px",
                          color: "var(--color-warm-gray)",
                        }}
                      >
                        {dateStr}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Log pagination */}
            {totalLogPages > 1 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "10px",
                }}
              >
                <span
                  style={{ fontSize: "12px", color: "var(--color-warm-gray)" }}
                >
                  Page {logPage} of {totalLogPages} (
                  {logTotal.toLocaleString("en-IN")} entries)
                </span>
                <div style={{ display: "flex", gap: "4px" }}>
                  <button
                    onClick={() => setLogPage((p) => Math.max(1, p - 1))}
                    disabled={logPage === 1}
                    style={{
                      padding: "6px 10px",
                      border: "1px solid var(--color-linen)",
                      background: "transparent",
                      fontSize: "12px",
                      cursor: logPage === 1 ? "not-allowed" : "pointer",
                      color:
                        logPage === 1
                          ? "var(--color-linen)"
                          : "var(--color-navy)",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    ‹ Prev
                  </button>
                  <button
                    onClick={() =>
                      setLogPage((p) => Math.min(totalLogPages, p + 1))
                    }
                    disabled={logPage === totalLogPages}
                    style={{
                      padding: "6px 10px",
                      border: "1px solid var(--color-linen)",
                      background: "transparent",
                      fontSize: "12px",
                      cursor:
                        logPage === totalLogPages ? "not-allowed" : "pointer",
                      color:
                        logPage === totalLogPages
                          ? "var(--color-linen)"
                          : "var(--color-navy)",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    Next ›
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </SettingsCard>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <ConfirmModal
        open={clearLogsConfirm}
        title="Clear all activity logs?"
        message="This will permanently delete all the activity logs. This action cannot be undone. It is recommended to download your logs before clearing them."
        confirmLabel="Yes, Clear All Logs"
        confirmVariant="danger"
        onConfirm={clearAllLogs}
        onCancel={() => setClearLogsConfirm(false)}
      />

      <div
        style={{
          fontSize: "12px",
          alignItems: "center",
          justifyContent: "center",
          display: "flex",
          fontStyle: "Italic",
          marginTop: "20px",
          marginBottom: "20px",
        }}
      >
        ˗ˋˏ Built with love by Jatin ♡ ˎˊ˗
      </div>
    </div>
  );
}
