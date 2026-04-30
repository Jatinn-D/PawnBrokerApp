import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { useDebounce } from "../hooks/useDebounce";
import { fmtINR } from "../lib/format";
import { Spinner, Toast } from "../components/ui/index.jsx";

/* ── Rating display ───────────────────────────────── */
function RatingBadge({ rating }) {
  const r = parseFloat(rating) || 1;
  const getColor = () => {
    if (r >= 7)
      return {
        bg: "#EAF7EF",
        color: "#1e8449",
        border: "rgba(39,174,96,0.25)",
      };
    if (r >= 4)
      return {
        bg: "#FEF9E7",
        color: "#7d6608",
        border: "rgba(214,137,16,0.25)",
      };
    return { bg: "#FEF0F0", color: "#922b21", border: "rgba(192,57,43,0.25)" };
  };
  const c = getColor();
  return (
    <div
      style={{
        width: "44px",
        height: "44px",
        flexShrink: 0,
        background: c.bg,
        border: `2px solid ${c.border}`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "18px",
          color: c.color,
          lineHeight: 1,
        }}
      >
        {r.toFixed(1)}
      </span>
      <span
        style={{
          fontSize: "8px",
          color: c.color,
          letterSpacing: "0.04em",
          opacity: 0.8,
        }}
      >
        /10
      </span>
    </div>
  );
}

/* ── Rating label ─────────────────────────────────── */
function ratingLabel(r) {
  if (r >= 8) return "Excellent";
  if (r >= 6) return "Good";
  if (r >= 4) return "Average";
  if (r > 1) return "Poor";
  return "New";
}

/* ── Helper to format large numbers concisely (e.g., 91K) ── */
function formatK(num) {
  if (!num) return "—";
  if (num >= 1000) {
    return `₹${Math.round(num / 1000)}K`;
  }
  return `₹${num}`;
}

