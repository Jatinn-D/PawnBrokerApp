import { useState, useEffect, useCallback } from "react";
import api from "../lib/api";
import { fmtINR } from "../lib/format";
import { Btn, Spinner, Toast, ConfirmModal } from "../components/ui/index.jsx";

/* ─── Icon helper ─────────────────────────────────── */
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

/* ─── Toggle ──────────────────────────────────────── */
function Toggle({ value, onChange, disabled }) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!value)}
      disabled={disabled}
      style={{
        width: "40px",
        height: "22px",
        position: "relative",
        flexShrink: 0,
        background: value ? "var(--color-navy)" : "var(--color-linen)",
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "background 0.2s",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "3px",
          left: value ? "21px" : "3px",
          width: "16px",
          height: "16px",
          background: "#fff",
          transition: "left 0.2s",
        }}
      />
    </button>
  );
}

/* ─── Card wrapper ────────────────────────────────── */
function Card({ title, subtitle, icon, children, style = {} }) {
  return (
    <div
      style={{
        border: "1px solid var(--color-linen)",
        background: "white",
        marginBottom: "16px",
        animation: "fadeIn 0.25s ease-out",
        ...style,
      }}
    >
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid var(--color-linen)",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <div style={{ color: "var(--color-slate)", flexShrink: 0 }}>{icon}</div>
        <div>
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "16px",
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
      <div style={{ padding: "18px 20px" }}>{children}</div>
    </div>
  );
}

/* ─── Labelled input ──────────────────────────────── */
function LabelInput({
  label,
  value,
  onChange,
  disabled,
  placeholder,
  type = "text",
  width,
  step,
  min,
  max,
  style = {},
}) {
  return (
    <div style={style}>
      <label
        style={{
          display: "block",
          fontSize: "10px",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--color-slate)",
          marginBottom: "5px",
        }}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        step={step}
        min={min}
        max={max}
        style={{
          width: width || "100%",
          padding: "9px 11px",
          fontSize: "13px",
          border: "1px solid var(--color-linen)",
          background: disabled ? "var(--color-linen)" : "var(--color-bg)",
          color: disabled ? "var(--color-warm-gray)" : "var(--color-navy)",
          fontFamily: "var(--font-body)",
          outline: "none",
          boxSizing: "border-box",
        }}
      />
    </div>
  );
}

/* ─── Edit / Save / Cancel row ────────────────────── */
function EditButtons({
  editing,
  onEdit,
  onSave,
  onCancel,
  saveLabel = "Save",
  saveDanger = false,
}) {
  if (!editing)
    return (
      <button
        onClick={onEdit}
        style={{
          padding: "9px 14px",
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
          alignSelf: "flex-end",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.background = "var(--color-linen)")
        }
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <Ico d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        Edit
      </button>
    );
  return (
    <div style={{ display: "flex", gap: "8px", alignSelf: "flex-end" }}>
      <button
        onClick={onSave}
        style={{
          padding: "9px 16px",
          border: "none",
          fontSize: "12px",
          cursor: "pointer",
          fontFamily: "var(--font-body)",
          color: "#fff",
          background: saveDanger ? "#C0392B" : "var(--color-navy)",
        }}
      >
        {saveLabel}
      </button>
      <button
        onClick={onCancel}
        style={{
          padding: "9px 12px",
          border: "1px solid var(--color-linen)",
          background: "transparent",
          fontSize: "12px",
          cursor: "pointer",
          fontFamily: "var(--font-body)",
          color: "var(--color-warm-gray)",
        }}
      >
        Cancel
      </button>
    </div>
  );
}

/* ─── Mandatory field definitions ─────────────────── */
const FIELD_GROUPS = [
  {
    group: "Customer",
    fields: [
      { key: "customer_initial", label: "Initial" },
      { key: "customer_name", label: "Customer Name", locked: true },
      { key: "customer_mobile", label: "Mobile Number", locked: true },
      { key: "customer_alt_mobile", label: "Alt. Mobile" },
      { key: "customer_email", label: "Email ID" },
      { key: "relation_type", label: "Relation Type" },
      { key: "relation_name", label: "Relation Name" },
    ],
  },
  {
    group: "Address",
    fields: [
      { key: "door_no", label: "Door / House No." },
      { key: "address", label: "Address" },
      { key: "area", label: "Area" },
      { key: "pincode", label: "Pincode" },
    ],
  },
  {
    group: "Identity Proof",
    fields: [
      { key: "aadhar_number", label: "Aadhar Number" },
      { key: "aadhar_front_url", label: "Aadhar Front Photo" },
      { key: "aadhar_back_url", label: "Aadhar Back Photo" },
      { key: "customer_photo_url", label: "Customer Photo" },
    ],
  },
  {
    group: "Jewel Details",
    fields: [
      { key: "article_description", label: "Article Description" },
      { key: "net_weight", label: "Net Weight" },
      { key: "gross_weight", label: "Gross Weight" },
      { key: "purity_tag", label: "Purity Tag" },
      { key: "article_image", label: "Article Photo" },
    ],
  },
  {
    group: "Amount",
    fields: [
      { key: "principal_amount", label: "Principal Amount", locked: true },
      { key: "present_value", label: "Present Value", locked: true },
    ],
  },
];

