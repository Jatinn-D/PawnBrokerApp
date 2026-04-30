import { useState, useEffect, useRef } from "react";

/* ── Input Field ─────────────────────────────────────── */
export function Field({
  label,
  type = "text",
  value,
  onChange,
  onBlur,
  placeholder,
  required,
  maxLength,
  hint,
  error,
  disabled,
  readOnly,
  prefix,
  suffix,
  style = {},
  ...rest
}) {
  const [focused, setFocused] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const isPwd = type === "password";

  return (
    <div style={{ ...style }}>
      {label && (
        <label
          style={{
            display: "block",
            fontSize: "11px",
            letterSpacing: "0.09em",
            textTransform: "uppercase",
            color: "var(--color-slate)",
            marginBottom: "6px",
          }}
        >
          {label}
          {required && (
            <span style={{ color: "#C0392B", marginLeft: "3px" }}>*</span>
          )}
        </label>
      )}
      <div style={{ position: "relative", display: "flex" }}>
        {prefix && (
          <div
            style={{
              padding: "0 12px",
              background: "var(--color-linen)",
              border: "1px solid var(--color-linen)",
              borderRight: "none",
              display: "flex",
              alignItems: "center",
              fontSize: "13px",
              color: "var(--color-warm-gray)",
              whiteSpace: "nowrap",
            }}
          >
            {prefix}
          </div>
        )}
        <input
          type={isPwd && showPwd ? "text" : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={disabled}
          readOnly={readOnly}
          onFocus={() => setFocused(true)}
          onBlur={(e) => {
            setFocused(false);
            onBlur && onBlur(e);
          }}
          {...rest}
          style={{
            flex: 1,
            width: "100%",
            padding: isPwd
              ? "11px 40px 11px 12px"
              : suffix
                ? "11px 40px 11px 12px"
                : "11px 12px",
            fontSize: "14px",
            border: `1px solid ${error ? "#C0392B" : focused ? "var(--color-slate)" : "var(--color-linen)"}`,
            background: disabled ? "var(--color-linen)" : "var(--color-bg)",
            color: disabled ? "var(--color-warm-gray)" : "var(--color-navy)",
            outline: "none",
            transition: "border-color 0.15s",
            fontFamily: "var(--font-body)",
            cursor: disabled ? "not-allowed" : "text",
          }}
        />
        {isPwd && (
          <button
            type="button"
            onClick={() => setShowPwd((p) => !p)}
            style={{
              position: "absolute",
              right: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--color-warm-gray)",
              padding: "2px",
              display: "flex",
            }}
          >
            {showPwd ? (
              <svg
                width="16"
                height="16"
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
                width="16"
                height="16"
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
        {suffix && !isPwd && (
          <div
            style={{
              position: "absolute",
              right: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: "12px",
              color: "var(--color-warm-gray)",
            }}
          >
            {suffix}
          </div>
        )}
      </div>
      {error && (
        <p style={{ fontSize: "11px", color: "#C0392B", marginTop: "4px" }}>
          {error}
        </p>
      )}
      {hint && !error && (
        <p
          style={{
            fontSize: "11px",
            color: "var(--color-warm-gray)",
            marginTop: "4px",
          }}
        >
          {hint}
        </p>
      )}
    </div>
  );
}

/* ── Select ──────────────────────────────────────────── */
export function Select({
  label,
  value,
  onChange,
  options = [],
  required,
  error,
  hint,
  disabled,
  style = {},
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ ...style }}>
      {label && (
        <label
          style={{
            display: "block",
            fontSize: "11px",
            letterSpacing: "0.09em",
            textTransform: "uppercase",
            color: "var(--color-slate)",
            marginBottom: "6px",
          }}
        >
          {label}
          {required && (
            <span style={{ color: "#C0392B", marginLeft: "3px" }}>*</span>
          )}
        </label>
      )}
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%",
          padding: "11px 12px",
          fontSize: "14px",
          border: `1px solid ${error ? "#C0392B" : focused ? "var(--color-slate)" : "var(--color-linen)"}`,
          background: disabled ? "var(--color-linen)" : "var(--color-bg)",
          color: value ? "var(--color-navy)" : "var(--color-warm-gray)",
          outline: "none",
          fontFamily: "var(--font-body)",
          cursor: disabled ? "not-allowed" : "pointer",
          appearance: "none",
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' viewBox='0 0 24 24' stroke='%236E6F73' stroke-width='2'%3E%3Cpath stroke-linecap='square' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 12px center",
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && (
        <p style={{ fontSize: "11px", color: "#C0392B", marginTop: "4px" }}>
          {error}
        </p>
      )}
      {hint && !error && (
        <p
          style={{
            fontSize: "11px",
            color: "var(--color-warm-gray)",
            marginTop: "4px",
          }}
        >
          {hint}
        </p>
      )}
    </div>
  );
}

/* ── Textarea ────────────────────────────────────────── */
export function Textarea({
  label,
  value,
  onChange,
  placeholder,
  required,
  error,
  rows = 3,
  style = {},
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ ...style }}>
      {label && (
        <label
          style={{
            display: "block",
            fontSize: "11px",
            letterSpacing: "0.09em",
            textTransform: "uppercase",
            color: "var(--color-slate)",
            marginBottom: "6px",
          }}
        >
          {label}
          {required && (
            <span style={{ color: "#C0392B", marginLeft: "3px" }}>*</span>
          )}
        </label>
      )}
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%",
          padding: "11px 12px",
          fontSize: "14px",
          resize: "vertical",
          border: `1px solid ${error ? "#C0392B" : focused ? "var(--color-slate)" : "var(--color-linen)"}`,
          background: "var(--color-bg)",
          color: "var(--color-navy)",
          outline: "none",
          fontFamily: "var(--font-body)",
          lineHeight: "1.6",
        }}
      />
      {error && (
        <p style={{ fontSize: "11px", color: "#C0392B", marginTop: "4px" }}>
          {error}
        </p>
      )}
    </div>
  );
}

