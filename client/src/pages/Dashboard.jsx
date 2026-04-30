import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import api from "../lib/api";
import { fmtINR } from "../lib/format";
import { Spinner } from "../components/ui/index.jsx";

/* ─── helpers ─────────────────────────────────────── */
const fmtMonth = (m) => {
  if (!m) return "";
  const [y, mo] = m.split("-");
  const names = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${names[parseInt(mo) - 1]} ${y.slice(2)}`;
};

const compactINR = (n) => {
  if (!n && n !== 0) return "—";
  const num = parseFloat(n);
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
  if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`;
  return `₹${Math.round(num).toLocaleString("en-IN")}`;
};

/* ─── Stat card ───────────────────────────────────── */
function StatCard({ label, value, sub, accent, icon, delay = 0 }) {
  return (
    <div
      style={{
        padding: "20px",
        background: "white",
        border: "1px solid var(--color-linen)",
        borderTop: `3px solid ${accent || "var(--color-navy)"}`,
        animation: `fadeUp 0.35s ease-out ${delay}s both`,
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <p
          style={{
            fontSize: "10px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--color-slate)",
          }}
        >
          {label}
        </p>
        {icon && (
          <span style={{ color: accent || "var(--color-linen)", opacity: 0.7 }}>
            {icon}
          </span>
        )}
      </div>
      <p
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "28px",
          color: "var(--color-navy)",
          lineHeight: 1,
        }}
      >
        {value ?? "—"}
      </p>
      {sub && (
        <p style={{ fontSize: "11px", color: "var(--color-warm-gray)" }}>
          {sub}
        </p>
      )}
    </div>
  );
}

/* ─── Today stat card ─────────────────────────────── */
function TodayCard({ label, value, color, delay = 0 }) {
  return (
    <div
      style={{
        padding: "16px 20px",
        border: "1px solid var(--color-linen)",
        background: "white",
        animation: `fadeUp 0.35s ease-out ${delay}s both`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <span style={{ fontSize: "13px", color: "var(--color-warm-gray)" }}>
        {label}
      </span>
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "22px",
          color: color || "var(--color-navy)",
        }}
      >
        {value}
      </span>
    </div>
  );
}

/* ─── Custom tooltip for charts ───────────────────── */
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "var(--color-navy)",
        color: "#fff",
        padding: "10px 14px",
        fontSize: "12px",
        border: "none",
        boxShadow: "0 4px 16px rgba(47,58,85,0.2)",
      }}
    >
      <p
        style={{
          marginBottom: "6px",
          opacity: 0.7,
          fontSize: "11px",
          letterSpacing: "0.06em",
        }}
      >
        {label}
      </p>
      {payload.map((p, i) => (
        <p
          key={i}
          style={{
            display: "flex",
            gap: "8px",
            alignItems: "center",
            marginBottom: "2px",
          }}
        >
          <span
            style={{
              width: "8px",
              height: "8px",
              background: p.color,
              display: "inline-block",
              flexShrink: 0,
            }}
          />
          {p.name}:{" "}
          <strong>
            {p.name.includes("Amount") ? compactINR(p.value) : p.value}
          </strong>
        </p>
      ))}
    </div>
  );
}