const LATE_COL_OPTIONS = [
  { key: "bill_number", label: "Bill No." },
  { key: "bill_date", label: "Bill Date" },
  { key: "customer_name", label: "Customer Name" },
  { key: "customer_mobile", label: "Mobile" },
  { key: "door_no", label: "Door No." },
  { key: "address", label: "Address" },
  { key: "area", label: "Area" },
  { key: "aadhar_number", label: "Aadhar No." },
  { key: "principal_amount", label: "Principal Amount" },
  { key: "present_value", label: "Present Value" },
  { key: "article_descriptions", label: "Articles" },
  { key: "total_net_weight", label: "Net Weight" },
];

function FieldGroup({ group, mandatoryFields, toggleMandatory }) {
  if (!group) return null;
  return (
    <div key={group.group}>
      <p
        style={{
          fontSize: "10px",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--color-slate)",
          marginBottom: "8px",
          paddingBottom: "6px",
          borderBottom: "1px solid var(--color-linen)",
        }}
      >
        {group.group}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        {group.fields.map((field) => {
          const isOn = field.locked || !!mandatoryFields[field.key];
          return (
            <div
              key={field.key}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 10px",
                background: isOn ? "rgba(47,58,85,0.04)" : "transparent",
                border:
                  "1px solid " +
                  (isOn ? "rgba(47,58,85,0.1)" : "var(--color-linen)"),
                transition: "all 0.15s",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <Toggle
                  value={isOn}
                  onChange={() => !field.locked && toggleMandatory(field.key)}
                  disabled={field.locked}
                />
                <span style={{ fontSize: "12px", color: "var(--color-navy)" }}>
                  {field.label}
                </span>
              </div>
              {field.locked ? (
                <span
                  style={{
                    fontSize: "9px",
                    color: "var(--color-warm-gray)",
                    border: "1px solid var(--color-linen)",
                    padding: "2px 6px",
                  }}
                >
                  Always
                </span>
              ) : (
                isOn && (
                  <span
                    style={{
                      fontSize: "9px",
                      color: "var(--color-navy)",
                      background: "rgba(47,58,85,0.08)",
                      padding: "2px 6px",
                    }}
                  >
                    On
                  </span>
                )
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ══ Settings Page ════════════════════════════════════════════════════════════ */
export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);

  // Bill number
  const [billPrefix, setBillPrefix] = useState("");
  const [billStartNum, setBillStartNum] = useState("");
  const [billEditing, setBillEditing] = useState(false);

  // Threshold
  const [threshold, setThreshold] = useState("");
  const [thresholdInput, setThresholdInput] = useState("");
  const [thresholdEditing, setThresholdEditing] = useState(false);
  const [thresholdConfirm, setThresholdConfirm] = useState(false);

  // Interest rates
  const [goldRate, setGoldRate] = useState(2.0);
  const [silverRate, setSilverRate] = useState(4.0);

  // Mandatory fields
  const [mandatoryFields, setMandatoryFields] = useState({});

  // Late bills
  const [lateOptions, setLateOptions] = useState([]);
  const [lateMonths, setLateMonths] = useState("");
  const [lateBills, setLateBills] = useState([]);
  const [lateLoading, setLateLoading] = useState(false);
  const [selectedLateCols, setSelectedLateCols] = useState([
    "bill_number",
    "bill_date",
    "customer_name",
    "customer_mobile",
    "principal_amount",
    "article_descriptions",
  ]);

  // Shop Profile
  const [shopName, setShopName] = useState("");
  const [shopPhone, setShopPhone] = useState("");
  const [shopAddress, setShopAddress] = useState("");
  const [shopEditing, setShopEditing] = useState(false);

  /* ── Load settings ── */
  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/settings");
      const s = res.data;
      setBillPrefix(s.bill_prefix || "");
      setBillStartNum(s.bill_current_number || 1);
      setThreshold(s.threshold_value || 50000);
      setThresholdInput(s.threshold_value || 50000);
      setGoldRate(s.gold_interest_rate || 2.0);
      setSilverRate(s.silver_interest_rate || 4.0);
      setMandatoryFields(s.mandatory_fields || {});
      setShopName(s.shop_name || "");
      setShopPhone(s.shop_phone || "");
      setShopAddress(s.shop_address || "");
    } catch {
      setToast({ message: "Failed to load settings.", type: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);
  useEffect(() => {
    api
      .get("/api/settings/late-bills/options")
      .then((r) => setLateOptions(r.data.options || []))
      .catch(() => {});
  }, []);
  useEffect(() => {
    if (!lateMonths) {
      setLateBills([]);
      return;
    }
    setLateLoading(true);
    api
      .get(`/api/settings/late-bills/data?months=${lateMonths}`)
      .then((r) => setLateBills(r.data || []))
      .catch(() => {})
      .finally(() => setLateLoading(false));
  }, [lateMonths]);

  /* ── Helpers ── */
  const saveSettings = async (patch) => {
    setSaving(true);
    try {
      await api.put("/api/settings", patch);
      setToast({ message: "Settings saved.", type: "success" });
      fetchSettings();
    } catch (e) {
      setToast({
        message: e.response?.data?.error || "Failed to save.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveRates = () => {
    // Validate Gold Rate
    if (goldRate < 0.5 || goldRate > 4.0) {
      setToast({
        message: "Gold interest rate must be between 0.5% and 4.0%",
        type: "error",
      });
      return;
    }

    // Validate Silver Rate
    if (silverRate < 3.0 || silverRate > 6.0) {
      setToast({
        message: "Silver interest rate must be between 3.0% and 6.0%",
        type: "error",
      });
      return;
    }

    // If it passes, save it!
    saveSettings({
      gold_interest_rate: goldRate,
      silver_interest_rate: silverRate,
    });
  };

  const saveBillNumber = () => {
    saveSettings({
      bill_prefix: billPrefix,
      bill_start_number: parseInt(billStartNum) || 1,
    });
    setBillEditing(false);
  };

  const saveThreshold = async () => {
    setSaving(true);
    try {
      await api.put("/api/settings/threshold", {
        threshold_value: parseFloat(thresholdInput),
      });
      setThreshold(parseFloat(thresholdInput));
      setToast({
        message: `Threshold updated. H/S/O recalculated across all active bills.`,
        type: "success",
      });
      fetchSettings();
    } catch (e) {
      setToast({
        message: e.response?.data?.error || "Failed to update threshold.",
        type: "error",
      });
    } finally {
      setSaving(false);
      setThresholdConfirm(false);
      setThresholdEditing(false);
    }
  };

  const toggleMandatory = (key) => {
    const updated = { ...mandatoryFields, [key]: !mandatoryFields[key] };
    setMandatoryFields(updated);
    saveSettings({ mandatory_fields: updated });
  };

  const lateMonthLabel = (m) => {
    if (m < 12) return `${m} month${m > 1 ? "s" : ""} old`;
    if (m === 12) return "1 year old";
    if (m === 18) return "1.5 years old";
    if (m === 24) return "2 years old";
    return `${m} months old`;
  };

  const downloadLateBills = () => {
    if (!lateBills.length) return;
    const headers = LATE_COL_OPTIONS.filter((c) =>
      selectedLateCols.includes(c.key),
    ).map((c) => c.label);
    const rows = lateBills.map((bill) =>
      selectedLateCols.map((col) => {
        const v = bill[col];
        if (col === "bill_date") return v ? v.split("T")[0] : "";
        if (col === "principal_amount" || col === "present_value")
          return v ? Math.round(v) : "";
        return v || "";
      }),
    );
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `late-bills-${lateMonths}months-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
        <Spinner size={20} />
        <span style={{ fontSize: "14px" }}>Loading settings…</span>
      </div>
    );

  return (
    <div
      style={{
        padding: "24px 28px 0px",
        background: "var(--color-bg)",
        minHeight: "100%",
      }}
    >
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(4px) } to { opacity:1; transform:translateY(0) } }
        @keyframes _spin  { to { transform:rotate(360deg) } }
        
        .responsive-grid { display: grid; gap: 24px; grid-template-columns: 1fr; }
        .auto-backup-container { border-top: 1px solid var(--color-linen); padding-top: 24px; }

        @media (min-width: 768px) {
          .responsive-grid { grid-template-columns: 1fr 1fr; }
          .auto-backup-container { border-top: none; padding-top: 0; border-left: 1px solid var(--color-linen); padding-left: 24px; }
        }
      `}</style>

      {/* Page title */}
      <div style={{ marginBottom: "24px" }}>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "26px",
            color: "var(--color-navy)",
            fontWeight: 400,
            marginBottom: "3px",
          }}
        >
          Settings
        </h1>
        <p style={{ fontSize: "13px", color: "var(--color-warm-gray)" }}>
          Configure settings based on your business needs.
        </p>
      </div>

      {/* ══ ROW 0: Shop Profile & Live Preview ══ */}
      <Card
        title="Shop Profile"
        subtitle="These details will appear at the top of every printed bill."
        icon={
          <Ico d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        }
      >
        <div className="responsive-grid">
          {/* Left Side: Inputs */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            <LabelInput
              label="Shop Name"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              disabled={!shopEditing}
              placeholder="Shop Name"
            />
            <LabelInput
              label="Phone Number"
              value={shopPhone}
              onChange={(e) => setShopPhone(e.target.value)}
              disabled={!shopEditing}
              placeholder="Contact Number"
            />
            <LabelInput
              label="Full Address"
              value={shopAddress}
              onChange={(e) => setShopAddress(e.target.value)}
              disabled={!shopEditing}
              placeholder="Shop Address"
            />
            <div style={{ marginTop: "8px" }}>
              <EditButtons
                editing={shopEditing}
                onEdit={() => setShopEditing(true)}
                onSave={() => {
                  saveSettings({
                    shop_name: shopName,
                    shop_phone: shopPhone,
                    shop_address: shopAddress,
                  });
                  setShopEditing(false);
                }}
                onCancel={() => setShopEditing(false)}
              />
            </div>
          </div>

          {/* Right Side: Live Bill Preview */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "10px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--color-slate)",
                marginBottom: "8px",
              }}
            >
              Bill Header Preview
            </label>
            <div
              style={{
                border: "2px solid #000" /* Matches the bill border */,
                padding: "16px",
                background: "#fff",
                textAlign: "center",
                fontFamily: '"Special Elite", "Courier New", serif',
                color: "#000",
              }}
            >
              <div
                style={{
                  fontSize: "10px",
                  fontWeight: "bold",
                  letterSpacing: "2px",
                }}
              >
                PAWN - TICKET
              </div>
              <div
                style={{
                  fontSize: "28px",
                  fontWeight: "semibold",
                  fontFamily: "Impact, 'Arial Black', sans-serif",
                  letterSpacing: "2px",
                  lineHeight: 1.1,
                  marginTop: "2px",
                }}
              >
                {shopName || "SHOP NAME"}
              </div>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: "semibold",
                  letterSpacing: "3px",
                  fontFamily: "Impact, 'Arial Black', sans-serif",
                }}
              >
                PAWN BROKER
              </div>
              <div
                style={{
                  fontSize: "10px",
                  marginTop: "4px",
                  textTransform: "uppercase",
                }}
              >
                {shopAddress || "SHOP ADDRESS"}
              </div>
              <div
                style={{
                  fontSize: "10px",
                  display: "flex",
                  justifyContent: "center",
                  gap: "20px",
                  marginTop: "4px",
                }}
              >
                <span>&#9990; {shopPhone || "PHONE NUMBER"}</span>
                <span>
                  L. No.{" "}
                  <span
                    style={{
                      borderBottom: "1px solid #000",
                      display: "inline-block",
                      minWidth: "70px",
                    }}
                  >
                    &nbsp;
                  </span>
                </span>
              </div>
              <div
                style={{
                  fontSize: "16px",
                  color: "red",
                  fontFamily: "serif",
                  margin: "4px 0 0",
                  letterSpacing: "3px",
                }}
              >
                &#2409;&#2369;&#2349; &#9784; &#2354;&#2366;&#2349;
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* ══ ROW 1: Bill Number + Interest Rates side by side ══ */}
      <div
        className="responsive-grid" /* <-- Replaced inline styles here! */
        style={{ marginBottom: "0" }}
      >
        {/* Bill Number Format */}
        <Card
          title="Bill Number Format"
          subtitle="Prefix and starting number for new bills"
          icon={
            <Ico d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
          }
        >
          <div
            style={{
              display: "flex",
              gap: "10px",
              alignItems: "flex-end",
              flexWrap: "wrap",
              marginBottom: "12px",
            }}
          >
            <LabelInput
              label="Prefix"
              value={billPrefix}
              onChange={(e) => setBillPrefix(e.target.value)}
              disabled={!billEditing}
              placeholder="e.g. J."
              width="100px"
            />
            <LabelInput
              label="Starting Number"
              type="number"
              value={billStartNum}
              onChange={(e) => setBillStartNum(e.target.value)}
              disabled={!billEditing}
              min="1"
              width="130px"
            />
            <EditButtons
              editing={billEditing}
              onEdit={() => setBillEditing(true)}
              onSave={saveBillNumber}
              onCancel={() => setBillEditing(false)}
            />
          </div>
          <div
            style={{
              padding: "8px 12px",
              background: "var(--color-linen)",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span style={{ fontSize: "10px", color: "var(--color-slate)" }}>
              Preview:
            </span>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "15px",
                color: "var(--color-navy)",
              }}
            >
              {billPrefix}
              {billStartNum}
            </span>
            <span style={{ fontSize: "11px", color: "var(--color-warm-gray)" }}>
              →
            </span>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "15px",
                color: "var(--color-navy)",
              }}
            >
              {billPrefix}
              {parseInt(billStartNum) + 1}
            </span>
            <span style={{ fontSize: "11px", color: "var(--color-warm-gray)" }}>
              → …
            </span>
          </div>
          <p
            style={{
              fontSize: "11px",
              color: "var(--color-warm-gray)",
              marginTop: "8px",
              fontStyle: "italic",
            }}
          >
            Changing the starting number only applies to future bills.
          </p>
        </Card>

        {/* Default Interest Rates */}
        <Card
          title="Default Interest Rates"
          subtitle="Used in interest calculations on the bill detail page"
          icon={
            <Ico d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
          }
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap" /* <-- Allow wrapping on smaller screens */,
              gap: "20px",
              marginBottom: "16px",
            }}
          >
            {[
              {
                label: "Gold Rate (%)",
                value: goldRate,
                set: setGoldRate,
                min: 0.5,
                max: 4.0,
                color: "#D4A017",
              },
              {
                label: "Silver Rate (%)",
                value: silverRate,
                set: setSilverRate,
                min: 3.0,
                max: 6.0,
                color: "#5C6B8A",
              },
            ].map((f) => (
              <div key={f.label}>
                <label
                  style={{
                    display: "block",
                    fontSize: "10px",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--color-slate)",
                    marginBottom: "5px",
                  }}
                >
                  {f.label}
                </label>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <input
                    type="number"
                    step="0.1"
                    min={f.min}
                    max={f.max}
                    // 1. Safe fallback: If f.value is null/undefined/NaN, use ""
                    value={f.value ?? ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      // 2. Safe parsing: If empty, set to "", otherwise parse it
                      f.set(val === "" ? "" : parseFloat(val));
                    }}
                    style={{
                      width: "90px",
                      padding: "9px 11px",
                      fontSize: "13px",
                      border: "1px solid var(--color-linen)",
                      background: "var(--color-bg)",
                      color: f.color,
                      fontFamily: "var(--font-body)",
                      outline: "none",
                    }}
                  />
                  <span
                    style={{
                      fontSize: "13px",
                      color: "var(--color-warm-gray)",
                    }}
                  >
                    %
                  </span>
                </div>
              </div>
            ))}
          </div>
          <Btn
            variant="primary"
            size="sm"
            loading={saving}
            onClick={handleSaveRates} // <-- Point it to your new bouncer!
          >
            Save Rates
          </Btn>
        </Card>
      </div>

      {/* ══ ROW 2: H/S/O Threshold ══ */}
      <Card
        title="H/S/O Threshold Value"
        subtitle="Bills below this amount are stored at Shop (S). Bills at or above are at Home (H) or Others (O)."
        icon={
          <Ico d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        }
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap" /* <-- Let the boxes stack on mobile */,
            gap: "20px",
            alignItems: "start",
          }}
        >
          {/* Input + buttons */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "10px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--color-slate)",
                marginBottom: "5px",
              }}
            >
              Threshold Amount
            </label>
            <div
              style={{
                display: "flex",
                gap: "8px",
                alignItems: "center",
                marginBottom: "10px",
              }}
            >
              <div style={{ display: "flex" }}>
                <span
                  style={{
                    padding: "0 10px",
                    background: "var(--color-linen)",
                    border: "1px solid var(--color-linen)",
                    borderRight: "none",
                    display: "flex",
                    alignItems: "center",
                    fontSize: "13px",
                    color: "var(--color-warm-gray)",
                  }}
                >
                  ₹
                </span>
                <input
                  type="number"
                  value={thresholdInput}
                  onChange={(e) => setThresholdInput(e.target.value)}
                  disabled={!thresholdEditing}
                  style={{
                    padding: "9px 11px",
                    width: "160px",
                    border: "1px solid var(--color-linen)",
                    background: thresholdEditing
                      ? "var(--color-bg)"
                      : "var(--color-linen)",
                    fontSize: "13px",
                    fontFamily: "var(--font-body)",
                    outline: "none",
                    color: "var(--color-navy)",
                  }}
                />
              </div>
              <EditButtons
                editing={thresholdEditing}
                onEdit={() => setThresholdEditing(true)}
                onSave={() => setThresholdConfirm(true)}
                onCancel={() => {
                  setThresholdEditing(false);
                  setThresholdInput(threshold);
                }}
                saveLabel="Update"
                saveDanger
              />
            </div>
          </div>

          {/* S explainer */}
          <div
            style={{
              flex: "1",
              minWidth: "150px",
              padding: "12px",
              background: "#EAF4FB",
              border: "1px solid rgba(36,113,163,0.2)",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "22px",
                color: "#1a5276",
                marginBottom: "3px",
              }}
            >
              S
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "#1a5276",
                marginBottom: "2px",
              }}
            >
              Below {fmtINR(threshold)}
            </div>
            <div style={{ fontSize: "11px", color: "#1a5276", opacity: 0.7 }}>
              Stored at Shop
            </div>
          </div>

          {/* H/O explainer */}
          <div
            style={{
              flex: "1",
              minWidth: "150px",
              padding: "12px",
              background: "#FEF9E7",
              border: "1px solid rgba(214,137,16,0.2)",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "22px",
                color: "#7d6608",
                marginBottom: "3px",
              }}
            >
              H / O
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "#7d6608",
                marginBottom: "2px",
              }}
            >
              At or above {fmtINR(threshold)}
            </div>
            <div style={{ fontSize: "11px", color: "#7d6608", opacity: 0.7 }}>
              Home or Others (manually set)
            </div>
          </div>
        </div>
      </Card>

      {/* ══ ROW 3: Mandatory Fields ══ */}
      <Card
        title="Mandatory Fields"
        subtitle="Toggle which fields must be filled before a bill can be saved. Locked fields are always required."
        icon={
          <Ico d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        }
      >
        <div className="responsive-grid" style={{ alignItems: "start" }}>
          {" "}
          {/* <-- Use the class! */}
          {/* --- COLUMN 1: FIRST ROW LEFT --- */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "24px" }}
          >
            {/* 1. Customer */}
            <FieldGroup
              group={FIELD_GROUPS.find((g) => g.group === "Customer")}
              mandatoryFields={mandatoryFields}
              toggleMandatory={toggleMandatory}
            />

            {/* --- COLUMN 1: SECOND ROW LEFT --- */}
            {/* 2. Jewel Details */}
            <FieldGroup
              group={FIELD_GROUPS.find((g) => g.group === "Jewel Details")}
              mandatoryFields={mandatoryFields}
              toggleMandatory={toggleMandatory}
            />
          </div>
          {/* --- COLUMN 2: RIGHT HAND SIDE --- */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "24px" }}
          >
            {/* --- FIRST ROW RIGHT (STACKED) --- */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "17px" }}
            >
              {/* 3. Address */}
              <FieldGroup
                group={FIELD_GROUPS.find((g) => g.group === "Address")}
                mandatoryFields={mandatoryFields}
                toggleMandatory={toggleMandatory}
              />
              {/* 4. Amount */}
              <FieldGroup
                group={FIELD_GROUPS.find((g) => g.group === "Amount")}
                mandatoryFields={mandatoryFields}
                toggleMandatory={toggleMandatory}
              />
            </div>

            {/* --- SECOND ROW RIGHT --- */}
            {/* 5. Identity Proof */}
            <FieldGroup
              group={FIELD_GROUPS.find((g) => g.group === "Identity Proof")}
              mandatoryFields={mandatoryFields}
              toggleMandatory={toggleMandatory}
            />
          </div>
        </div>
      </Card>

      {/* ══ ROW 4: Backup & Export ══ */}
      <Card
        title="Backup & Data Export"
        subtitle="Download your entire database as an Excel file, manually or on a schedule"
        icon={
          <Ico d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        }
      >
        <div className="responsive-grid">
          {" "}
          {/* <-- Use the class! */}
          {/* Left — manual download */}
          <div>
            <p
              style={{
                fontSize: "10px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--color-slate)",
                marginBottom: "10px",
              }}
            >
              Manual Download
            </p>
            <p
              style={{
                fontSize: "12px",
                color: "var(--color-warm-gray)",
                marginBottom: "14px",
                lineHeight: "1.6",
              }}
            >
              Downloads the full database as an Excel file instantly. Released
              rows are red, renewed rows are blue.
            </p>
            <button
              onClick={async () => {
                try {
                  const token = localStorage.getItem("vaulta_token");
                  const res = await fetch(
                    `/api/settings/export/database?frequency=daily`,
                    {
                      headers: { Authorization: `Bearer ${token}` },
                    },
                  );
                  const blob = await res.blob();
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  const disposition =
                    res.headers.get("Content-Disposition") || "";
                  const match = disposition.match(/filename="(.+)"/);
                  a.download = match
                    ? match[1]
                    : `vaulta-${new Date().toISOString().split("T")[0]}.xlsx`;
                  a.click();
                  URL.revokeObjectURL(url);
                } catch {
                  alert("Failed to download. Please try again.");
                }
              }}
              style={{
                padding: "10px 18px",
                background: "var(--color-navy)",
                color: "#fff",
                border: "none",
                fontSize: "12px",
                cursor: "pointer",
                fontFamily: "var(--font-body)",
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--color-slate)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "var(--color-navy)")
              }
            >
              <Ico
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                size={13}
              />
              Download Full Database Now
            </button>
          </div>
          {/* Right — auto-backup */}
          <div className="auto-backup-container">
            <p
              style={{
                fontSize: "10px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--color-slate)",
                marginBottom: "10px",
              }}
            >
              Automatic Backup Schedule
            </p>
            <AutoBackupScheduler />
          </div>
        </div>
      </Card>

      {/* ══ ROW 5: Late Bills ══ */}
      <Card
        title="Late Bills"
        subtitle="Find and export active bills that are old and have unpaid interest"
        icon={<Ico d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />}
      >
        <div className="responsive-grid" style={{ alignItems: "start" }}>
          {" "}
          {/* <-- Use the class! */}
          {/* Left — selector */}
          <div>
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
              Show bills older than
            </label>
            <select
              value={lateMonths}
              onChange={(e) => setLateMonths(e.target.value)}
              style={{
                padding: "9px 28px 9px 11px",
                fontSize: "13px",
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
              <option value="">Select duration…</option>
              {lateOptions.map((m) => (
                <option key={m} value={m}>
                  {lateMonthLabel(m)} ({m}m+)
                </option>
              ))}
            </select>
            {!lateMonths && lateOptions.length === 0 && (
              <p
                style={{
                  fontSize: "12px",
                  color: "var(--color-warm-gray)",
                  marginTop: "8px",
                  fontStyle: "italic",
                }}
              >
                No active bills are old enough yet.
              </p>
            )}
          </div>
          {/* Right — results */}
          {lateMonths && (
            <div>
              <p
                style={{
                  fontSize: "10px",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--color-slate)",
                  marginBottom: "8px",
                }}
              >
                Columns to include
              </p>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "5px",
                  marginBottom: "14px",
                }}
              >
                {LATE_COL_OPTIONS.map((col) => {
                  const sel = selectedLateCols.includes(col.key);
                  return (
                    <button
                      key={col.key}
                      onClick={() =>
                        setSelectedLateCols((prev) =>
                          prev.includes(col.key)
                            ? prev.filter((c) => c !== col.key)
                            : [...prev, col.key],
                        )
                      }
                      style={{
                        padding: "4px 10px",
                        fontSize: "11px",
                        cursor: "pointer",
                        fontFamily: "var(--font-body)",
                        border: `1px solid ${sel ? "var(--color-navy)" : "var(--color-linen)"}`,
                        background: sel ? "var(--color-navy)" : "transparent",
                        color: sel ? "#fff" : "var(--color-warm-gray)",
                        transition: "all 0.12s",
                      }}
                    >
                      {col.label}
                    </button>
                  );
                })}
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                  padding: "10px 14px",
                  flexWrap: "wrap",
                  border: `1px solid ${lateBills.length > 0 ? "rgba(192,57,43,0.2)" : "var(--color-linen)"}`,
                  background:
                    lateBills.length > 0 ? "#FEF0F0" : "var(--color-linen)",
                }}
              >
                {lateLoading ? (
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      alignItems: "center",
                      color: "var(--color-warm-gray)",
                      fontSize: "13px",
                    }}
                  >
                    <Spinner size={14} />
                    <span>Searching…</span>
                  </div>
                ) : (
                  <div>
                    <span
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "20px",
                        color:
                          lateBills.length > 0
                            ? "#C0392B"
                            : "var(--color-navy)",
                        marginRight: "6px",
                      }}
                    >
                      {lateBills.length}
                    </span>
                    <span
                      style={{
                        fontSize: "13px",
                        color: "var(--color-warm-gray)",
                      }}
                    >
                      active bill{lateBills.length !== 1 ? "s" : ""} older than{" "}
                      {lateMonthLabel(parseInt(lateMonths))}
                    </span>
                  </div>
                )}
                <button
                  onClick={downloadLateBills}
                  disabled={!lateBills.length || lateLoading}
                  style={{
                    padding: "8px 14px",
                    border: "none",
                    fontSize: "12px",
                    cursor: lateBills.length ? "pointer" : "not-allowed",
                    background: lateBills.length
                      ? "#C0392B"
                      : "var(--color-linen)",
                    color: lateBills.length ? "#fff" : "var(--color-warm-gray)",
                    fontFamily: "var(--font-body)",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Ico
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    size={12}
                  />
                  Download
                </button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Threshold confirm modal */}
      <ConfirmModal
        open={thresholdConfirm}
        title="Update threshold value?"
        message={`Changing from ${fmtINR(threshold)} to ${fmtINR(thresholdInput)} will immediately recalculate the H/S/O column for ALL active bills. Bills below the new amount → S (Shop). Bills above → H or O. This cannot be undone.`}
        confirmLabel="Yes, Update"
        confirmVariant="danger"
        onConfirm={saveThreshold}
        onCancel={() => {
          setThresholdConfirm(false);
          setThresholdEditing(false);
          setThresholdInput(threshold);
        }}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
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

/* ── Auto Backup Scheduler ────────────────────────── */
function AutoBackupScheduler() {
  const KEY = "vaulta_backup_schedule";
  const [frequency, setFrequency] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY))?.frequency || "weekly";
    } catch {
      return "weekly";
    }
  });
  const [lastBackup, setLastBackup] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY))?.lastBackup || null;
    } catch {
      return null;
    }
  });
  const [running, setRunning] = useState(false);
  const [saved, setSaved] = useState(false);

  const isDue = (() => {
    if (!lastBackup) return false;
    const diff = (new Date() - new Date(lastBackup)) / 86400000;
    return diff >= { daily: 1, weekly: 7, monthly: 30, yearly: 365 }[frequency];
  })();

  const save = () => {
    localStorage.setItem(KEY, JSON.stringify({ frequency, lastBackup }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const run = async () => {
    setRunning(true);
    try {
      const token = localStorage.getItem("vaulta_token");
      const res = await fetch(
        `/api/settings/export/database?frequency=${frequency}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const disp = res.headers.get("Content-Disposition") || "";
      const m = disp.match(/filename="(.+)"/);
      a.download = m ? m[1] : `vaulta-backup.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      const ts = new Date().toISOString();
      setLastBackup(ts);
      localStorage.setItem(KEY, JSON.stringify({ frequency, lastBackup: ts }));
    } catch {
      alert("Backup failed. Please try again.");
    } finally {
      setRunning(false);
    }
  };

  const freqs = ["daily", "weekly", "monthly", "yearly"];

  return (
    <div>
      {/* Frequency buttons */}
      <div
        style={{
          display: "flex",
          border: "1px solid var(--color-linen)",
          overflow: "hidden",
          width: "fit-content",
          marginBottom: "10px",
        }}
      >
        {freqs.map((f) => (
          <button
            key={f}
            onClick={() => setFrequency(f)}
            style={{
              padding: "7px 14px",
              border: "none",
              cursor: "pointer",
              fontSize: "12px",
              fontFamily: "var(--font-body)",
              textTransform: "capitalize",
              background: frequency === f ? "var(--color-navy)" : "transparent",
              color: frequency === f ? "#fff" : "var(--color-warm-gray)",
              borderRight: "1px solid var(--color-linen)",
              transition: "all 0.15s",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Status */}
      <div
        style={{
          padding: "8px 12px",
          marginBottom: "12px",
          fontSize: "11px",
          border: `1px solid ${isDue ? "rgba(192,57,43,0.25)" : "var(--color-linen)"}`,
          background: isDue ? "#FEF0F0" : "var(--color-bg)",
          color: isDue ? "#922b21" : "var(--color-warm-gray)",
        }}
      >
        {lastBackup
          ? `Last: ${new Date(lastBackup).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}${isDue ? " — Overdue!" : " ✓"}`
          : "No backup yet"}
      </div>

      {/* Buttons */}
      <div style={{ display: "flex", gap: "8px" }}>
        <button
          onClick={save}
          style={{
            padding: "7px 12px",
            border: "1px solid var(--color-linen)",
            background: "transparent",
            fontSize: "11px",
            cursor: "pointer",
            color: "var(--color-navy)",
            fontFamily: "var(--font-body)",
          }}
        >
          {saved ? "✓ Saved" : "Save Schedule"}
        </button>
        <button
          onClick={run}
          disabled={running}
          style={{
            padding: "7px 12px",
            border: "none",
            fontSize: "11px",
            cursor: running ? "not-allowed" : "pointer",
            background: isDue ? "#C0392B" : "var(--color-navy)",
            color: "#fff",
            fontFamily: "var(--font-body)",
            display: "flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          {running ? (
            <>
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  border: "2px solid rgba(255,255,255,0.3)",
                  borderTop: "2px solid white",
                  borderRadius: "50%",
                  animation: "_spin 0.7s linear infinite",
                }}
              />{" "}
              Running…
            </>
          ) : (
            <>{isDue ? "Run Overdue Backup" : "Run Backup Now"}</>
          )}
        </button>
      </div>
    </div>
  );
}