/* ── Button ──────────────────────────────────────────── */
export function Btn({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled,
  loading,
  icon,
  style = {},
  size = "md",
}) {
  const pad =
    size === "sm" ? "8px 16px" : size === "lg" ? "14px 32px" : "11px 22px";
  const fs = size === "sm" ? "12px" : size === "lg" ? "15px" : "13px";

  const styles = {
    primary: {
      bg: "var(--color-navy)",
      color: "#fff",
      border: "1px solid var(--color-navy)",
    },
    secondary: {
      bg: "transparent",
      color: "var(--color-navy)",
      border: "1px solid var(--color-linen)",
    },
    danger: {
      bg: "transparent",
      color: "#C0392B",
      border: "1px solid rgba(192,57,43,0.3)",
    },
    ghost: {
      bg: "transparent",
      color: "var(--color-slate)",
      border: "1px solid transparent",
    },
    success: {
      bg: "transparent",
      color: "#27AE60",
      border: "1px solid rgba(39,174,96,0.3)",
    },
  };
  const s = styles[variant] || styles.primary;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: pad,
        fontSize: fs,
        letterSpacing: "0.03em",
        background: disabled || loading ? "var(--color-linen)" : s.bg,
        color: disabled || loading ? "var(--color-warm-gray)" : s.color,
        border: disabled || loading ? "1px solid var(--color-linen)" : s.border,
        cursor: disabled || loading ? "not-allowed" : "pointer",
        transition: "all 0.15s",
        fontFamily: "var(--font-body)",
        whiteSpace: "nowrap",
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!disabled && !loading) {
          if (variant === "primary")
            e.currentTarget.style.background = "var(--color-slate)";
          else if (variant === "secondary")
            e.currentTarget.style.background = "var(--color-linen)";
          else if (variant === "danger")
            e.currentTarget.style.background = "rgba(192,57,43,0.06)";
          else if (variant === "success")
            e.currentTarget.style.background = "rgba(39,174,96,0.06)";
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !loading)
          e.currentTarget.style.background =
            disabled || loading ? "var(--color-linen)" : s.bg;
      }}
    >
      {loading && <Spinner size={14} color="currentColor" />}
      {!loading && icon}
      {children}
    </button>
  );
}

/* ── Spinner ─────────────────────────────────────────── */
export function Spinner({ size = 18, color = "var(--color-navy)" }) {
  return (
    <>
      <style>{`@keyframes _spin { to { transform: rotate(360deg); } }`}</style>
      <div
        style={{
          width: size,
          height: size,
          flexShrink: 0,
          border: `2px solid ${color}22`,
          borderTop: `2px solid ${color}`,
          borderRadius: "50%",
          animation: "_spin 0.7s linear infinite",
        }}
      />
    </>
  );
}