/* ── Customer Card ────────────────────────────────── */
function CustomerCard({ customer, onSelect }) {
  const [hovered, setHovered] = useState(false);

  // Calculate released amount on the frontend
  const releasedPledgeAmount = Math.max(
    0,
    (customer.lifetime_pledge_amount || 0) -
      (customer.active_pledge_amount || 0),
  );

  return (
    <div
      onClick={() => onSelect(customer)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        border: `1px solid ${hovered ? "var(--color-slate)" : "var(--color-linen)"}`,
        background: hovered ? "#FAFAF8" : "white",
        cursor: "pointer",
        transition: "all 0.15s",
        animation: "fadeIn 0.2s ease-out",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Card top — photo + name + rating */}
      <div
        style={{
          padding: "16px 16px 12px",
          display: "flex",
          alignItems: "flex-start",
          gap: "12px",
          borderBottom: "1px solid var(--color-linen)",
        }}
      >
        {/* Photo or initial */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          {customer.photo_url ? (
            <img
              src={customer.photo_url}
              alt={customer.name}
              style={{
                width: "52px",
                height: "52px",
                objectFit: "cover",
                border: "1px solid var(--color-linen)",
              }}
            />
          ) : (
            <div
              style={{
                width: "52px",
                height: "52px",
                background: "var(--color-navy)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontFamily: "var(--font-display)",
                fontSize: "20px",
              }}
            >
              {(
                customer.initial?.replace(".", "") ||
                customer.name?.charAt(0) ||
                "?"
              ).toUpperCase()}
            </div>
          )}
        </div>

        {/* Name + mobile + rating label */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "8px",
            }}
          >
            <div style={{ minWidth: 0 }}>
              <h3
                style={{
                  fontSize: "14px",
                  color: "var(--color-navy)",
                  marginBottom: "2px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {customer.initial} {customer.name}
              </h3>
              <p style={{ fontSize: "12px", color: "var(--color-slate)" }}>
                {customer.mobile}
              </p>
            </div>
            <RatingBadge rating={customer.rating} />
          </div>
          <p style={{ fontSize: "11px", marginTop: "4px" }}>
            <span
              style={{
                padding: "2px 8px",
                fontSize: "10px",
                letterSpacing: "0.04em",
                ...(() => {
                  const r = parseFloat(customer.rating);
                  if (r >= 7)
                    return { background: "#EAF7EF", color: "#1e8449" };
                  if (r >= 4)
                    return { background: "#FEF9E7", color: "#7d6608" };
                  return { background: "#FEF0F0", color: "#922b21" };
                })(),
              }}
            >
              {ratingLabel(parseFloat(customer.rating))}
            </span>
          </p>
        </div>
      </div>

      {/* ── UNIFIED STATS BLOCK ── */}
      <div
        style={{
          padding: "16px 8px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Column 1: Lifetime Data */}
        <div style={{ textAlign: "center", flex: 1 }}>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "20px",
              color: "var(--color-navy)",
              lineHeight: 1,
            }}
          >
            {customer.total_bills || 0}
          </div>
          <div
            style={{
              fontSize: "9px",
              color: "var(--color-warm-gray)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginTop: "4px",
              marginBottom: "14px",
            }}
          >
            Total Bills
          </div>
          <div
            style={{
              fontSize: "14px",
              color: "var(--color-navy)",
              fontWeight: 600,
              lineHeight: 1,
            }}
          >
            {formatK(customer.lifetime_pledge_amount)}
          </div>
          <div
            style={{
              fontSize: "9px",
              color: "var(--color-warm-gray)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginTop: "4px",
            }}
          >
            Lifetime
          </div>
        </div>

        <div
          style={{
            width: "1px",
            height: "60px",
            background: "var(--color-linen)",
          }}
        />

        {/* Column 2: Active Data */}
        <div style={{ textAlign: "center", flex: 1 }}>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "20px",
              color:
                customer.active_bills > 0 ? "#2471A3" : "var(--color-navy)",
              lineHeight: 1,
            }}
          >
            {customer.active_bills || 0}
          </div>
          <div
            style={{
              fontSize: "9px",
              color: "var(--color-warm-gray)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginTop: "4px",
              marginBottom: "14px",
            }}
          >
            Active
          </div>
          <div
            style={{
              fontSize: "14px",
              color:
                customer.active_bills > 0 ? "#2471A3" : "var(--color-navy)",
              fontWeight: 600,
              lineHeight: 1,
            }}
          >
            {formatK(customer.active_pledge_amount)}
          </div>
          <div
            style={{
              fontSize: "9px",
              color: "var(--color-warm-gray)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginTop: "4px",
            }}
          >
            Active
          </div>
        </div>

        <div
          style={{
            width: "1px",
            height: "60px",
            background: "var(--color-linen)",
          }}
        />

        {/* Column 3: Released Data */}
        <div style={{ textAlign: "center", flex: 1 }}>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "20px",
              color:
                customer.released_bills > 0 ? "#27AE60" : "var(--color-navy)",
              lineHeight: 1,
            }}
          >
            {customer.released_bills || 0}
          </div>
          <div
            style={{
              fontSize: "9px",
              color: "var(--color-warm-gray)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginTop: "4px",
              marginBottom: "14px",
            }}
          >
            Released
          </div>
          <div
            style={{
              fontSize: "14px",
              color:
                customer.released_bills > 0 ? "#27AE60" : "var(--color-slate)",
              fontWeight: 600,
              lineHeight: 1,
            }}
          >
            {formatK(releasedPledgeAmount)}
          </div>
          <div
            style={{
              fontSize: "9px",
              color: "var(--color-warm-gray)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginTop: "4px",
            }}
          >
            Released
          </div>
        </div>
      </div>

      {/* Area tag */}
      {customer.area && (
        <div
          style={{
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            gap: "5px",
            borderTop: "1px solid var(--color-linen)",
          }}
        >
          <svg
            width="11"
            height="11"
            fill="none"
            viewBox="0 0 24 24"
            stroke="var(--color-warm-gray)"
            strokeWidth="1.5"
          >
            <path
              strokeLinecap="square"
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path strokeLinecap="square" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span style={{ fontSize: "11px", color: "var(--color-warm-gray)" }}>
            {customer.area}
          </span>
        </div>
      )}
    </div>
  );
}

