import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../lib/api";
import {
  fmtDate,
  fmtTime,
  fmtINR,
  fmtWeight,
  monthsElapsed,
  statusConfig,
} from "../lib/format";
import { Btn, Toast, ConfirmModal, Spinner } from "../components/ui/index.jsx";
import { PrintPreviewModal } from "../components/PrintBill.jsx";
import { ClickableImage } from "../components/ImageLightbox.jsx";

/* ── Interest slider ──────────────────────────────── */
function InterestSlider({ jewelType, principal, months, settings }) {
  const isGold = jewelType === "gold";
  const savedRate = isGold
    ? settings?.gold_interest_rate
    : settings?.silver_interest_rate;
  const initialDefault = savedRate ? parseFloat(savedRate) : isGold ? 2.0 : 4.0;
  const [rate, setRate] = useState(initialDefault);

  useEffect(() => {
    setRate(initialDefault);
  }, [initialDefault]);

  const min = isGold ? 0.5 : 3.0;
  const max = isGold ? 4.0 : 6.0;
  const step = 0.1;
  const effectiveMonths = Math.max(1, months);
  const p = parseFloat(principal) || 0;
  const interest = Math.round((p / 100) * rate * effectiveMonths);
  const total = p + interest;

  const fmtAmt = (n) => Math.round(n).toLocaleString("en-IN");
  const pct = ((rate - min) / (max - min)) * 100;

  return (
    <div
      style={{
        border: "1px solid var(--color-linen)",
        padding: "20px",
        background: "#FAFAF8",
      }}
    >
      <p
        style={{
          fontSize: "11px",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--color-slate)",
          marginBottom: "16px",
        }}
      >
        Interest Calculator
      </p>

      {/* Rate slider */}
      <div style={{ marginBottom: "20px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <span style={{ fontSize: "12px", color: "var(--color-warm-gray)" }}>
            Interest Rate
          </span>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "20px",
              color: "var(--color-navy)",
            }}
          >
            {rate.toFixed(1)}%
          </span>
        </div>
        <div
          style={{
            position: "relative",
            height: "24px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              height: "3px",
              background: "var(--color-linen)",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${pct}%`,
                background: "var(--color-navy)",
                transition: "width 0.05s",
              }}
            />
          </div>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={rate}
            onChange={(e) => setRate(parseFloat(e.target.value))}
            style={{
              width: "100%",
              position: "relative",
              zIndex: 2,
              opacity: 0,
              cursor: "pointer",
              height: "24px",
              margin: 0,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: `${pct}%`,
              transform: "translateX(-50%)",
              width: "14px",
              height: "14px",
              background: "var(--color-navy)",
              pointerEvents: "none",
              zIndex: 1,
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "4px",
          }}
        >
          <span style={{ fontSize: "10px", color: "var(--color-warm-gray)" }}>
            {min}%
          </span>
          <span style={{ fontSize: "10px", color: "var(--color-warm-gray)" }}>
            {max}%
          </span>
        </div>
      </div>

      {/* Calculated values */}
      <div className="resp-grid-3" style={{ gap: "10px" }}>
        {[
          { label: "Principal", value: `₹ ${fmtAmt(p)}` },
          {
            label: `Interest (${effectiveMonths} mo.)`,
            value: `₹ ${fmtAmt(interest)}`,
          },
          {
            label: "Total Payable",
            value: `₹ ${fmtAmt(total)}`,
            highlight: true,
          },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              padding: "12px",
              background: item.highlight
                ? "var(--color-navy)"
                : "var(--color-bg)",
              border: `1px solid ${item.highlight ? "var(--color-navy)" : "var(--color-linen)"}`,
            }}
          >
            <div
              style={{
                fontSize: "10px",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: "4px",
                color: item.highlight
                  ? "rgba(255,255,255,0.6)"
                  : "var(--color-slate)",
              }}
            >
              {item.label}
            </div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "18px",
                color: item.highlight ? "#fff" : "var(--color-navy)",
              }}
            >
              {item.value}
            </div>
          </div>
        ))}
      </div>

      <p
        style={{
          fontSize: "11px",
          color: "var(--color-warm-gray)",
          marginTop: "10px",
          fontStyle: "italic",
        }}
      >
        {months === 0 &&
          "Bill is less than 1 month old — using 1 month for calculation."}
      </p>
    </div>
  );
}

/* ── Transaction log entry ────────────────────────── */
function TransactionLog({ tx }) {
  const isInterest = tx.type === "interest";
  return (
    <div
      style={{
        padding: "12px 16px",
        background: isInterest
          ? "var(--color-success-light)"
          : "var(--color-info-light)",
        border: `1px solid ${isInterest ? "rgba(39,174,96,0.25)" : "rgba(36,113,163,0.25)"}`,
        borderLeft: `3px solid ${isInterest ? "#27AE60" : "#2471A3"}`,
        marginBottom: "8px",
        animation: "fadeIn 0.2s ease-out",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "28px",
              height: "28px",
              flexShrink: 0,
              background: isInterest ? "#27AE60" : "#2471A3",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="14"
              height="14"
              fill="none"
              viewBox="0 0 24 24"
              stroke="white"
              strokeWidth="2"
            >
              {isInterest ? (
                <path
                  strokeLinecap="square"
                  d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z"
                />
              ) : (
                <path
                  strokeLinecap="square"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              )}
            </svg>
          </div>
          <span
            style={{
              fontSize: "13px",
              color: isInterest ? "#1e8449" : "#1a5276",
              lineHeight: "1.5",
            }}
          >
            {tx.note}
          </span>
        </div>
        <span
          style={{
            fontSize: "11px",
            color: isInterest ? "#27AE60" : "#2471A3",
            whiteSpace: "nowrap",
          }}
        >
          {new Date(tx.created_at).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </span>
      </div>
    </div>
  );
}

function BillWithSelector({ bill, onUpdate }) {
  const [saving, setSaving] = useState(false);
  const [local, setLocal] = useState(bill.bill_with || "customer");

  useEffect(() => {
    setLocal(bill.bill_with || "customer");
  }, [bill.bill_with]);

  const configs = {
    customer: {
      bg: "#EAF4FB",
      color: "#1a5276",
      border: "rgba(36,113,163,0.25)",
      label: "Bill is with Customer",
    },
    shop: {
      bg: "#FEF9E7",
      color: "#7d6608",
      border: "rgba(214,137,16,0.25)",
      label: "Bill is at Shop",
    },
  };
  const cfg = configs[local] || configs.customer;

  const handleChange = async (val) => {
    setLocal(val);
    setSaving(true);
    try {
      await api.patch(`/api/bills/${bill.id}/bill-with`, { bill_with: val });
      onUpdate(val);
    } catch {
      setLocal(bill.bill_with || "customer");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        padding: "14px 16px",
        marginTop: "10px",
        border: `1px solid ${cfg.border}`,
        background: cfg.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "12px",
      }}
    >
      <div>
        <p
          style={{
            fontSize: "10px",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: cfg.color,
            marginBottom: "3px",
          }}
        >
          Bill Is With
        </p>
        <p style={{ fontSize: "12px", color: cfg.color, opacity: 0.8 }}>
          {local === "customer"
            ? "Customer has taken the bill with them"
            : "Bill is kept safely at the shop"}
        </p>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {saving && (
          <div
            style={{
              width: "14px",
              height: "14px",
              border: `2px solid ${cfg.color}33`,
              borderTop: `2px solid ${cfg.color}`,
              borderRadius: "50%",
              animation: "_spin 0.7s linear infinite",
            }}
          />
        )}
        <select
          value={local}
          onChange={(e) => handleChange(e.target.value)}
          disabled={saving}
          style={{
            padding: "7px 28px 7px 10px",
            fontSize: "12px",
            border: `1px solid ${cfg.border}`,
            background: "white",
            color: cfg.color,
            fontFamily: "var(--font-body)",
            outline: "none",
            cursor: saving ? "not-allowed" : "pointer",
            appearance: "none",
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' fill='none' viewBox='0 0 24 24' stroke='%236E6F73' stroke-width='2'%3E%3Cpath stroke-linecap='square' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 8px center",
          }}
        >
          <option value="customer">Customer</option>
          <option value="shop">Shop</option>
        </select>
      </div>
    </div>
  );
}

/* ── H/S/O Selector ───────────────────────────────── */
function HSOSelector({ bill, onUpdate }) {
  const [saving, setSaving] = useState(false);
  const [localHso, setLocalHso] = useState(bill.hso || "S");

  useEffect(() => {
    setLocalHso(bill.hso || "S");
  }, [bill.hso]);

  const hsoColors = {
    H: {
      bg: "#EAF4FB",
      color: "#1a5276",
      border: "rgba(36,113,163,0.25)",
      label: "H — Home",
    },
    S: {
      bg: "#EAF7EF",
      color: "#1e8449",
      border: "rgba(39,174,96,0.25)",
      label: "S — Shop",
    },
    O: {
      bg: "#FEF9E7",
      color: "#7d6608",
      border: "rgba(214,137,16,0.25)",
      label: "O — Others",
    },
  };
  const cfg = hsoColors[localHso] || hsoColors.S;

  const handleChange = async (val) => {
    setLocalHso(val);
    setSaving(true);
    try {
      await api.patch(`/api/bills/${bill.id}/hso`, { hso: val });
      onUpdate(val);
    } catch {
      setLocalHso(bill.hso || "S"); // revert on error
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        padding: "14px 16px",
        border: `1px solid ${cfg.border}`,
        background: cfg.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "12px",
      }}
    >
      <div>
        <p
          style={{
            fontSize: "10px",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: cfg.color,
            marginBottom: "3px",
          }}
        >
          Storage Location (H/S/O)
        </p>
        <p style={{ fontSize: "12px", color: cfg.color, opacity: 0.8 }}>
          {localHso === "S"
            ? "Principal is below threshold — stored at Shop"
            : localHso === "H"
              ? "Principal is at or above threshold — stored at Home"
              : "Stored at Others (custom location)"}
        </p>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {saving && (
          <div
            style={{
              width: "14px",
              height: "14px",
              border: `2px solid ${cfg.color}33`,
              borderTop: `2px solid ${cfg.color}`,
              borderRadius: "50%",
              animation: "_spin 0.7s linear infinite",
            }}
          />
        )}
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "22px",
            color: cfg.color,
            minWidth: "24px",
            textAlign: "center",
          }}
        >
          {localHso}
        </span>
        <select
          value={localHso}
          onChange={(e) => handleChange(e.target.value)}
          disabled={saving}
          style={{
            padding: "7px 28px 7px 10px",
            fontSize: "12px",
            border: `1px solid ${cfg.border}`,
            background: "white",
            color: cfg.color,
            fontFamily: "var(--font-body)",
            outline: "none",
            cursor: saving ? "not-allowed" : "pointer",
            appearance: "none",
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' fill='none' viewBox='0 0 24 24' stroke='%236E6F73' stroke-width='2'%3E%3Cpath stroke-linecap='square' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 8px center",
          }}
        >
          <option value="S">S — Shop</option>
          <option value="H">H — Home</option>
          <option value="O">O — Others</option>
        </select>
      </div>
    </div>
  );
}

/* ══ Bill Detail Page ════════════════════════════════ */
export default function BillDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bill, setBill] = useState(null);
  const [articles, setArticles] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [relatedBills, setRelatedBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [showPrint, setShowPrint] = useState(false);

  // Transaction inputs
  const [monthsInput, setMonthsInput] = useState("");
  const [principalInput, setPrincipalInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [monthsError, setMonthsError] = useState("");

  const [settings, setSettings] = useState(null);

  const fetchBill = useCallback(async () => {
    setLoading(true);
    try {
      const [billRes, settingsRes] = await Promise.all([
        api.get(`/api/bills/${id}`),
        api.get("/api/settings").catch(() => ({ data: {} })),
      ]);

      setBill(billRes.data);
      setArticles(billRes.data.articles || []);
      setTransactions(billRes.data.transactions || []);
      setRelatedBills(billRes.data.related_bills || []);
      setSettings(settingsRes.data);
    } catch {
      navigate("/database");
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchBill();
  }, [fetchBill]);

  const months = bill ? monthsElapsed(bill.bill_date) : 0;

  const handleInterestPayment = async () => {
    const n = parseInt(monthsInput);
    if (!n || n <= 0 || !Number.isInteger(n)) {
      setMonthsError("Enter a positive whole number");
      return;
    }
    if (n > months) {
      setMonthsError(`Cannot exceed ${months} months elapsed`);
      return;
    }
    setMonthsError("");
    setSubmitting(true);
    try {
      const res = await api.post(`/api/bills/${id}/transactions`, {
        type: "interest",
        months_paid: n,
      });
      setTransactions((p) => [...p, res.data]);
      setMonthsInput("");
      setToast({
        message: `${n} month${n > 1 ? "s" : ""} interest recorded.`,
        type: "success",
      });
    } catch (e) {
      setToast({
        message: e.response?.data?.error || "Failed to record payment.",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrincipalPayment = async () => {
    const amt = parseFloat(principalInput);
    if (!amt || amt <= 0) {
      setToast({ message: "Enter a valid amount.", type: "error" });
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post(`/api/bills/${id}/transactions`, {
        type: "principal",
        amount_paid: amt,
      });
      setTransactions((p) => [...p, res.data]);
      setBill((prev) => ({
        ...prev,
        current_principal: Math.max(
          0,
          parseFloat(prev.current_principal) - amt,
        ),
      }));
      setPrincipalInput("");
      setToast({
        message: `₹ ${amt.toLocaleString("en-IN")} principal payment recorded.`,
        type: "success",
      });
    } catch (e) {
      setToast({
        message: e.response?.data?.error || "Failed to record payment.",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

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
        <Spinner />
        <span>Loading bill…</span>
      </div>
    );
  if (!bill) return null;

  const statusCfg = statusConfig[bill.status] || statusConfig.active;
  const principalEnabled = months === 0;

  return (
    <div style={{ padding: "0 0 60px", background: "var(--color-bg)" }}>
      {/* ── CSS FOR RESPONSIVE GRIDS ── */}
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(5px) } to { opacity:1; transform:translateY(0) } }
        @keyframes _spin  { to { transform:rotate(360deg) } }

        .main-layout { display: grid; grid-template-columns: 1fr; min-height: calc(100vh - 130px); }
        .left-panel { padding: 16px; border-right: none; border-bottom: 1px solid var(--color-linen); overflow-y: auto; }
        .right-panel { padding: 16px; background: #FAFAF8; }
        .header-bar { padding: 16px; border-bottom: 1px solid var(--color-linen); background: var(--color-bg); position: sticky; top: 0; z-index: 20; }
        
        .resp-grid-2 { display: grid; grid-template-columns: 1fr; gap: 16px; }
        .resp-grid-3 { display: grid; grid-template-columns: 1fr; gap: 12px; }

        /* ── Mobile Customer Card ── */
        .customer-card { display: flex; gap: 16px; align-items: flex-start; margin-bottom: 20px; border: 1px solid var(--color-linen); background: white; padding: 16px; }
        .customer-photo-area { flex-shrink: 0; width: 90px; }
        .customer-photo-area img, .customer-photo-area div { width: 100%; height: 90px; object-fit: cover; }
        
        /* This wrapper stacks everything on the right side on mobile */
        .customer-info-wrapper { display: flex; flex-direction: column; gap: 12px; flex: 1; min-width: 0; }
        
        .customer-name-area h2 { font-family: var(--font-display); font-size: 24px; color: var(--color-navy); font-weight: 400; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .customer-name-area p { font-size: 13px; color: var(--color-warm-gray); }
        .customer-contact-area { display: flex; flex-direction: column; gap: 8px; font-size: 13px; color: var(--color-slate); }
        
        /* ── Address & Aadhar Grid ── */
        /* align-items: stretch forces both boxes to be the exact same height */
        .address-aadhar-grid { display: grid; grid-template-columns: 1fr; gap: 16px; align-items: stretch; }
        .info-card { padding: 16px; border: 1px solid var(--color-linen); background: white; display: flex; flex-direction: column; justify-content: center; }
        .info-label { font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--color-slate); margin-bottom: 8px; }
        
        .address-text { font-size: 14px; color: var(--color-navy); line-height: 1.6; max-width: 280px; }
        .aadhar-text { font-size: 16px; color: var(--color-navy); font-family: monospace; letter-spacing: 1px; white-space: nowrap; }
        
        /* Mobile: Number on top, photos side-by-side below */
        .aadhar-flex { display: flex; flex-direction: column; align-items: flex-start; gap: 12px; width: 100%; }
        .aadhar-photos { display: flex; flex-direction: row; gap: 10px; width: 100%; }
        .aadhar-img-wrapper { flex: 1; height: 60px; border: 1px solid var(--color-linen); overflow: hidden; }

        /* ── Desktop Overrides ── */
        @media (min-width: 768px) {
          .main-layout { grid-template-columns: 1fr 320px; }
          .left-panel { padding: 28px; border-right: 1px solid var(--color-linen); border-bottom: none; }
          .right-panel { padding: 20px; }
          .header-bar { padding: 16px 28px; }
          .resp-grid-2 { grid-template-columns: 1fr 1fr; }
          .resp-grid-3 { grid-template-columns: repeat(3, 1fr); }

          /* Desktop Layout for Customer Info */
          .customer-card { align-items: center; padding: 24px; }
          .customer-photo-area { width: 110px; }
          .customer-photo-area img, .customer-photo-area div { height: 110px; }
          .customer-info-wrapper { flex-direction: row; align-items: center; justify-content: space-between; gap: 24px; }
          .customer-name-area { flex: 1; border-right: 1px solid var(--color-linen); padding-right: 24px; }
          
          /* Desktop Font Size Bumps! */
          .customer-name-area h2 { font-size: 28px; }
          .customer-name-area p { font-size: 15px; }
          .customer-contact-area { flex: 1; font-size: 15px; gap: 12px; }
          
          .address-aadhar-grid { grid-template-columns: 1fr 1fr; }
          .address-text { font-size: 15px; line-height: 1.5; }
          .aadhar-text { font-size: 18px; }
          
          /* Desktop Aadhar: Side-by-side */
          .aadhar-flex { flex-direction: row; align-items: center; justify-content: space-between; }
          .aadhar-photos { width: auto; justify-content: flex-end; }
          .aadhar-img-wrapper { flex: none; width: 84px; height: 56px; }
        }
      `}</style>

      {/* Sticky breadcrumb + bill meta bar */}
      <div className="header-bar">
        {/* Breadcrumbs */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            marginBottom: "12px",
            fontSize: "12px",
            flexWrap: "wrap",
          }}
        >
          <Link
            to="/database"
            style={{
              color: "var(--color-slate)",
              textDecoration: "none",
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "var(--color-navy)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "var(--color-slate)")
            }
          >
            Database
          </Link>
          <svg
            width="12"
            height="12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="var(--color-warm-gray)"
            strokeWidth="2"
          >
            <path strokeLinecap="square" d="M9 5l7 7-7 7" />
          </svg>
          <span style={{ color: "var(--color-navy)" }}>{bill.bill_number}</span>
        </div>

        {/* Bill meta */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "22px",
              color: "var(--color-navy)",
            }}
          >
            {bill.bill_number}
          </span>
          <div
            style={{
              display: "flex",
              gap: "16px",
              flexWrap: "wrap",
              fontSize: "12px",
              color: "var(--color-warm-gray)",
            }}
          >
            <span>
              Created:{" "}
              <strong style={{ color: "var(--color-navy)" }}>
                {fmtDate(bill.bill_date)}
              </strong>
            </span>
            <span>
              Time:{" "}
              <strong style={{ color: "var(--color-navy)" }}>
                {bill.bill_time ? bill.bill_time.slice(0, 5) : "—"}
              </strong>
            </span>
            <span>
              Months elapsed:{" "}
              <strong
                style={{ color: months > 6 ? "#C0392B" : "var(--color-navy)" }}
              >
                {months}
              </strong>
            </span>
            <span>
              Type:{" "}
              <strong
                style={{
                  color:
                    bill.jewel_type === "gold"
                      ? "#D4A017"
                      : "var(--color-slate)",
                }}
              >
                {bill.jewel_type?.toUpperCase()}
              </strong>
            </span>
          </div>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              padding: "3px 10px",
              fontSize: "11px",
              background: statusCfg.bg,
              color: statusCfg.color,
              border: `1px solid ${statusCfg.dot}22`,
            }}
          >
            <span
              style={{
                width: "5px",
                height: "5px",
                background: statusCfg.dot,
                display: "inline-block",
              }}
            />
            {statusCfg.label}
          </span>
          <button
            onClick={() => setShowPrint(true)}
            style={{
              padding: "7px 14px",
              border: "1px solid var(--color-linen)",
              background: "transparent",
              fontSize: "12px",
              cursor: "pointer",
              color: "var(--color-navy)",
              fontFamily: "var(--font-body)",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "background 0.15s",
              marginLeft: "auto",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "var(--color-linen)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            <svg
              width="14"
              height="14"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path
                strokeLinecap="square"
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
            Print Bill
          </button>
        </div>
      </div>

      {/* Main layout using CSS class */}
      <div className="main-layout">
        {/* LEFT — main content */}
        <div className="left-panel">
          {/* Customer section */}
          {/* Customer section */}
          <section style={{ marginBottom: "28px" }}>
            <div className="customer-card">
              {/* Column 1: Photo (Left Side Always) */}
              <div className="customer-photo-area">
                {bill.customer_photo_url ? (
                  <ClickableImage
                    src={bill.customer_photo_url}
                    alt="Customer"
                    imgStyle={{
                      border: "1px solid var(--color-linen)",
                      cursor: "zoom-in",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      background: "var(--color-navy)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontFamily: "var(--font-display)",
                      fontSize: "32px",
                    }}
                  >
                    {bill.customer_name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Column 2: Details Wrapper (Stacks on Mobile, Splits on Desktop) */}
              <div className="customer-info-wrapper">
                {/* Name & Relation */}
                <div className="customer-name-area">
                  <h2>
                    {bill.customer_initial} {bill.customer_name}
                  </h2>
                  {bill.relation_type && (
                    <p>
                      {bill.relation_type} {bill.relation_name}
                    </p>
                  )}
                </div>

                {/* Contact Details */}
                <div className="customer-contact-area">
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      color: "var(--color-navy)",
                    }}
                  >
                    <svg
                      width="16"
                      height="16"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      style={{ flexShrink: 0 }}
                    >
                      <path
                        strokeLinecap="square"
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    {bill.customer_mobile}
                    {bill.customer_alt_mobile && (
                      <span
                        style={{
                          color: "var(--color-warm-gray)",
                          marginLeft: "4px",
                        }}
                      >
                        · {bill.customer_alt_mobile}
                      </span>
                    )}
                  </span>

                  {bill.customer_email && (
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        wordBreak: "break-all",
                      }}
                    >
                      <svg
                        width="16"
                        height="16"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        style={{ flexShrink: 0 }}
                      >
                        <path
                          strokeLinecap="square"
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      {bill.customer_email}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Address + ID grid using new equal-height logic */}
            <div className="address-aadhar-grid">
              <div className="info-card">
                <p className="info-label">Address</p>
                <p className="address-text">
                  {[bill.door_no, bill.address, bill.area, bill.pincode]
                    .filter(Boolean)
                    .join(", ") || "—"}
                </p>
              </div>

              <div className="info-card">
                <p className="info-label">Aadhar Number</p>

                {/* Aadhar Flex Layout */}
                <div className="aadhar-flex">
                  <p className="aadhar-text">{bill.aadhar_number || "—"}</p>

                  {(bill.aadhar_front_url || bill.aadhar_back_url) && (
                    <div className="aadhar-photos">
                      {bill.aadhar_front_url && (
                        <div className="aadhar-img-wrapper">
                          <ClickableImage
                            src={bill.aadhar_front_url}
                            alt="Aadhar Front"
                            imgStyle={{
                              height: "100%",
                              width: "100%",
                              objectFit: "cover",
                              cursor: "zoom-in",
                            }}
                          />
                        </div>
                      )}
                      {bill.aadhar_back_url && (
                        <div className="aadhar-img-wrapper">
                          <ClickableImage
                            src={bill.aadhar_back_url}
                            alt="Aadhar Back"
                            imgStyle={{
                              height: "100%",
                              width: "100%",
                              objectFit: "cover",
                              cursor: "zoom-in",
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Interest calculator */}
          <section style={{ marginBottom: "28px" }}>
            <InterestSlider
              jewelType={bill.jewel_type}
              principal={bill.current_principal}
              months={months}
              settings={settings}
            />
          </section>

          {/* Articles */}
          <section style={{ marginBottom: "28px" }}>
            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "18px",
                color: "var(--color-navy)",
                fontWeight: 400,
                marginBottom: "16px",
                paddingBottom: "10px",
                borderBottom: "1px solid var(--color-linen)",
              }}
            >
              Jewel Details
            </h3>

            {/* Total weight banner */}
            <div
              style={{
                background: "var(--color-navy)",
                color: "#fff",
                padding: "10px 16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "12px",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  opacity: 0.65,
                }}
              >
                Total Net Weight
              </span>
              <span
                style={{ fontFamily: "var(--font-display)", fontSize: "20px" }}
              >
                {fmtWeight(bill.total_net_weight)}
              </span>
            </div>

            {articles.map((a, i) => (
              <div
                key={a.id}
                style={{
                  border: "1px solid var(--color-linen)",
                  marginBottom: "10px",
                  background: "white",
                }}
              >
                <div
                  style={{
                    padding: "10px 16px",
                    borderBottom: "1px solid var(--color-linen)",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    background: "var(--color-bg)",
                  }}
                >
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                      background: "var(--color-navy)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontSize: "10px",
                    }}
                  >
                    {i + 1}
                  </div>
                  <span
                    style={{ fontSize: "13px", color: "var(--color-navy)" }}
                  >
                    {a.description || `Article ${i + 1}`}
                  </span>
                </div>
                <div
                  style={{
                    padding: "14px 16px",
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                    gap: "12px",
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontSize: "10px",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: "var(--color-slate)",
                        marginBottom: "3px",
                      }}
                    >
                      Net Weight
                    </p>
                    <p style={{ fontSize: "14px", color: "var(--color-navy)" }}>
                      {fmtWeight(a.net_weight)}
                    </p>
                  </div>
                  <div>
                    <p
                      style={{
                        fontSize: "10px",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: "var(--color-slate)",
                        marginBottom: "3px",
                      }}
                    >
                      Gross Weight
                    </p>
                    <p style={{ fontSize: "14px", color: "var(--color-navy)" }}>
                      {fmtWeight(a.gross_weight)}
                    </p>
                  </div>
                  <div>
                    <p
                      style={{
                        fontSize: "10px",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: "var(--color-slate)",
                        marginBottom: "3px",
                      }}
                    >
                      Purity
                    </p>
                    <p style={{ fontSize: "14px", color: "var(--color-navy)" }}>
                      {a.purity_tag || "—"}
                    </p>
                  </div>
                  {a.description_tags?.length > 0 && (
                    <div style={{ gridColumn: "1/-1" }}>
                      <p
                        style={{
                          fontSize: "10px",
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          color: "var(--color-slate)",
                          marginBottom: "6px",
                        }}
                      >
                        Condition
                      </p>
                      <div
                        style={{
                          display: "flex",
                          gap: "6px",
                          flexWrap: "wrap",
                        }}
                      >
                        {a.description_tags.map((t) => (
                          <span
                            key={t}
                            style={{
                              padding: "3px 9px",
                              fontSize: "11px",
                              background: "var(--color-linen)",
                              color: "var(--color-navy)",
                              border: "1px solid var(--color-linen)",
                            }}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {(a.image_urls && a.image_urls.length > 0
                    ? a.image_urls
                    : a.image_url
                      ? [a.image_url]
                      : []
                  ).length > 0 && (
                    <div
                      style={{
                        gridColumn: "1/-1",
                        display: "flex",
                        gap: "8px",
                        flexWrap: "wrap",
                      }}
                    >
                      {(a.image_urls && a.image_urls.length > 0
                        ? a.image_urls
                        : a.image_url
                          ? [a.image_url]
                          : []
                      ).map((url, idx) => (
                        <ClickableImage
                          key={idx}
                          src={url}
                          alt={`Article photo ${idx + 1}`}
                          imgStyle={{
                            height: "80px",
                            width: "80px",
                            objectFit: "cover",
                            border: "1px solid var(--color-linen)",
                            cursor: "zoom-in",
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </section>

          {/* Amounts + H/S/O */}
          <section style={{ marginBottom: "28px" }}>
            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "18px",
                color: "var(--color-navy)",
                fontWeight: 400,
                marginBottom: "16px",
                paddingBottom: "10px",
                borderBottom: "1px solid var(--color-linen)",
              }}
            >
              Amount Details
            </h3>
            <div className="resp-grid-3" style={{ marginBottom: "12px" }}>
              {[
                {
                  label: "Original Principal",
                  value: fmtINR(bill.principal_amount),
                },
                {
                  label: "Current Principal",
                  value: fmtINR(bill.current_principal),
                  highlight: bill.current_principal < bill.principal_amount,
                },
                { label: "Present Value", value: fmtINR(bill.present_value) },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    padding: "14px",
                    border: "1px solid var(--color-linen)",
                    background: "white",
                  }}
                >
                  <p
                    style={{
                      fontSize: "10px",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "var(--color-slate)",
                      marginBottom: "4px",
                    }}
                  >
                    {item.label}
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "20px",
                      color: item.highlight ? "#2471A3" : "var(--color-navy)",
                    }}
                  >
                    {item.value}
                  </p>
                  {item.highlight && (
                    <p
                      style={{
                        fontSize: "10px",
                        color: "#2471A3",
                        marginTop: "2px",
                      }}
                    >
                      Partial payments made
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* H/S/O selector */}
            <HSOSelector
              bill={bill}
              onUpdate={(newHso) =>
                setBill((prev) => ({ ...prev, hso: newHso }))
              }
            />
            <BillWithSelector
              bill={bill}
              onUpdate={(val) =>
                setBill((prev) => ({ ...prev, bill_with: val }))
              }
            />
          </section>

          {/* Transaction history */}
          <section>
            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "18px",
                color: "var(--color-navy)",
                fontWeight: 400,
                marginBottom: "6px",
                paddingBottom: "10px",
                borderBottom: "1px solid var(--color-linen)",
              }}
            >
              Payments & Transaction History
            </h3>

            {bill.status === "active" && (
              <div
                className="resp-grid-2"
                style={{
                  marginBottom: "20px",
                  marginTop: "16px",
                }}
              >
                {/* Interest payment */}
                <div
                  style={{
                    padding: "16px",
                    border: "1px solid rgba(39,174,96,0.25)",
                    background: "#F8FEF9",
                  }}
                >
                  <p
                    style={{
                      fontSize: "11px",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "#27AE60",
                      marginBottom: "10px",
                    }}
                  >
                    Pay Interest
                  </p>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "var(--color-warm-gray)",
                      marginBottom: "10px",
                      lineHeight: "1.5",
                    }}
                  >
                    Months elapsed:{" "}
                    <strong style={{ color: "var(--color-navy)" }}>
                      {months}
                    </strong>
                  </p>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input
                      type="number"
                      min="1"
                      max={months}
                      placeholder="No. of months"
                      value={monthsInput}
                      onChange={(e) => {
                        setMonthsInput(e.target.value);
                        setMonthsError("");
                      }}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleInterestPayment()
                      }
                      style={{
                        flex: 1,
                        padding: "9px 10px",
                        border: `1px solid ${monthsError ? "#C0392B" : "rgba(39,174,96,0.4)"}`,
                        background: "var(--color-bg)",
                        fontSize: "13px",
                        fontFamily: "var(--font-body)",
                        outline: "none",
                      }}
                    />
                    <button
                      onClick={handleInterestPayment}
                      disabled={submitting || months === 0}
                      style={{
                        padding: "9px 14px",
                        background:
                          months === 0 ? "var(--color-linen)" : "#27AE60",
                        color: "#fff",
                        border: "none",
                        cursor: months === 0 ? "not-allowed" : "pointer",
                        fontSize: "12px",
                        fontFamily: "var(--font-body)",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      Record
                    </button>
                  </div>
                  {monthsError && (
                    <p
                      style={{
                        fontSize: "11px",
                        color: "#C0392B",
                        marginTop: "4px",
                      }}
                    >
                      {monthsError}
                    </p>
                  )}
                  {months === 0 && (
                    <p
                      style={{
                        fontSize: "11px",
                        color: "var(--color-warm-gray)",
                        marginTop: "4px",
                      }}
                    >
                      No interest yet — bill is less than 1 month old
                    </p>
                  )}
                </div>

                {/* Principal payment */}
                <div
                  style={{
                    padding: "16px",
                    border: `1px solid ${principalEnabled ? "rgba(36,113,163,0.25)" : "var(--color-linen)"}`,
                    background: principalEnabled
                      ? "#F8FBFE"
                      : "var(--color-linen)",
                  }}
                >
                  <p
                    style={{
                      fontSize: "11px",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: principalEnabled
                        ? "#2471A3"
                        : "var(--color-warm-gray)",
                      marginBottom: "10px",
                    }}
                  >
                    Pay Principal
                  </p>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "var(--color-warm-gray)",
                      marginBottom: "10px",
                      lineHeight: "1.5",
                    }}
                  >
                    {principalEnabled
                      ? `Current balance: ${fmtINR(bill.current_principal)}`
                      : "Available only when months elapsed is 0"}
                  </p>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <div style={{ flex: 1, display: "flex" }}>
                      <span
                        style={{
                          padding: "0 8px",
                          background: "var(--color-linen)",
                          border: "1px solid var(--color-linen)",
                          borderRight: "none",
                          display: "flex",
                          alignItems: "center",
                          fontSize: "12px",
                          color: "var(--color-warm-gray)",
                        }}
                      >
                        ₹
                      </span>
                      <input
                        type="number"
                        min="1"
                        placeholder="Amount"
                        value={principalInput}
                        onChange={(e) => setPrincipalInput(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" &&
                          principalEnabled &&
                          handlePrincipalPayment()
                        }
                        disabled={!principalEnabled}
                        style={{
                          flex: 1,
                          padding: "9px 10px",
                          border: `1px solid ${principalEnabled ? "rgba(36,113,163,0.4)" : "var(--color-linen)"}`,
                          background: principalEnabled
                            ? "var(--color-bg)"
                            : "var(--color-linen)",
                          fontSize: "13px",
                          fontFamily: "var(--font-body)",
                          outline: "none",
                          cursor: principalEnabled ? "text" : "not-allowed",
                        }}
                      />
                    </div>
                    <button
                      onClick={handlePrincipalPayment}
                      disabled={!principalEnabled || submitting}
                      style={{
                        padding: "9px 14px",
                        background: !principalEnabled
                          ? "var(--color-linen)"
                          : "#2471A3",
                        color: !principalEnabled
                          ? "var(--color-warm-gray)"
                          : "#fff",
                        border: "none",
                        cursor: !principalEnabled ? "not-allowed" : "pointer",
                        fontSize: "12px",
                        fontFamily: "var(--font-body)",
                      }}
                    >
                      Record
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Transaction logs */}
            {transactions.length === 0 ? (
              <p
                style={{
                  fontSize: "13px",
                  color: "var(--color-warm-gray)",
                  fontStyle: "italic",
                  paddingTop: "8px",
                }}
              >
                No transactions recorded yet.
              </p>
            ) : (
              <div style={{ marginTop: "4px" }}>
                {transactions.map((tx) => (
                  <TransactionLog key={tx.id} tx={tx} />
                ))}
              </div>
            )}
          </section>
        </div>

        {/* RIGHT — related bills panel */}
        <div className="right-panel">
          {/* ── NEW: TOTAL ACTIVE EXPOSURE SUMMARY ── */}
          {(() => {
            // Calculate total active pledge (current bill + related active bills)
            const activeRelatedTotal = relatedBills
              .filter((rb) => rb.status === "active")
              .reduce(
                (sum, rb) => sum + (parseFloat(rb.principal_amount) || 0),
                0,
              );

            const currentActiveTotal =
              bill.status === "active"
                ? parseFloat(bill.principal_amount) || 0
                : 0;
            const totalActiveExposure = currentActiveTotal + activeRelatedTotal;

            if (totalActiveExposure > 0) {
              return (
                <div
                  style={{
                    marginBottom: "20px",
                    padding: "16px",
                    background: "#EAF4FB",
                    border: "1px solid rgba(36,113,163,0.2)",
                  }}
                >
                  <p
                    style={{
                      fontSize: "10px",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "#1a5276",
                      marginBottom: "4px",
                    }}
                  >
                    Total Active Exposure
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "24px",
                      color: "#1a5276",
                      margin: 0,
                    }}
                  >
                    {fmtINR(totalActiveExposure)}
                  </p>
                  <p
                    style={{
                      fontSize: "11px",
                      color: "rgba(26,82,118,0.7)",
                      marginTop: "4px",
                      margin: 0,
                    }}
                  >
                    Across all active bills for this customer
                  </p>
                </div>
              );
            }
            return null;
          })()}

          <p
            style={{
              fontSize: "11px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--color-slate)",
              marginBottom: "14px",
            }}
          >
            Other Bills — {bill.customer_name}
          </p>

          {relatedBills.length === 0 ? (
            <p
              style={{
                fontSize: "13px",
                color: "var(--color-warm-gray)",
                fontStyle: "italic",
              }}
            >
              No other bills for this customer.
            </p>
          ) : (
            relatedBills.map((rb) => {
              const cfg = statusConfig[rb.status] || statusConfig.active;
              return (
                <Link
                  key={rb.id}
                  to={`/database/${rb.id}`}
                  style={{
                    display: "block",
                    padding: "12px",
                    marginBottom: "8px",
                    border: "1px solid var(--color-linen)",
                    background: "white",
                    textDecoration: "none",
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#F5F3EF")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "white")
                  }
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "6px",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "15px",
                        color: "var(--color-navy)",
                      }}
                    >
                      {rb.bill_number}
                    </span>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "2px 7px",
                        fontSize: "10px",
                        background: cfg.bg,
                        color: cfg.color,
                      }}
                    >
                      <span
                        style={{
                          width: "4px",
                          height: "4px",
                          background: cfg.dot,
                          display: "inline-block",
                        }}
                      />
                      {cfg.label}
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "var(--color-slate)",
                      marginBottom: "4px",
                    }}
                  >
                    {fmtINR(rb.principal_amount)}
                  </p>
                  <p
                    style={{
                      fontSize: "11px",
                      color: "var(--color-warm-gray)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {rb.article_descriptions || "—"}
                  </p>
                  <p
                    style={{
                      fontSize: "10px",
                      color: "rgba(110,111,115,0.6)",
                      marginTop: "4px",
                    }}
                  >
                    {fmtDate(rb.bill_date)}
                  </p>
                </Link>
              );
            })
          )}
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Print Preview */}
      {showPrint && bill && (
        <PrintPreviewModal
          bill={bill}
          articles={articles}
          settings={settings}
          onClose={() => setShowPrint(false)}
        />
      )}
    </div>
  );
}