/* ── Toggle (Gold / Silver) ──────────────────────────── */
export function JewelToggle({ value, onChange }) {
  return (
    <div
      style={{
        display: "flex",
        border: "1px solid var(--color-linen)",
        overflow: "hidden",
        width: "fit-content",
      }}
    >
      {["gold", "silver"].map((type) => (
        <button
          key={type}
          type="button"
          onClick={() => onChange(type)}
          style={{
            padding: "9px 28px",
            background:
              value === type
                ? type === "gold"
                  ? "#D4A017"
                  : "#5C6B8A"
                : "transparent",
            color: value === type ? "#fff" : "var(--color-warm-gray)",
            border: "none",
            cursor: "pointer",
            fontSize: "13px",
            letterSpacing: "0.05em",
            textTransform: "capitalize",
            transition: "all 0.15s",
            fontFamily: "var(--font-body)",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <div
            style={{
              width: "8px",
              height: "8px",
              background:
                value === type
                  ? "#fff"
                  : type === "gold"
                    ? "#D4A017"
                    : "#5C6B8A",
              transition: "all 0.15s",
            }}
          />
          {type === "gold" ? "Gold" : "Silver"}
        </button>
      ))}
    </div>
  );
}

/* ── Tag multi-select ────────────────────────────────── */
export function TagSelect({
  label,
  tags,
  selected,
  onToggle,
  onAddCustom,
  multiple = true,
  style = {},
}) {
  const [adding, setAdding] = useState(false);
  const [custom, setCustom] = useState("");

  const handleAdd = () => {
    if (custom.trim()) {
      onAddCustom(custom.trim());
      setCustom("");
      setAdding(false);
    }
  };

  return (
    <div style={{ ...style }}>
      {label && (
        <label
          style={{
            display: "block",
            fontSize: "11px",
            letterSpacing: "0.09em",
            textTransform: "uppercase",
            color: "var(--color-slate)",
            marginBottom: "8px",
          }}
        >
          {label}
        </label>
      )}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "6px",
          alignItems: "center",
        }}
      >
        {tags.map((tag, index) => {
          const active = selected.includes(tag);
          return (
            <button
              key={`${tag}-${index}`}
              type="button"
              onClick={() => {
                if (!multiple) {
                  onToggle(active ? "" : tag);
                } else {
                  onToggle(tag);
                }
              }}
              style={{
                padding: "5px 12px",
                fontSize: "12px",
                border: `1px solid ${active ? "var(--color-navy)" : "var(--color-linen)"}`,
                background: active ? "var(--color-navy)" : "transparent",
                color: active ? "#fff" : "var(--color-warm-gray)",
                cursor: "pointer",
                transition: "all 0.15s",
                fontFamily: "var(--font-body)",
              }}
            >
              {tag}
            </button>
          );
        })}
        {onAddCustom && !adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            style={{
              padding: "5px 10px",
              fontSize: "12px",
              border: "1px dashed var(--color-linen)",
              background: "transparent",
              color: "var(--color-slate)",
              cursor: "pointer",
              fontFamily: "var(--font-body)",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <svg
              width="12"
              height="12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="square" d="M12 4v16m8-8H4" />
            </svg>
            Custom
          </button>
        )}
        {adding && (
          <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
            <input
              autoFocus
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAdd();
                }
                if (e.key === "Escape") setAdding(false);
              }}
              placeholder="Type tag..."
              style={{
                padding: "5px 10px",
                fontSize: "12px",
                border: "1px solid var(--color-slate)",
                background: "var(--color-bg)",
                fontFamily: "var(--font-body)",
                outline: "none",
                width: "110px",
              }}
            />
            <button
              type="button"
              onClick={handleAdd}
              style={{
                padding: "5px 8px",
                background: "var(--color-navy)",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                fontSize: "11px",
              }}
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setAdding(false)}
              style={{
                padding: "5px 8px",
                background: "none",
                border: "1px solid var(--color-linen)",
                cursor: "pointer",
                fontSize: "11px",
                color: "var(--color-warm-gray)",
              }}
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Image Upload (with camera capture) ──────────────── */
export function ImageUpload({ label, value, onChange, hint, style = {} }) {
  const [dragging, setDragging] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const uploadId = `upload-${(label || Math.random()).toString().replace(/\s/g, "-")}`;

  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => onChange({ file, preview: e.target.result });
    reader.readAsDataURL(file);
  };

  const openCamera = async (e) => {
    e.stopPropagation();
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {
      alert("Camera access denied or not available on this device.");
      setShowCamera(false);
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        const file = new File([blob], `photo-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        const reader = new FileReader();
        reader.onload = (e) => onChange({ file, preview: e.target.result });
        reader.readAsDataURL(file);
        closeCamera();
      },
      "image/jpeg",
      0.92,
    );
  };

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  return (
    <div style={{ ...style }}>
      {label && (
        <label
          style={{
            display: "block",
            fontSize: "11px",
            letterSpacing: "0.09em",
            textTransform: "uppercase",
            color: "var(--color-slate)",
            marginBottom: "6px",
          }}
        >
          {label}
        </label>
      )}

      {/* Camera modal */}
      {showCamera && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            zIndex: 3000,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
            padding: "20px",
          }}
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            style={{
              maxWidth: "100%",
              maxHeight: "60vh",
              border: "2px solid rgba(255,255,255,0.2)",
            }}
          />
          <canvas ref={canvasRef} style={{ display: "none" }} />
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={capturePhoto}
              style={{
                width: "64px",
                height: "64px",
                background: "white",
                border: "4px solid rgba(255,255,255,0.4)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="28"
                height="28"
                fill="none"
                viewBox="0 0 24 24"
                stroke="var(--color-navy)"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="square"
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="square"
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
            <button
              onClick={closeCamera}
              style={{
                padding: "12px 24px",
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.3)",
                color: "white",
                cursor: "pointer",
                fontSize: "13px",
                fontFamily: "var(--font-body)",
              }}
            >
              Cancel
            </button>
          </div>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px" }}>
            Tap the shutter button to capture
          </p>
        </div>
      )}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFile(e.dataTransfer.files[0]);
        }}
        style={{
          border: `1px dashed ${dragging ? "var(--color-navy)" : "var(--color-linen)"}`,
          background: dragging ? "rgba(47,58,85,0.03)" : "var(--color-bg)",
          transition: "all 0.15s",
          position: "relative",
          minHeight: "80px",
        }}
      >
        <input
          id={uploadId}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => handleFile(e.target.files[0])}
        />

        {value?.preview ? (
          <div
            style={{
              padding: "8px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <img
              src={value.preview}
              alt="preview"
              style={{
                maxHeight: "80px",
                maxWidth: "100%",
                objectFit: "contain",
              }}
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
              style={{
                position: "absolute",
                top: "6px",
                right: "6px",
                background: "rgba(47,58,85,0.8)",
                color: "#fff",
                border: "none",
                padding: "3px 6px",
                fontSize: "11px",
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          </div>
        ) : (
          <div
            style={{
              padding: "12px 8px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <svg
              width="20"
              height="20"
              fill="none"
              viewBox="0 0 24 24"
              stroke="var(--color-warm-gray)"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="square"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span
              style={{
                fontSize: "11px",
                color: "var(--color-warm-gray)",
                textAlign: "center",
              }}
            >
              {hint || "Upload photo"}
            </span>
            {/* Two action buttons */}
            <div style={{ display: "flex", gap: "6px", marginTop: "2px" }}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  document.getElementById(uploadId).click();
                }}
                style={{
                  padding: "5px 10px",
                  fontSize: "11px",
                  cursor: "pointer",
                  border: "1px solid var(--color-linen)",
                  background: "transparent",
                  color: "var(--color-slate)",
                  fontFamily: "var(--font-body)",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  transition: "all 0.12s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.borderColor = "var(--color-slate)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.borderColor = "var(--color-linen)")
                }
              >
                <svg
                  width="11"
                  height="11"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="square"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
                Upload
              </button>
              <button
                type="button"
                onClick={openCamera}
                style={{
                  padding: "5px 10px",
                  fontSize: "11px",
                  cursor: "pointer",
                  border: "1px solid var(--color-linen)",
                  background: "transparent",
                  color: "var(--color-slate)",
                  fontFamily: "var(--font-body)",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  transition: "all 0.12s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.borderColor = "var(--color-slate)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.borderColor = "var(--color-linen)")
                }
              >
                <svg
                  width="11"
                  height="11"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="square"
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="square"
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Camera
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Confirm Modal ───────────────────────────────────── */
export function ConfirmModal({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = "Confirm",
  confirmVariant = "primary",
}) {
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(47,58,85,0.45)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "var(--color-bg)",
          border: "1px solid var(--color-linen)",
          maxWidth: "420px",
          width: "100%",
          padding: "28px",
          animation: "fadeIn 0.18s ease-out",
        }}
      >
        <h3
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "20px",
            color: "var(--color-navy)",
            marginBottom: "10px",
            fontWeight: 400,
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontSize: "14px",
            color: "var(--color-warm-gray)",
            lineHeight: "1.7",
            marginBottom: "24px",
          }}
        >
          {message}
        </p>
        <div
          style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}
        >
          <Btn variant="secondary" onClick={onCancel}>
            Cancel
          </Btn>
          <Btn variant={confirmVariant} onClick={onConfirm}>
            {confirmLabel}
          </Btn>
        </div>
      </div>
    </div>
  );
}

/* ── Toast notification ──────────────────────────────── */
export function Toast({ message, type = "success", onClose }) {
  const colors = {
    success: {
      bg: "var(--color-success-light)",
      border: "rgba(39,174,96,0.3)",
      text: "#1e8449",
    },
    error: {
      bg: "var(--color-danger-light)",
      border: "rgba(192,57,43,0.3)",
      text: "#922b21",
    },
    info: {
      bg: "var(--color-info-light)",
      border: "rgba(36,113,163,0.3)",
      text: "#1a5276",
    },
  };
  const c = colors[type] || colors.success;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 2000,
        background: c.bg,
        border: `1px solid ${c.border}`,
        padding: "14px 20px",
        maxWidth: "380px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        animation: "fadeIn 0.2s ease-out",
        boxShadow: "0 4px 16px rgba(47,58,85,0.12)",
      }}
    >
      <span
        style={{ fontSize: "14px", color: c.text, flex: 1, lineHeight: "1.5" }}
      >
        {message}
      </span>
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: c.text,
          fontSize: "16px",
          padding: "0 2px",
          flexShrink: 0,
        }}
      >
        ✕
      </button>
    </div>
  );
}

/* ── Section Divider ─────────────────────────────────── */
export function SectionDivider({ title, subtitle }) {
  return (
    <div
      style={{
        margin: "32px 0 20px",
        paddingBottom: "12px",
        borderBottom: "1px solid var(--color-linen)",
      }}
    >
      <h3
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "18px",
          color: "var(--color-navy)",
          fontWeight: 400,
          marginBottom: subtitle ? "4px" : 0,
        }}
      >
        {title}
      </h3>
      {subtitle && (
        <p style={{ fontSize: "13px", color: "var(--color-warm-gray)" }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

/* ── Amount Input (Indian numbering) ─────────────────── */
export function AmountInput({
  label,
  value,
  onChange,
  required,
  error,
  hint,
  disabled,
  style = {},
}) {
  const [raw, setRaw] = useState(value ? String(value).replace(/,/g, "") : "");
  const [focused, setFocused] = useState(false);

  // Sync internal raw state when parent clears the value (e.g. Clear Fields)
  useEffect(() => {
    if (value === "" || value === null || value === undefined) {
      setRaw("");
    }
  }, [value]);

  const formatIndian = (num) => {
    if (!num) return "";
    const n = String(num).replace(/[^0-9]/g, "");
    if (!n) return "";
    const lastThree = n.slice(-3);
    const rest = n.slice(0, -3);
    const formatted = rest
      ? rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree
      : lastThree;
    return formatted;
  };

  const handleChange = (e) => {
    const digits = e.target.value.replace(/[^0-9]/g, "");
    setRaw(digits);
    onChange(digits ? parseInt(digits, 10) : "");
  };

  const displayValue = focused ? raw : formatIndian(raw);

  return (
    <div style={{ ...style }}>
      {label && (
        <label
          style={{
            display: "block",
            fontSize: "11px",
            letterSpacing: "0.09em",
            textTransform: "uppercase",
            color: "var(--color-slate)",
            marginBottom: "6px",
          }}
        >
          {label}
          {required && (
            <span style={{ color: "#C0392B", marginLeft: "3px" }}>*</span>
          )}
        </label>
      )}
      <div style={{ position: "relative", display: "flex" }}>
        <div
          style={{
            padding: "0 12px",
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
        </div>
        <input
          type="text"
          inputMode="numeric"
          onWheel={(e) => e.target.blur()}
          value={displayValue}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
          }}
          disabled={disabled}
          placeholder="0"
          style={{
            flex: 1,
            padding: "11px 12px",
            fontSize: "14px",
            border: `1px solid ${error ? "#C0392B" : focused ? "var(--color-slate)" : "var(--color-linen)"}`,
            background: disabled ? "var(--color-linen)" : "var(--color-bg)",
            color: "var(--color-navy)",
            outline: "none",
            fontFamily: "var(--font-body)",
          }}
        />
      </div>
      {!focused && raw && (
        <p
          style={{
            fontSize: "11px",
            color: "var(--color-slate)",
            marginTop: "3px",
          }}
        >
          ₹ {formatIndian(raw)}
        </p>
      )}
      {error && (
        <p style={{ fontSize: "11px", color: "#C0392B", marginTop: "4px" }}>
          {error}
        </p>
      )}
      {hint && !error && (
        <p
          style={{
            fontSize: "11px",
            color: "var(--color-warm-gray)",
            marginTop: "4px",
          }}
        >
          {hint}
        </p>
      )}
    </div>
  );
}