/* ─── Section header ──────────────────────────────── */
function SectionHeader({ title, subtitle }) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "20px",
          color: "var(--color-navy)",
          fontWeight: 400,
          marginBottom: "2px",
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <p style={{ fontSize: "12px", color: "var(--color-warm-gray)" }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

/* ─── Icon helper ─────────────────────────────────── */
const Ico = ({ d, size = 18, color = "currentColor" }) => (
  <svg
    width={size}
    height={size}
    fill="none"
    viewBox="0 0 24 24"
    stroke={color}
    strokeWidth="1.5"
  >
    <path strokeLinecap="square" d={d} />
  </svg>
);

/* ══ Dashboard Page ═══════════════════════════════════ */
export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [customFrom, setCustomFrom] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split("T")[0];
  });
  const [customTo, setCustomTo] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [customStats, setCustomStats] = useState(null);
  const [customLoading, setCustomLoading] = useState(false);
  const [chartView, setChartView] = useState("bills"); // 'bills' | 'amount'

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/dashboard");
      setStats(res.data);
    } catch {
      /* silently fail, stats just show — */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const fetchCustom = async () => {
    if (!customFrom || !customTo) return;
    setCustomLoading(true);
    try {
      const res = await api.get(
        `/api/dashboard/custom?from=${customFrom}&to=${customTo}`,
      );
      setCustomStats(res.data);
    } catch {
      /* noop */
    } finally {
      setCustomLoading(false);
    }
  };

  useEffect(() => {
    fetchCustom();
  }, [customFrom, customTo]);

  const downloadStats = () => {
    if (!stats) return;
    const rows = [
      ["Metric", "Value"],
      ["Total Bills", stats.total_bills],
      ["Active Bills", stats.active_bills],
      ["Released Bills", stats.released_bills],
      ["Total Pledge Amount Ever", stats.total_pledge_ever],
      ["Active Pledge Amount", stats.active_pledge],
      ["Released Pledge Amount", stats.released_pledge],
      ["Total Customers", stats.total_customers],
      ["Today — Bills Created", stats.today_created],
      ["Today — Bills Released", stats.today_released],
      ["Today — Pledge Amount", stats.today_pledge],
      ["Today — Released Amount", stats.today_released_pledge],
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vaulta-stats-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const chartData = (stats?.monthly_chart || []).map((m) => ({
    ...m,
    monthLabel: fmtMonth(m.month),
  }));

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "300px",
          gap: "12px",
          color: "var(--color-warm-gray)",
        }}
      >
        <Spinner size={20} />
        <span style={{ fontSize: "14px" }}>Loading dashboard…</span>
      </div>
    );

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div
      style={{
        padding: "28px 32px 0px",
        background: "var(--color-bg)",
        minHeight: "100%",
      }}
    >
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes _spin  { to { transform:rotate(360deg) } }
      `}</style>

      {/* ── Page header ── */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: "32px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "28px",
              color: "var(--color-navy)",
              fontWeight: 400,
              marginBottom: "4px",
            }}
          >
            Dashboard
          </h1>
          <p style={{ fontSize: "13px", color: "var(--color-warm-gray)" }}>
            {today}
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button
            onClick={downloadStats}
            style={{
              padding: "9px 16px",
              border: "1px solid var(--color-linen)",
              background: "transparent",
              color: "var(--color-navy)",
              fontSize: "12px",
              cursor: "pointer",
              fontFamily: "var(--font-body)",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              letterSpacing: "0.03em",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "var(--color-linen)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            <Ico
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              size={14}
            />
            Download Stats
          </button>
          <button
            onClick={() => navigate("/new-bill")}
            style={{
              padding: "9px 16px",
              border: "none",
              background: "var(--color-navy)",
              color: "#fff",
              fontSize: "12px",
              cursor: "pointer",
              fontFamily: "var(--font-body)",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "var(--color-slate)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "var(--color-navy)")
            }
          >
            <Ico d="M12 4v16m8-8H4" size={14} color="#fff" />
            New Bill
          </button>
        </div>
      </div>

      {/* ── All-time stats grid ── */}
      <div style={{ marginBottom: "36px" }}>
        <SectionHeader
          title="All Time"
          subtitle="Cumulative stats across your entire business"
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "12px",
            marginBottom: "12px",
          }}
        >
          <StatCard
            label="Total Bills"
            value={(stats?.total_bills ?? 0).toLocaleString("en-IN")}
            accent="#2F3A55"
            sub="Bills ever created"
            icon={
              <Ico
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                size={20}
              />
            }
            delay={0.0}
          />
          <StatCard
            label="Active Bills"
            value={(stats?.active_bills ?? 0).toLocaleString("en-IN")}
            accent="#2471A3"
            sub="Currently pledged"
            icon={
              <Ico
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                size={20}
                color="#2471A3"
              />
            }
            delay={0.05}
          />
          <StatCard
            label="Released Bills"
            value={(stats?.released_bills ?? 0).toLocaleString("en-IN")}
            accent="#27AE60"
            sub="Pledges closed"
            icon={
              <Ico
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                size={20}
                color="#27AE60"
              />
            }
            delay={0.1}
          />
          <StatCard
            label="Total Customers"
            value={(stats?.total_customers ?? 0).toLocaleString("en-IN")}
            accent="#5C6B8A"
            sub="Unique customers"
            icon={
              <Ico
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                size={20}
                color="#5C6B8A"
              />
            }
            delay={0.15}
          />
        </div>

        {/* Amount stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "12px",
          }}
        >
          <StatCard
            label="Total Pledge Ever"
            value={compactINR(stats?.total_pledge_ever)}
            accent="#2F3A55"
            sub={`Full amount: ${fmtINR(stats?.total_pledge_ever)}`}
            delay={0.2}
          />
          <StatCard
            label="Active Pledge Amount"
            value={compactINR(stats?.active_pledge)}
            accent="#2471A3"
            sub={fmtINR(stats?.active_pledge)}
            delay={0.25}
          />
          <StatCard
            label="Released Pledge Amount"
            value={compactINR(stats?.released_pledge)}
            accent="#27AE60"
            sub={fmtINR(stats?.released_pledge)}
            delay={0.3}
          />
        </div>
      </div>

      {/* ── Today's stats ── */}
      <div style={{ marginBottom: "36px" }}>
        <SectionHeader title="Today" subtitle="Activity recorded today" />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "10px",
          }}
        >
          <TodayCard
            label="Bills Created"
            value={(stats?.today_created ?? 0).toLocaleString("en-IN")}
            color="var(--color-navy)"
            delay={0.0}
          />
          <TodayCard
            label="Bills Released"
            value={(stats?.today_released ?? 0).toLocaleString("en-IN")}
            color="#27AE60"
            delay={0.05}
          />
          <TodayCard
            label="Pledge Amount In"
            value={compactINR(stats?.today_pledge)}
            color="var(--color-navy)"
            delay={0.1}
          />
          <TodayCard
            label="Pledge Amount Out"
            value={compactINR(stats?.today_released_pledge)}
            color="#C0392B"
            delay={0.15}
          />
        </div>
      </div>

      {/* ── Custom date range ── */}
      <div style={{ marginBottom: "36px" }}>
        <SectionHeader
          title="Custom Date Range"
          subtitle="View stats for any time period"
        />
        <div
          style={{
            border: "1px solid var(--color-linen)",
            background: "white",
            padding: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "flex-end",
              flexWrap: "wrap",
              marginBottom: customStats ? "20px" : "0",
            }}
          >
            {[
              { label: "From", val: customFrom, set: setCustomFrom },
              { label: "To", val: customTo, set: setCustomTo },
            ].map((f) => (
              <div key={f.label}>
                <label
                  style={{
                    display: "block",
                    fontSize: "10px",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--color-slate)",
                    marginBottom: "6px",
                  }}
                >
                  {f.label}
                </label>
                <input
                  type="date"
                  value={f.val}
                  onChange={(e) => f.set(e.target.value)}
                  style={{
                    padding: "9px 12px",
                    border: "1px solid var(--color-linen)",
                    background: "var(--color-bg)",
                    fontSize: "13px",
                    fontFamily: "var(--font-body)",
                    outline: "none",
                    color: "var(--color-navy)",
                  }}
                  onFocus={(e) =>
                    (e.target.style.borderColor = "var(--color-slate)")
                  }
                  onBlur={(e) =>
                    (e.target.style.borderColor = "var(--color-linen)")
                  }
                />
              </div>
            ))}
            <button
              onClick={fetchCustom}
              style={{
                padding: "9px 18px",
                background: "var(--color-navy)",
                color: "#fff",
                border: "none",
                fontSize: "12px",
                cursor: "pointer",
                fontFamily: "var(--font-body)",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--color-slate)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "var(--color-navy)")
              }
            >
              {customLoading ? (
                <Spinner size={14} color="#fff" />
              ) : (
                <Ico
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  size={14}
                  color="#fff"
                />
              )}
              Apply
            </button>
          </div>

          {customStats && !customLoading && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "12px",
                animation: "fadeIn 0.25s ease-out",
              }}
            >
              {[
                {
                  label: "Bills Created",
                  value:
                    customStats.bills_created?.toLocaleString("en-IN") || "0",
                  color: "var(--color-navy)",
                },
                {
                  label: "Bills Released",
                  value:
                    customStats.bills_released?.toLocaleString("en-IN") || "0",
                  color: "#27AE60",
                },
                {
                  label: "Pledge Amount",
                  value: compactINR(customStats.pledge_amount),
                  color: "var(--color-navy)",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    padding: "14px",
                    border: "1px solid var(--color-linen)",
                    background: "var(--color-bg)",
                  }}
                >
                  <p
                    style={{
                      fontSize: "10px",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "var(--color-slate)",
                      marginBottom: "6px",
                    }}
                  >
                    {item.label}
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "24px",
                      color: item.color,
                    }}
                  >
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Charts ── */}
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "16px",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <SectionHeader
            title="Monthly Trends"
            subtitle="Last 12 months of activity"
          />
          {/* Chart type toggle */}
          <div
            style={{
              display: "flex",
              border: "1px solid var(--color-linen)",
              overflow: "hidden",
            }}
          >
            {[
              { val: "bills", label: "Bills" },
              { val: "amount", label: "Amount" },
            ].map((t) => (
              <button
                key={t.val}
                onClick={() => setChartView(t.val)}
                style={{
                  padding: "7px 16px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontFamily: "var(--font-body)",
                  background:
                    chartView === t.val ? "var(--color-navy)" : "transparent",
                  color:
                    chartView === t.val ? "#fff" : "var(--color-warm-gray)",
                  transition: "all 0.15s",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {chartData.length === 0 ? (
          <div
            style={{
              border: "1px solid var(--color-linen)",
              padding: "60px",
              textAlign: "center",
              background: "white",
            }}
          >
            <p style={{ color: "var(--color-warm-gray)", fontSize: "14px" }}>
              No data yet. Create bills to see trends appear here.
            </p>
          </div>
        ) : (
          <div
            style={{
              border: "1px solid var(--color-linen)",
              background: "white",
              padding: "24px",
            }}
          >
            {chartView === "bills" ? (
              <>
                {/* Bills created vs released — Area chart */}
                <p
                  style={{
                    fontSize: "11px",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--color-slate)",
                    marginBottom: "20px",
                  }}
                >
                  Bills Created vs Released
                </p>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart
                    data={chartData}
                    margin={{ top: 0, right: 0, left: -10, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="gradCreated"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#2F3A55"
                          stopOpacity={0.15}
                        />
                        <stop
                          offset="95%"
                          stopColor="#2F3A55"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient
                        id="gradReleased"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#27AE60"
                          stopOpacity={0.15}
                        />
                        <stop
                          offset="95%"
                          stopColor="#27AE60"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      stroke="#E7E2DE"
                      strokeDasharray="3 3"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="monthLabel"
                      tick={{
                        fontSize: 11,
                        fill: "#6E6F73",
                        fontFamily: "var(--font-body)",
                      }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{
                        fontSize: 11,
                        fill: "#6E6F73",
                        fontFamily: "var(--font-body)",
                      }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      wrapperStyle={{
                        fontSize: "11px",
                        color: "var(--color-warm-gray)",
                        paddingTop: "12px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="created"
                      name="Created"
                      stroke="#2F3A55"
                      strokeWidth={2}
                      fill="url(#gradCreated)"
                      dot={false}
                      activeDot={{ r: 4, fill: "#2F3A55" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="released"
                      name="Released"
                      stroke="#27AE60"
                      strokeWidth={2}
                      fill="url(#gradReleased)"
                      dot={false}
                      activeDot={{ r: 4, fill: "#27AE60" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </>
            ) : (
              <>
                {/* Pledge amount — Bar chart */}
                <p
                  style={{
                    fontSize: "11px",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--color-slate)",
                    marginBottom: "20px",
                  }}
                >
                  Pledge Amount by Month
                </p>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart
                    data={chartData}
                    margin={{ top: 0, right: 0, left: -10, bottom: 0 }}
                    barSize={18}
                  >
                    <CartesianGrid
                      stroke="#E7E2DE"
                      strokeDasharray="3 3"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="monthLabel"
                      tick={{
                        fontSize: 11,
                        fill: "#6E6F73",
                        fontFamily: "var(--font-body)",
                      }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{
                        fontSize: 11,
                        fill: "#6E6F73",
                        fontFamily: "var(--font-body)",
                      }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => compactINR(v).replace("₹", "")}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="pledge" name="Pledge Amount" fill="#2F3A55" />
                  </BarChart>
                </ResponsiveContainer>
              </>
            )}
          </div>
        )}

        {/* Quick nav cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "10px",
            marginTop: "24px",
          }}
        >
          {[
            {
              label: "View all bills",
              desc: "Open the full database",
              path: "/database",
              d: "M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4M4 7v5m16-5v5M4 12c0 2.21 3.582 4 8 4s8-1.79 8-4M4 12v5c0 2.21 3.582 4 8 4s8-1.79 8-4v-5",
            },
            {
              label: "View customers",
              desc: "Browse customer profiles",
              path: "/customers",
              d: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
            },
            {
              label: "Create new bill",
              desc: "Add a new pledge bill",
              path: "/new-bill",
              d: "M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z",
            },
          ].map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                padding: "16px",
                border: "1px solid var(--color-linen)",
                background: "white",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                textAlign: "left",
                fontFamily: "var(--font-body)",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--color-navy)";
                e.currentTarget.style.borderColor = "var(--color-navy)";
                e.currentTarget
                  .querySelectorAll("p,svg")
                  .forEach((el) => (el.style.color = "#fff"));
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "white";
                e.currentTarget.style.borderColor = "var(--color-linen)";
                e.currentTarget
                  .querySelectorAll("p,svg")
                  .forEach((el) => (el.style.color = ""));
              }}
            >
              <Ico d={item.d} size={18} />
              <div>
                <p
                  style={{
                    fontSize: "13px",
                    color: "var(--color-navy)",
                    marginBottom: "2px",
                  }}
                >
                  {item.label}
                </p>
                <p
                  style={{ fontSize: "11px", color: "var(--color-warm-gray)" }}
                >
                  {item.desc}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
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
