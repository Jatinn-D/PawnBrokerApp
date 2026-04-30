import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { useDebounce } from "../hooks/useDebounce";
import { fmtDate, fmtINR, fmtWeight, statusConfig, rowBg } from "../lib/format";
import { Btn, Toast, ConfirmModal, Spinner } from "../components/ui/index.jsx";

/* ── Status badge ─────────────────────────────────── */
function StatusBadge({ status }) {
  const cfg = statusConfig[status] || statusConfig.active;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        padding: "3px 9px",
        fontSize: "11px",
        letterSpacing: "0.03em",
        background: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.dot}22`,
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: "5px",
          height: "5px",
          background: cfg.dot,
          flexShrink: 0,
          display: "inline-block",
        }}
      />
      {cfg.label}
    </span>
  );
}

/* ── HSO badge ────────────────────────────────────── */
function HSOBadge({ value }) {
  if (!value)
    return (
      <span style={{ color: "var(--color-linen)", fontSize: "12px" }}>—</span>
    );
  const bg = { H: "#5C6B8A", S: "#2F3A55", O: "#6E6F73" };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "24px",
        height: "24px",
        background: bg[value] || "#aaa",
        color: "#fff",
        fontSize: "11px",
      }}
    >
      {value}
    </span>
  );
}

/* ── Actions dropdown ─────────────────────────────── */
function ActionsMenu({ bill, onEdit, onRelease, onRenew, onDelete, isLatest }) {
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      // Don't close if click is on the button OR within the menu
      if (
        (btnRef.current && btnRef.current.contains(e.target)) ||
        (menuRef.current && menuRef.current.contains(e.target))
      ) {
        return;
      }
      setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const handleOpen = (e) => {
    e.stopPropagation();
    const rect = btnRef.current.getBoundingClientRect();
    setMenuPos({
      top: rect.bottom + window.scrollY + 4,
      left: rect.right + window.scrollX - 148,
    });
    setOpen((o) => !o);
  };

  const items = [
    {
      label: "Edit",
      d: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
      action: onEdit,
      disabled: bill.status !== "active",
    },
    {
      label: "Release",
      d: "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z",
      action: onRelease,
      disabled: bill.status !== "active",
      color: "#C0392B",
    },
    {
      label: "Renew",
      d: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
      action: onRenew,
      disabled: bill.status !== "active",
      color: "#2471A3",
      divider: true,
    },
    {
      label: "Delete",
      d: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
      action: onDelete,
      disabled: !isLatest,
      color: "#C0392B",
      tooltip: !isLatest ? "Only the latest bill can be deleted" : "",
    },
  ];

  const menu =
    open &&
    createPortal(
      <div
        ref={menuRef}
        style={{
          position: "absolute",
          top: menuPos.top,
          left: menuPos.left,
          zIndex: 99999,
          background: "var(--color-bg)",
          border: "1px solid var(--color-linen)",
          minWidth: "148px",
          boxShadow: "0 8px 32px rgba(47,58,85,0.22)",
          animation: "fadeIn 0.12s ease-out",
        }}
      >
        {items.map((item) => (
          <div key={item.label}>
            {item.divider && (
              <div
                style={{ height: "1px", background: "var(--color-linen)" }}
              />
            )}
            <button
              title={item.tooltip || ""}
              onClick={(e) => {
                e.stopPropagation();
                if (!item.disabled) {
                  item.action();
                  setOpen(false);
                }
              }}
              style={{
                width: "100%",
                padding: "10px 14px",
                background: "none",
                border: "none",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: item.disabled ? "not-allowed" : "pointer",
                color: item.disabled
                  ? "var(--color-linen)"
                  : item.color || "var(--color-navy)",
                fontSize: "13px",
                textAlign: "left",
                fontFamily: "var(--font-body)",
                transition: "background 0.1s",
              }}
              onMouseEnter={(e) => {
                if (!item.disabled)
                  e.currentTarget.style.background = "var(--color-linen)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "none";
              }}
            >
              <svg
                width="14"
                height="14"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path strokeLinecap="square" d={item.d} />
              </svg>
              {item.label}
            </button>
          </div>
        ))}
      </div>,
      document.body, // ← renders directly into <body>, completely outside the table
    );

  return (
    <div ref={btnRef} style={{ display: "inline-block" }}>
      <button
        onClick={handleOpen}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--color-warm-gray)",
          padding: "5px",
          display: "flex",
          transition: "color 0.15s",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.color = "var(--color-navy)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.color = "var(--color-warm-gray)")
        }
      >
        <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </button>
      {menu}
    </div>
  );
}

/* ── Sortable column header ───────────────────────── */
function TH({ label, sortKey, sort, onSort, style = {} }) {
  if (!sortKey)
    return (
      <th
        style={{
          padding: "10px 12px",
          textAlign: "left",
          fontSize: "10px",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--color-slate)",
          background: "var(--color-linen)",
          whiteSpace: "nowrap",
          ...style,
        }}
      >
        {label}
      </th>
    );
  const active = sort.key === sortKey;
  return (
    <th
      onClick={() => onSort(sortKey)}
      style={{
        padding: "10px 12px",
        textAlign: "left",
        fontSize: "10px",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        cursor: "pointer",
        userSelect: "none",
        whiteSpace: "nowrap",
        color: active ? "var(--color-navy)" : "var(--color-slate)",
        background: "var(--color-linen)",
        transition: "color 0.15s",
        ...style,
      }}
    >
      <span
        style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
      >
        {label}
        <svg
          width="10"
          height="10"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2.5"
          style={{ opacity: active ? 1 : 0.3 }}
        >
          <path
            strokeLinecap="square"
            d={
              !active
                ? "M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"
                : sort.dir === "asc"
                  ? "M5 15l7-7 7 7"
                  : "M19 9l-7 7-7-7"
            }
          />
        </svg>
      </span>
    </th>
  );
}

/* ── Pagination ───────────────────────────────────── */
function Pagination({ page, total, limit, onChange }) {
  const pages = Math.ceil(total / limit);
  if (pages <= 1) return null;
  const range = [];
  const delta = 2;
  const l = Math.max(2, page - delta),
    r = Math.min(pages - 1, page + delta);
  range.push(1);
  if (l > 2) range.push("…");
  for (let i = l; i <= r; i++) range.push(i);
  if (r < pages - 1) range.push("…");
  if (pages > 1) range.push(pages);

  const btn = (active, disabled) => ({
    padding: "6px 10px",
    fontSize: "12px",
    border: `1px solid ${active ? "var(--color-navy)" : "var(--color-linen)"}`,
    background: active ? "var(--color-navy)" : "transparent",
    color: active
      ? "#fff"
      : disabled
        ? "var(--color-linen)"
        : "var(--color-slate)",
    cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: "var(--font-body)",
  });

  return (
    <div
      style={{
        display: "flex",
        gap: "3px",
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <button
        style={btn(false, page === 1)}
        onClick={() => page > 1 && onChange(page - 1)}
      >
        ‹
      </button>
      {range.map((p, i) =>
        p === "…" ? (
          <span
            key={i}
            style={{
              padding: "4px",
              color: "var(--color-warm-gray)",
              fontSize: "12px",
            }}
          >
            …
          </span>
        ) : (
          <button
            key={p}
            style={btn(p === page, false)}
            onClick={() => onChange(p)}
          >
            {p}
          </button>
        ),
      )}
      <button
        style={btn(false, page === pages)}
        onClick={() => page < pages && onChange(page + 1)}
      >
        ›
      </button>
    </div>
  );
}

/* ── Filter panel ─────────────────────────────────── */
function FilterPanel({ filters, onChange, onClose }) {
  const [loc, setLoc] = useState({ ...filters });
  const set = (k, v) => setLoc((p) => ({ ...p, [k]: v }));
  const TagBtn = ({ label, active, onClick }) => (
    <button
      onClick={onClick}
      style={{
        padding: "5px 11px",
        fontSize: "12px",
        cursor: "pointer",
        fontFamily: "var(--font-body)",
        border: `1px solid ${active ? "var(--color-navy)" : "var(--color-linen)"}`,
        background: active ? "var(--color-navy)" : "transparent",
        color: active ? "#fff" : "var(--color-warm-gray)",
        transition: "all 0.12s",
      }}
    >
      {label}
    </button>
  );
  return (
    <div
      style={{
        position: "absolute",
        top: "100%",
        right: 0,
        marginTop: "6px",
        background: "var(--color-bg)",
        border: "1px solid var(--color-linen)",
        padding: "20px",
        minWidth: "300px",
        zIndex: 100,
        boxShadow: "0 8px 24px rgba(47,58,85,0.10)",
        animation: "fadeIn 0.15s ease-out",
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
        Filter
      </p>

      <div style={{ marginBottom: "14px" }}>
        <p
          style={{
            fontSize: "11px",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--color-slate)",
            marginBottom: "8px",
          }}
        >
          Status
        </p>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {[
            ["", "All"],
            ["active", "Active"],
            ["released", "Released"],
            ["renewed", "Renewed"],
          ].map(([v, l]) => (
            <TagBtn
              key={v}
              label={l}
              active={loc.status === v}
              onClick={() => set("status", v)}
            />
          ))}
        </div>
      </div>

      <div style={{ marginBottom: "14px" }}>
        <p
          style={{
            fontSize: "11px",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--color-slate)",
            marginBottom: "8px",
          }}
        >
          Jewel Type
        </p>
        <div style={{ display: "flex", gap: "6px" }}>
          {[
            ["", "All"],
            ["gold", "Gold"],
            ["silver", "Silver"],
          ].map(([v, l]) => (
            <TagBtn
              key={v}
              label={l}
              active={loc.jewel_type === v}
              onClick={() => set("jewel_type", v)}
            />
          ))}
        </div>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <p
          style={{
            fontSize: "11px",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--color-slate)",
            marginBottom: "8px",
          }}
        >
          Principal Amount Range
        </p>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {["min_amount", "max_amount"].map((k, i) => (
            <input
              key={k}
              type="number"
              placeholder={i === 0 ? "Min" : "Max"}
              value={loc[k]}
              onChange={(e) => set(k, e.target.value)}
              style={{
                flex: 1,
                padding: "8px 10px",
                border: "1px solid var(--color-linen)",
                background: "var(--color-bg)",
                fontSize: "13px",
                fontFamily: "var(--font-body)",
                outline: "none",
              }}
            />
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
        <button
          onClick={() => {
            onChange({
              status: "",
              min_amount: "",
              max_amount: "",
              jewel_type: "",
            });
            onClose();
          }}
          style={{
            padding: "8px 14px",
            background: "none",
            border: "1px solid var(--color-linen)",
            fontSize: "12px",
            cursor: "pointer",
            color: "var(--color-warm-gray)",
            fontFamily: "var(--font-body)",
          }}
        >
          Clear All
        </button>
        <button
          onClick={() => {
            onChange(loc);
            onClose();
          }}
          style={{
            padding: "8px 14px",
            background: "var(--color-navy)",
            border: "none",
            fontSize: "12px",
            cursor: "pointer",
            color: "#fff",
            fontFamily: "var(--font-body)",
          }}
        >
          Apply
        </button>
      </div>
    </div>
  );
}

/* ══ Database Page ════════════════════════════════════ */
export default function Database() {
  const navigate = useNavigate();
  const [bills, setBills] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const LIMIT = 20;

  const [search, setSearch] = useState("");
  const dSearch = useDebounce(search, 350);
  const [sort, setSort] = useState({ key: "bill_date", dir: "desc" });
  const [filters, setFilters] = useState({
    status: "",
    min_amount: "",
    max_amount: "",
    jewel_type: "",
  });
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef(null);

  const [releaseTarget, setReleaseTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);
  const [nextBillNum, setNextBillNum] = useState("");

  useEffect(() => {
    const h = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target))
        setFilterOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const fetchBills = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({
        page,
        limit: LIMIT,
        search: dSearch,
        sort_by: sort.key,
        sort_order: sort.dir,
        ...(filters.status && { status: filters.status }),
        ...(filters.min_amount && { min_amount: filters.min_amount }),
        ...(filters.max_amount && { max_amount: filters.max_amount }),
        ...(filters.jewel_type && { jewel_type: filters.jewel_type }),
      });
      const res = await api.get(`/api/bills?${p}`);
      setBills(res.data.bills || []);
      setTotal(res.data.total || 0);
    } catch {
      setToast({ message: "Failed to load bills.", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [page, dSearch, sort, filters]);

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);
  useEffect(() => {
    setPage(1);
  }, [dSearch, filters]);

  useEffect(() => {
    api
      .get("/api/bills/next-number")
      .then((r) => setNextBillNum(r.data.bill_number))
      .catch(() => {});
  }, [bills]);

  const handleSort = (k) =>
    setSort((prev) => ({
      key: k,
      dir: prev.key === k && prev.dir === "asc" ? "desc" : "asc",
    }));

  const handleRelease = async () => {
    try {
      await api.post(`/api/bills/${releaseTarget.id}/release`);
      setToast({
        message: `Bill ${releaseTarget.bill_number} released.`,
        type: "success",
      });
      fetchBills();
    } catch (e) {
      setToast({
        message: e.response?.data?.error || "Failed to release.",
        type: "error",
      });
    }
    setReleaseTarget(null);
  };

  const handleRenew = async (bill) => {
    try {
      const res = await api.post(`/api/bills/${bill.id}/renew`, {});
      navigate("/new-bill", {
        state: {
          prefill: res.data.bill,
          articles: res.data.articles,
          renewingFrom: bill.id,
        },
      });
    } catch (e) {
      setToast({
        message: e.response?.data?.error || "Failed to renew.",
        type: "error",
      });
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/api/bills/${deleteTarget.id}`);
      setToast({
        message: `Bill ${deleteTarget.bill_number} deleted.`,
        type: "info",
      });
      fetchBills();
    } catch (e) {
      setToast({
        message: e.response?.data?.error || "Failed to delete.",
        type: "error",
      });
    }
    setDeleteTarget(null);
  };

  // Derive the actual latest bill number from next - 1 (prefix + number - 1)
  const getLatestBillNumber = () => {
    if (!nextBillNum) return null;
    const match = nextBillNum.match(/^([A-Za-z.]*?)(\d+)$/);
    if (!match) return nextBillNum;
    const prefix = match[1];
    const num = parseInt(match[2]);
    return num > 1 ? `${prefix}${num - 1}` : null;
  };
  const latestBill = getLatestBillNumber();

  const activeFilters = Object.values(filters).filter(Boolean).length;

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
              Database
            </h1>
            <p style={{ fontSize: "13px", color: "var(--color-warm-gray)" }}>
              {loading
                ? "Loading…"
                : `${total.toLocaleString("en-IN")} bill${total !== 1 ? "s" : ""} total`}
            </p>
          </div>
          <Btn
            variant="primary"
            onClick={() => navigate("/new-bill")}
            icon={
              <svg
                width="14"
                height="14"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="square" d="M12 4v16m8-8H4" />
              </svg>
            }
          >
            New Bill
          </Btn>
        </div>

        {/* Search + controls row */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          {/* Search box */}
          <div style={{ flex: 1, minWidth: "240px", position: "relative" }}>
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
              placeholder="Search name, mobile, bill no., area, aadhar…"
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
                  padding: "2px",
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort */}
          <select
            value={`${sort.key}:${sort.dir}`}
            onChange={(e) => {
              const [k, d] = e.target.value.split(":");
              setSort({ key: k, dir: d });
              setPage(1);
            }}
            style={{
              padding: "9px 26px 9px 10px",
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
            <option value="bill_date:desc">Date — Newest</option>
            <option value="bill_date:asc">Date — Oldest</option>
            <option value="bill_number:desc">Bill No. — High</option>
            <option value="bill_number:asc">Bill No. — Low</option>
            <option value="customer_name:asc">Name — A–Z</option>
            <option value="customer_name:desc">Name — Z–A</option>
            <option value="principal_amount:desc">Amount — High</option>
            <option value="principal_amount:asc">Amount — Low</option>
          </select>

          {/* Filter */}
          <div ref={filterRef} style={{ position: "relative" }}>
            <button
              onClick={() => setFilterOpen((o) => !o)}
              style={{
                padding: "9px 14px",
                fontSize: "12px",
                cursor: "pointer",
                fontFamily: "var(--font-body)",
                border: `1px solid ${activeFilters ? "var(--color-navy)" : "var(--color-linen)"}`,
                background: activeFilters ? "var(--color-navy)" : "transparent",
                color: activeFilters ? "#fff" : "var(--color-navy)",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.15s",
              }}
            >
              <svg
                width="13"
                height="13"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path
                  strokeLinecap="square"
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"
                />
              </svg>
              Filters{activeFilters > 0 && ` (${activeFilters})`}
            </button>
            {filterOpen && (
              <FilterPanel
                filters={filters}
                onChange={(f) => {
                  setFilters(f);
                  setPage(1);
                }}
                onClose={() => setFilterOpen(false)}
              />
            )}
          </div>
        </div>
      </div>

      {/* Table area */}
      <div style={{ flex: 1, overflow: "auto" }}>
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
            <span style={{ fontSize: "14px" }}>Loading bills…</span>
          </div>
        ) : bills.length === 0 ? (
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
                d="M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4M4 7v5m16-5v5M4 12c0 2.21 3.582 4 8 4s8-1.79 8-4M4 12v5c0 2.21 3.582 4 8 4s8-1.79 8-4v-5"
              />
            </svg>
            <p style={{ fontSize: "14px", color: "var(--color-warm-gray)" }}>
              {search || activeFilters
                ? "No bills match your search or filters."
                : "No bills yet."}
            </p>
            {!search && !activeFilters && (
              <Btn variant="primary" onClick={() => navigate("/new-bill")}>
                Create First Bill
              </Btn>
            )}
          </div>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "13px",
            }}
          >
            <thead>
              <tr>
                <TH
                  label="Bill No."
                  sortKey="bill_number"
                  sort={sort}
                  onSort={handleSort}
                />
                <TH
                  label="Date"
                  sortKey="bill_date"
                  sort={sort}
                  onSort={handleSort}
                />
                <TH
                  label="Ini."
                  sortKey={null}
                  sort={sort}
                  onSort={handleSort}
                />
                <TH
                  label="Name"
                  sortKey="customer_name"
                  sort={sort}
                  onSort={handleSort}
                />
                <TH
                  label="Door No."
                  sortKey={null}
                  sort={sort}
                  onSort={handleSort}
                />
                <TH
                  label="Address"
                  sortKey={null}
                  sort={sort}
                  onSort={handleSort}
                  style={{ minWidth: "120px" }}
                />
                <TH
                  label="Area"
                  sortKey={null}
                  sort={sort}
                  onSort={handleSort}
                />
                <TH
                  label="Pincode"
                  sortKey={null}
                  sort={sort}
                  onSort={handleSort}
                />
                <TH
                  label="Aadhar"
                  sortKey={null}
                  sort={sort}
                  onSort={handleSort}
                />
                <TH
                  label="Phone"
                  sortKey={null}
                  sort={sort}
                  onSort={handleSort}
                />
                <TH
                  label="Principal"
                  sortKey="principal_amount"
                  sort={sort}
                  onSort={handleSort}
                />
                <TH
                  label="Articles"
                  sortKey={null}
                  sort={sort}
                  onSort={handleSort}
                  style={{ minWidth: "140px" }}
                />
                <TH
                  label="Net Wt."
                  sortKey={null}
                  sort={sort}
                  onSort={handleSort}
                />
                <TH
                  label="Pres. Value"
                  sortKey="present_value"
                  sort={sort}
                  onSort={handleSort}
                />
                <TH
                  label="H/S/O"
                  sortKey={null}
                  sort={sort}
                  onSort={handleSort}
                />
                <TH
                  label="Bill With"
                  sortKey={null}
                  sort={sort}
                  onSort={handleSort}
                />
                <TH
                  label="Rel./Ren. Date"
                  sortKey={null}
                  sort={sort}
                  onSort={handleSort}
                />
                <TH
                  label="Rel./Ren. Time"
                  sortKey={null}
                  sort={sort}
                  onSort={handleSort}
                />
                <TH
                  label="Renewed To"
                  sortKey={null}
                  sort={sort}
                  onSort={handleSort}
                />
                <TH
                  label="Status"
                  sortKey={null}
                  sort={sort}
                  onSort={handleSort}
                />
                <TH
                  label=""
                  sortKey={null}
                  sort={sort}
                  onSort={handleSort}
                  style={{ width: "40px" }}
                />
              </tr>
            </thead>
            <tbody>
              {bills.map((bill, i) => (
                <tr
                  key={bill.id}
                  onClick={() => navigate(`/database/${bill.id}`)}
                  style={{
                    background: rowBg(bill.status),
                    borderBottom: "1px solid var(--color-linen)",
                    cursor: "pointer",
                    transition: "background 0.1s",
                    animation: `fadeIn 0.18s ease-out ${Math.min(i * 0.025, 0.25)}s both`,
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#F0EDE9")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = rowBg(bill.status))
                  }
                >
                  <td style={{ padding: "10px 12px", whiteSpace: "nowrap" }}>
                    <span
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "14px",
                        color: "var(--color-navy)",
                      }}
                    >
                      {bill.bill_number}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      whiteSpace: "nowrap",
                      color: "var(--color-navy)",
                    }}
                  >
                    {fmtDate(bill.bill_date)}
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      color: "var(--color-slate)",
                      fontSize: "12px",
                    }}
                  >
                    {bill.customer_initial || "—"}
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      whiteSpace: "nowrap",
                      color: "var(--color-navy)",
                    }}
                  >
                    {bill.customer_name}
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      color: "var(--color-warm-gray)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {bill.door_no || "—"}
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      color: "var(--color-warm-gray)",
                      maxWidth: "140px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {bill.address || "—"}
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      color: "var(--color-navy)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {bill.area || "—"}
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      color: "var(--color-warm-gray)",
                    }}
                  >
                    {bill.pincode || "—"}
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      color: "var(--color-warm-gray)",
                      whiteSpace: "nowrap",
                      fontSize: "12px",
                    }}
                  >
                    {bill.aadhar_number || "—"}
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      whiteSpace: "nowrap",
                      color: "var(--color-navy)",
                    }}
                  >
                    {bill.customer_mobile}
                  </td>
                  <td style={{ padding: "10px 12px", whiteSpace: "nowrap" }}>
                    <span
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "14px",
                        color: "var(--color-navy)",
                      }}
                    >
                      {fmtINR(bill.principal_amount)}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      color: "var(--color-warm-gray)",
                      maxWidth: "160px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      fontSize: "12px",
                    }}
                  >
                    {bill.article_descriptions || "—"}
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      whiteSpace: "nowrap",
                      color: "var(--color-slate)",
                      fontSize: "12px",
                    }}
                  >
                    {fmtWeight(bill.total_net_weight)}
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      whiteSpace: "nowrap",
                      color: "var(--color-navy)",
                    }}
                  >
                    {fmtINR(bill.present_value)}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <HSOBadge value={bill.hso} />
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      whiteSpace: "nowrap",
                      fontSize: "12px",
                      color: "var(--color-warm-gray)",
                    }}
                  >
                    {bill.bill_with === "shop" ? (
                      <span
                        style={{
                          color: "#7d6608",
                          background: "#FEF9E7",
                          padding: "2px 8px",
                          border: "1px solid rgba(214,137,16,0.2)",
                          fontSize: "11px",
                        }}
                      >
                        Shop
                      </span>
                    ) : (
                      <span
                        style={{
                          color: "#1a5276",
                          background: "#EAF4FB",
                          padding: "2px 8px",
                          border: "1px solid rgba(36,113,163,0.2)",
                          fontSize: "11px",
                        }}
                      >
                        Customer
                      </span>
                    )}
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      whiteSpace: "nowrap",
                      color: "var(--color-warm-gray)",
                      fontSize: "12px",
                    }}
                  >
                    {fmtDate(bill.release_renew_date)}
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      whiteSpace: "nowrap",
                      color: "var(--color-warm-gray)",
                      fontSize: "12px",
                    }}
                  >
                    {bill.release_renew_time
                      ? bill.release_renew_time.slice(0, 5)
                      : "—"}
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      color: "var(--color-slate)",
                      fontSize: "12px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {bill.renewed_bill_number || "—"}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <StatusBadge status={bill.status} />
                  </td>
                  <td
                    style={{ padding: "10px 6px" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ActionsMenu
                      bill={bill}
                      isLatest={latestBill === bill.bill_number}
                      onEdit={() =>
                        navigate("/new-bill", {
                          state: { prefill: bill, editMode: true },
                        })
                      }
                      onRelease={() => setReleaseTarget(bill)}
                      onRenew={() => handleRenew(bill)}
                      onDelete={() => setDeleteTarget(bill)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination footer */}
      {!loading && total > LIMIT && (
        <div
          style={{
            padding: "10px 28px",
            borderTop: "1px solid var(--color-linen)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "10px",
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: "12px", color: "var(--color-warm-gray)" }}>
            Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of{" "}
            {total.toLocaleString("en-IN")}
          </span>
          <Pagination
            page={page}
            total={total}
            limit={LIMIT}
            onChange={setPage}
          />
        </div>
      )}

      <ConfirmModal
        open={!!releaseTarget}
        title={`Release bill ${releaseTarget?.bill_number}?`}
        message={`This marks the pledge as released for ${releaseTarget?.customer_name}. The release date and time are automatically recorded. This cannot be undone.`}
        confirmLabel="Yes, Release"
        confirmVariant="danger"
        onConfirm={handleRelease}
        onCancel={() => setReleaseTarget(null)}
      />

      <ConfirmModal
        open={!!deleteTarget}
        title={`Delete bill ${deleteTarget?.bill_number}?`}
        message="This will permanently delete this bill. Only the latest bill can be deleted. This cannot be undone."
        confirmLabel="Yes, Delete"
        confirmVariant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

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