/* ── Customer list row ────────────────────────────── */
function CustomerRow({ customer, onSelect }) {
  const [hov, setHov] = useState(false);

  // Calculate released amount on the frontend
  const releasedPledgeAmount = Math.max(
    0,
    (customer.lifetime_pledge_amount || 0) -
      (customer.active_pledge_amount || 0),
  );

  return (
    <div
      onClick={() => onSelect(customer)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "grid",
        gridTemplateColumns:
          "52px 1fr 120px 80px 80px 80px 80px 100px 100px 100px",
        gap: "0",
        alignItems: "center",
        borderBottom: "1px solid var(--color-linen)",
        background: hov ? "#F0EDE9" : "white",
        cursor: "pointer",
        transition: "background 0.1s",
        animation: "fadeIn 0.15s ease-out",
      }}
    >
      <div style={{ padding: "10px 12px" }}>
        {customer.photo_url ? (
          <img
            src={customer.photo_url}
            alt=""
            style={{
              width: "32px",
              height: "32px",
              objectFit: "cover",
              border: "1px solid var(--color-linen)",
            }}
          />
        ) : (
          <div
            style={{
              width: "32px",
              height: "32px",
              background: "var(--color-navy)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: "13px",
            }}
          >
            {(
              customer.initial?.replace(".", "") ||
              customer.name?.charAt(0) ||
              "?"
            ).toUpperCase()}
          </div>
        )}
      </div>
      <div style={{ padding: "10px 12px" }}>
        <div style={{ fontSize: "13px", color: "var(--color-navy)" }}>
          {customer.initial} {customer.name}
        </div>
        <div style={{ fontSize: "11px", color: "var(--color-slate)" }}>
          {customer.mobile}
        </div>
      </div>
      <div
        style={{
          padding: "10px 12px",
          fontSize: "12px",
          color: "var(--color-warm-gray)",
        }}
      >
        {customer.area || "—"}
      </div>
      <div style={{ padding: "10px 12px" }}>
        <RatingBadge rating={customer.rating} />
      </div>
      <div
        style={{
          padding: "10px 12px",
          textAlign: "center",
          fontSize: "13px",
          color: "var(--color-navy)",
        }}
      >
        {customer.total_bills || 0}
      </div>
      <div
        style={{
          padding: "10px 12px",
          textAlign: "center",
          fontSize: "13px",
          color:
            customer.active_bills > 0 ? "#2471A3" : "var(--color-warm-gray)",
        }}
      >
        {customer.active_bills || 0}
      </div>
      <div
        style={{
          padding: "10px 12px",
          textAlign: "center",
          fontSize: "13px",
          color:
            customer.released_bills > 0 ? "#27AE60" : "var(--color-warm-gray)",
        }}
      >
        {customer.released_bills || 0}
      </div>
      <div
        style={{
          padding: "10px 12px",
          fontSize: "12px",
          color: "#C0392B",
          fontWeight: 500,
        }}
      >
        {formatK(customer.active_pledge_amount)}
      </div>
      <div
        style={{
          padding: "10px 12px",
          fontSize: "12px",
          color: "var(--color-slate)",
        }}
      >
        {formatK(customer.lifetime_pledge_amount)}
      </div>
      <div
        style={{
          padding: "10px 12px",
          fontSize: "12px",
          color: "var(--color-slate)",
        }}
      >
        {formatK(releasedPledgeAmount)}
      </div>
    </div>
  );
}

/* ══ Customers Page ════════════════════════════════ */
export default function Customers() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("card"); // 'card' | 'list'
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState(""); // '' | 'excellent' | 'good' | 'average' | 'poor' | 'new'
  const [activeFilter, setActiveFilter] = useState(""); // '' | 'true' | 'false'
  const [toast, setToast] = useState(null);
  const dSearch = useDebounce(search, 350);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ search: dSearch });
      if (activeFilter) params.set("has_active", activeFilter);

      // Rating range from label
      const ratingRanges = {
        excellent: [8, 10],
        good: [6, 8],
        average: [4, 6],
        poor: [1.1, 4],
        new: [0, 1.05],
      };
      if (ratingFilter && ratingRanges[ratingFilter]) {
        const [mn, mx] = ratingRanges[ratingFilter];
        params.set("rating_min", mn);
        params.set("rating_max", mx);
      }

      const res = await api.get(`/api/customers?${params}`);
      setCustomers(res.data.customers || []);
      setTotal(res.data.total || 0);
    } catch {
      setToast({ message: "Failed to load customers.", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [dSearch, ratingFilter, activeFilter]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleSelectCustomer = (customer) => {
    // Map customer table fields → NewBill prefill field names
    navigate("/new-bill", {
      state: {
        prefill: {
          customer_initial: customer.initial,
          customer_name: customer.name,
          customer_mobile: customer.mobile,
          customer_alt_mobile: customer.alt_mobile,
          customer_email: customer.email,
          relation_type: customer.relation_type,
          relation_name: customer.relation_name,
          door_no: customer.door_no,
          address: customer.address,
          area: customer.area,
          pincode: customer.pincode,
          aadhar_number: customer.aadhar_number,
          aadhar_front_url: customer.aadhar_front_url,
          aadhar_back_url: customer.aadhar_back_url,
          customer_photo_url: customer.photo_url,
        },
      },
    });
  };

  const RATING_FILTERS = [
    { value: "", label: "All Ratings" },
    { value: "excellent", label: "8–10 Excellent", color: "#1e8449" },
    { value: "good", label: "6–8 Good", color: "#27AE60" },
    { value: "average", label: "4–6 Average", color: "#7d6608" },
    { value: "poor", label: "1–4 Poor", color: "#C0392B" },
    { value: "new", label: "New", color: "#2471A3" },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
        background: "var(--color-bg)",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "20px 28px 16px",
          borderBottom: "1px solid var(--color-linen)",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "14px",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "26px",
                color: "var(--color-navy)",
                fontWeight: 400,
                marginBottom: "2px",
              }}
            >
              Customers
            </h1>
            <p style={{ fontSize: "13px", color: "var(--color-warm-gray)" }}>
              {loading
                ? "Loading…"
                : `${total.toLocaleString("en-IN")} customer${total !== 1 ? "s" : ""} total`}
            </p>
          </div>

          {/* View toggle */}
          <div
            style={{
              display: "flex",
              border: "1px solid var(--color-linen)",
              overflow: "hidden",
            }}
          >
            {[
              {
                mode: "card",
                icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z",
                label: "Cards",
              },
              {
                mode: "list",
                icon: "M4 6h16M4 10h16M4 14h16M4 18h16",
                label: "List",
              },
            ].map((v) => (
              <button
                key={v.mode}
                onClick={() => setViewMode(v.mode)}
                title={v.label}
                style={{
                  padding: "8px 12px",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.12s",
                  background:
                    viewMode === v.mode ? "var(--color-navy)" : "transparent",
                  color:
                    viewMode === v.mode ? "#fff" : "var(--color-warm-gray)",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path strokeLinecap="square" d={v.icon} />
                </svg>
              </button>
            ))}
          </div>
        </div>

        {/* Search + filters */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          {/* Search */}
          <div style={{ flex: 1, minWidth: "220px", position: "relative" }}>
            <svg
              width="14"
              height="14"
              fill="none"
              viewBox="0 0 24 24"
              stroke="var(--color-warm-gray)"
              strokeWidth="1.8"
              style={{
                position: "absolute",
                left: "11px",
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
              }}
            >
              <path
                strokeLinecap="square"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, mobile, area, aadhar…"
              style={{
                width: "100%",
                padding: "9px 34px 9px 34px",
                fontSize: "13px",
                border: "1px solid var(--color-linen)",
                background: "var(--color-bg)",
                color: "var(--color-navy)",
                outline: "none",
                fontFamily: "var(--font-body)",
              }}
              onFocus={(e) =>
                (e.target.style.borderColor = "var(--color-slate)")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = "var(--color-linen)")
              }
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--color-warm-gray)",
                  fontSize: "13px",
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Rating filter */}
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            style={{
              padding: "9px 24px 9px 10px",
              fontSize: "12px",
              border: "1px solid var(--color-linen)",
              background: "var(--color-bg)",
              color: "var(--color-navy)",
              fontFamily: "var(--font-body)",
              outline: "none",
              cursor: "pointer",
              appearance: "none",
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' fill='none' viewBox='0 0 24 24' stroke='%236E6F73' stroke-width='2'%3E%3Cpath stroke-linecap='square' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 8px center",
            }}
          >
            {RATING_FILTERS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>

          {/* Active filter */}
          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            style={{
              padding: "9px 24px 9px 10px",
              fontSize: "12px",
              border: "1px solid var(--color-linen)",
              background: "var(--color-bg)",
              color: "var(--color-navy)",
              fontFamily: "var(--font-body)",
              outline: "none",
              cursor: "pointer",
              appearance: "none",
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' fill='none' viewBox='0 0 24 24' stroke='%236E6F73' stroke-width='2'%3E%3Cpath stroke-linecap='square' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 8px center",
            }}
          >
            <option value="">All Status</option>
            <option value="true">Has Active Bills</option>
            <option value="false">No Active Bills</option>
          </select>
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: viewMode === "card" ? "20px 28px" : "0",
        }}
      >
        {loading ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "180px",
              gap: "12px",
              color: "var(--color-warm-gray)",
            }}
          >
            <Spinner size={20} />
            <span style={{ fontSize: "14px" }}>Loading customers…</span>
          </div>
        ) : customers.length === 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "240px",
              gap: "12px",
            }}
          >
            <svg
              width="44"
              height="44"
              fill="none"
              viewBox="0 0 24 24"
              stroke="var(--color-linen)"
              strokeWidth="1"
            >
              <path
                strokeLinecap="square"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <p style={{ fontSize: "14px", color: "var(--color-warm-gray)" }}>
              {search || ratingFilter || activeFilter
                ? "No customers match your filters."
                : "No customers yet — create your first bill to add a customer."}
            </p>
          </div>
        ) : viewMode === "card" ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "16px",
            }}
          >
            {customers.map((c) => (
              <CustomerCard
                key={c.id}
                customer={c}
                onSelect={handleSelectCustomer}
              />
            ))}
          </div>
        ) : (
          <div style={{ minWidth: "850px" }}>
            {/* List header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "52px 1fr 120px 80px 80px 80px 80px 100px 100px 100px",
                background: "var(--color-linen)",
                borderBottom: "1px solid var(--color-linen)",
                position: "sticky",
                top: 0,
                zIndex: 10,
              }}
            >
              {[
                "",
                "Name",
                "Area",
                "Rating",
                "Total Bills",
                "Active",
                "Released",
                "Active Pld",
                "Lifetime Pld",
                "Released Pld",
              ].map((h, i) => (
                <div
                  key={i}
                  style={{
                    padding: "10px 12px",
                    fontSize: "10px",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--color-slate)",
                    textAlign: i >= 4 ? "center" : "left",
                  }}
                >
                  {h}
                </div>
              ))}
            </div>
            {customers.map((c) => (
              <CustomerRow
                key={c.id}
                customer={c}
                onSelect={handleSelectCustomer}
              />
            ))}
          </div>
        )}
      </div>

      {/* Hint bar */}
      {!loading && customers.length > 0 && (
        <div
          style={{
            padding: "10px 28px",
            borderTop: "1px solid var(--color-linen)",
            background: "var(--color-bg)",
            flexShrink: 0,
          }}
        >
          <p
            style={{
              fontSize: "12px",
              color: "var(--color-warm-gray)",
              fontStyle: "italic",
            }}
          >
            Click any customer to auto-fill their details in a new bill.
          </p>
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(4px) } to { opacity:1; transform:translateY(0) } }`}</style>
    </div>
  );
}
