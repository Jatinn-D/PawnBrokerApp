/**
 * PawnTicket.jsx
 *
 * Renders the SUVARNA pawn ticket with bill data overlaid
 * on the printed template.  Works in two modes:
 *   1. Preview modal  — shown inside the app before printing
 *   2. Print-only div — injected into a hidden iframe for window.print()
 *
 * The template is A5 landscape-ish, approximately 148mm × 210mm when printed.
 * We work in a 794px-wide reference frame (96 dpi A4 width) scaled to the
 * actual template proportions, then the browser handles the rest via @page.
 *
 * ALL positions were derived by measuring the scanned template image carefully.
 */

import { useState, useRef } from "react";
import { numberToWords, fmtIndian, splitWeight } from "../../lib/numberWords";

/* ─────────────────────────────────────────────────────────────
   Template dimensions (px at 96dpi, matching our render canvas)
   The template image is 794 × 1050 px (A4 portrait equivalent).
   ───────────────────────────────────────────────────────────── */
const TW = 794; // template width  in px
const TH = 1050; // template height in px

/* ─── Article logic ────────────────────────────────────────── */
/**
 * Given an array of article objects, produce:
 *  - lines[]  : strings to render in the description column
 *  - weights[]: { gm, mg } per line (null if collapsed)
 *  - totalWt  : { gm, mg } always shown at end
 *
 * Rules:
 *  - Each article gets its own line if ≤ 6 articles and box has room.
 *  - If too many, collapse to "Gold/Silver Articles (N)" + merged tags.
 *  - Each line: description + unique description tags (NO purity).
 *  - Weight per line shown individually; if collapsed, show sum only.
 */
function buildArticleLines(articles, jewel_type) {
  if (!articles || articles.length === 0)
    return { lines: [], weights: [], totalWt: { gm: "0", mg: "000" } };

  const totalNetWt = articles.reduce(
    (s, a) => s + (parseFloat(a.net_weight) || 0),
    0,
  );
  const totalSplit = splitWeight(totalNetWt);

  const MAX_INDIVIDUAL = 6; // max articles to list individually

  if (articles.length <= MAX_INDIVIDUAL) {
    const lines = articles.map((a) => {
      const desc =
        a.description || `${jewel_type === "gold" ? "Gold" : "Silver"} Article`;
      const tags = (a.description_tags || []).filter(Boolean);
      return tags.length > 0 ? `${desc} (${tags.join(", ")})` : desc;
    });
    const weights = articles.map((a) => splitWeight(a.net_weight));
    return {
      lines,
      weights,
      totalWt: totalSplit,
      showIndividualWeights: articles.length > 1,
    };
  }

  // Collapse: collect all unique tags across all articles
  const allTags = [
    ...new Set(
      articles.flatMap((a) => a.description_tags || []).filter(Boolean),
    ),
  ];
  const typeLabel = jewel_type === "gold" ? "Gold" : "Silver";
  const collapsedDesc = `${typeLabel} Articles (${articles.length})${allTags.length ? " — " + allTags.join(", ") : ""}`;

  return {
    lines: [collapsedDesc],
    weights: [totalSplit],
    totalWt: totalSplit,
    showIndividualWeights: false,
  };
}

/* ─── Positioned text element ──────────────────────────────── */
function Field({
  top,
  left,
  width,
  fontSize = 13,
  bold = false,
  children,
  align = "left",
  color = "#000",
  letterSpacing,
}) {
  return (
    <div
      style={{
        position: "absolute",
        top: `${(top / TH) * 100}%`,
        left: `${(left / TW) * 100}%`,
        width: width ? `${(width / TW) * 100}%` : "auto",
        fontSize: `${fontSize}px`,
        fontFamily: bold ? "Georgia, serif" : "Arial, sans-serif",
        fontWeight: bold ? "700" : "400",
        color,
        lineHeight: 1.2,
        textAlign: align,
        letterSpacing: letterSpacing || "normal",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
      }}
    >
      {children}
    </div>
  );
}

/* ─── The actual ticket render ─────────────────────────────── */
export function PawnTicketRender({ data, templateUrl, scale = 1 }) {
  const {
    bill_number = "",
    bill_date = "",
    jewel_type = "gold",
    customer_initial = "",
    customer_name = "",
    customer_mobile = "",
    relation_type = "",
    relation_name = "",
    door_no = "",
    address = "",
    area = "",
    pincode = "",
    principal_amount = "",
    present_value = "",
    articles = [],
  } = data;

  /* ── Derived values ── */
  const fmtDate = (d) => {
    if (!d) return "";
    const [y, m, day] = d.split("-");
    return `${day}-${m}-${y}`;
  };

  const fullName = [customer_initial, customer_name].filter(Boolean).join(" ");
  const addressLine1 = [door_no, address].filter(Boolean).join(", ");
  const addressLine2Parts = [area, pincode].filter(Boolean);
  const principalFormatted = fmtIndian(principal_amount);
  const presentValueFormatted = fmtIndian(present_value);
  const inWords = numberToWords(principal_amount);
  const {
    lines: articleLines,
    weights: articleWeights,
    totalWt,
    showIndividualWeights,
  } = buildArticleLines(articles, jewel_type);

  const W = TW * scale;
  const H = TH * scale;

  return (
    <div
      style={{
        position: "relative",
        width: W,
        height: H,
        overflow: "hidden",
        background: "#fff",
        flexShrink: 0,
      }}
    >
      {/* Template background image */}
      <img
        src={templateUrl}
        alt="Pawn Ticket Template"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "fill",
        }}
        draggable={false}
      />

      {/* ── Overlay fields ── */}
      {/* All positions are measured from the template image at 794×1050 */}

      {/* Bill Number — after "Bill No." label */}
      <Field
        top={218}
        left={158}
        width={160}
        fontSize={Math.round(14 * scale)}
        bold
      >
        {bill_number}
      </Field>

      {/* Date — after "Date:" label */}
      <Field top={218} left={618} width={164} fontSize={Math.round(13 * scale)}>
        {fmtDate(bill_date)}
      </Field>

      {/* Name */}
      <Field top={260} left={115} width={660} fontSize={Math.round(13 * scale)}>
        {fullName}
      </Field>

      {/* W/o S/o D/o — relation */}
      <Field top={298} left={175} width={240} fontSize={Math.round(12 * scale)}>
        {[relation_type, relation_name].filter(Boolean).join(" ")}
      </Field>

      {/* Phone */}
      <Field top={298} left={510} width={268} fontSize={Math.round(13 * scale)}>
        {customer_mobile}
      </Field>

      {/* Address line 1 */}
      <Field top={336} left={115} width={664} fontSize={Math.round(12 * scale)}>
        {addressLine1}
      </Field>

      {/* Address line 2 (area/pincode before "Chennai") */}
      <Field top={372} left={115} width={480} fontSize={Math.round(12 * scale)}>
        {addressLine2Parts.join(", ")}
      </Field>

      {/* Principal of the Loan ₹ */}
      <Field
        top={410}
        left={292}
        width={484}
        fontSize={Math.round(14 * scale)}
        bold
      >
        {principalFormatted}
      </Field>

      {/* In words */}
      <Field top={448} left={115} width={660} fontSize={Math.round(12 * scale)}>
        {inWords}
      </Field>

      {/* ── Article description table body ── */}
      {/* Table starts at approximately y=510, each row ~38px tall, max ~6 rows */}
      {articleLines.map((line, i) => {
        const rowY = 514 + i * 38;
        const wt = articleWeights[i];
        return (
          <div key={i}>
            {/* Description */}
            <Field
              top={rowY}
              left={40}
              width={610}
              fontSize={Math.round(12 * scale)}
            >
              {line}
            </Field>
            {/* Weight Gm — if showing individual weights */}
            {showIndividualWeights && wt && (
              <>
                <Field
                  top={rowY}
                  left={660}
                  width={58}
                  fontSize={Math.round(12 * scale)}
                  align="center"
                >
                  {wt.gm}
                </Field>
                <Field
                  top={rowY}
                  left={726}
                  width={58}
                  fontSize={Math.round(12 * scale)}
                  align="center"
                >
                  {wt.mg}
                </Field>
              </>
            )}
          </div>
        );
      })}

      {/* Total weight row — shown when multiple articles */}
      {articles.length > 1 && (
        <>
          {/* "Total:" label */}
          <Field
            top={514 + articleLines.length * 38}
            left={560}
            width={92}
            fontSize={Math.round(11 * scale)}
            color="#444"
          >
            Total:
          </Field>
          <Field
            top={514 + articleLines.length * 38}
            left={660}
            width={58}
            fontSize={Math.round(12 * scale)}
            align="center"
            bold
          >
            {totalWt.gm}
          </Field>
          <Field
            top={514 + articleLines.length * 38}
            left={726}
            width={58}
            fontSize={Math.round(12 * scale)}
            align="center"
            bold
          >
            {totalWt.mg}
          </Field>
        </>
      )}

      {/* Single article — weight in the main columns (no "Total" label) */}
      {articles.length === 1 && articleWeights[0] && (
        <>
          <Field
            top={514}
            left={660}
            width={58}
            fontSize={Math.round(13 * scale)}
            align="center"
            bold
          >
            {articleWeights[0].gm}
          </Field>
          <Field
            top={514}
            left={726}
            width={58}
            fontSize={Math.round(13 * scale)}
            align="center"
            bold
          >
            {articleWeights[0].mg}
          </Field>
        </>
      )}

      {/* Present Value ₹ — bottom-right of the article table */}
      <Field
        top={870}
        left={666}
        width={120}
        fontSize={Math.round(13 * scale)}
        bold
        align="right"
      >
        {presentValueFormatted}
      </Field>
    </div>
  );
}

/* ─── Preview Modal ────────────────────────────────────────── */
export function PrintPreviewModal({
  open,
  data,
  templateUrl,
  onClose,
  onPrint,
}) {
  if (!open) return null;

  // Scale down to fit inside the modal on screen
  const PREVIEW_W = Math.min(window.innerWidth * 0.88, 720);
  const previewScale = PREVIEW_W / TW;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2000,
        background: "rgba(20, 26, 38, 0.75)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        overflowY: "auto",
        padding: "24px 16px 48px",
      }}
    >
      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }`}</style>
      <div
        style={{
          animation: "fadeIn 0.2s ease-out",
          width: "100%",
          maxWidth: "800px",
        }}
      >
        {/* Modal header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "16px",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <div>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "22px",
                color: "#fff",
                fontWeight: 400,
                marginBottom: "2px",
              }}
            >
              Print Preview
            </h2>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>
              This is exactly how the bill will print. Verify before sending to
              printer.
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={onClose}
              style={{
                padding: "10px 18px",
                background: "transparent",
                color: "rgba(255,255,255,0.7)",
                border: "1px solid rgba(255,255,255,0.2)",
                cursor: "pointer",
                fontSize: "13px",
                fontFamily: "var(--font-body)",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.08)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              Close
            </button>
            <button
              onClick={onPrint}
              style={{
                padding: "10px 24px",
                background: "var(--color-linen)",
                color: "var(--color-navy)",
                border: "none",
                cursor: "pointer",
                fontSize: "13px",
                fontFamily: "var(--font-body)",
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#fff")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "var(--color-linen)")
              }
            >
              <svg
                width="15"
                height="15"
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
              Print Now
            </button>
          </div>
        </div>

        {/* Ticket preview — scaled to fit */}
        <div
          style={{
            background: "#e8e4e0",
            padding: "24px",
            display: "flex",
            justifyContent: "center",
            boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
          }}
        >
          <div
            style={{
              boxShadow: "0 4px 24px rgba(0,0,0,0.25)",
              width: TW * previewScale,
              height: TH * previewScale,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                transform: `scale(${previewScale})`,
                transformOrigin: "top left",
                width: TW,
                height: TH,
              }}
            >
              <PawnTicketRender
                data={data}
                templateUrl={templateUrl}
                scale={1}
              />
            </div>
          </div>
        </div>

        {/* Field summary below preview */}
        <div
          style={{
            marginTop: "16px",
            padding: "16px 20px",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <p
            style={{
              fontSize: "11px",
              color: "rgba(255,255,255,0.4)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: "10px",
            }}
          >
            Fields to be printed
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "6px",
            }}
          >
            {[
              { label: "Bill No.", value: data.bill_number },
              {
                label: "Date",
                value: data.bill_date
                  ? (() => {
                      const [y, m, d] = data.bill_date.split("-");
                      return `${d}-${m}-${y}`;
                    })()
                  : "",
              },
              {
                label: "Name",
                value: [data.customer_initial, data.customer_name]
                  .filter(Boolean)
                  .join(" "),
              },
              { label: "Phone", value: data.customer_mobile },
              {
                label: "Relation",
                value: [data.relation_type, data.relation_name]
                  .filter(Boolean)
                  .join(" "),
              },
              {
                label: "Principal",
                value: `₹ ${fmtIndian(data.principal_amount)}`,
              },
              {
                label: "Present Value",
                value: `₹ ${fmtIndian(data.present_value)}`,
              },
              {
                label: "Articles",
                value: `${data.articles?.length || 0} item${data.articles?.length !== 1 ? "s" : ""}`,
              },
            ].map((f) => (
              <div
                key={f.label}
                style={{ display: "flex", gap: "8px", fontSize: "12px" }}
              >
                <span
                  style={{ color: "rgba(255,255,255,0.4)", minWidth: "90px" }}
                >
                  {f.label}
                </span>
                <span style={{ color: "rgba(255,255,255,0.85)" }}>
                  {f.value || "—"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── usePrint hook — opens a hidden iframe and prints ─────── */
export function usePawnPrint() {
  const print = (data, templateUrl) => {
    // Build print HTML — full page with just the ticket
    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<title>Pawn Ticket — ${data.bill_number}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 210mm; height: 297mm; background: #fff; }
  @page {
    size: A4 portrait;
    margin: 0;
  }
  .ticket-wrap {
    position: relative;
    width: 210mm;
    height: 297mm;
    overflow: hidden;
    background: #fff;
  }
  .ticket-wrap img {
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 100%;
    object-fit: fill;
  }
  .f {
    position: absolute;
    font-family: Arial, sans-serif;
    font-size: 10.5pt;
    color: #000;
    line-height: 1.2;
    white-space: pre-wrap;
    word-break: break-word;
  }
  .bold { font-family: Georgia, serif; font-weight: 700; }
  .center { text-align: center; }
  .right { text-align: right; }
</style>
</head>
<body>
<div class="ticket-wrap">
  <img src="${templateUrl}" />
  ${renderFieldsForPrint(data)}
</div>
</body>
</html>`;

    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.top = "-9999px";
    iframe.style.left = "-9999px";
    iframe.style.width = "210mm";
    iframe.style.height = "297mm";
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open();
    doc.write(html);
    doc.close();

    // Wait for image to load then print
    const img = doc.querySelector("img");
    const doPrint = () => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      setTimeout(() => document.body.removeChild(iframe), 2000);
    };

    if (img && !img.complete) {
      img.onload = doPrint;
      img.onerror = doPrint;
      setTimeout(doPrint, 2500); // fallback
    } else {
      setTimeout(doPrint, 300);
    }
  };

  return { print };
}

/**
 * Renders positioned field divs as HTML string for the print iframe.
 * Positions are percentages of the A4 page (210mm × 297mm).
 */
function renderFieldsForPrint(data) {
  const {
    bill_number = "",
    bill_date = "",
    customer_initial = "",
    customer_name = "",
    customer_mobile = "",
    relation_type = "",
    relation_name = "",
    door_no = "",
    address = "",
    area = "",
    pincode = "",
    principal_amount = "",
    present_value = "",
    articles = [],
    jewel_type = "gold",
  } = data;

  const fmtDate = (d) => {
    if (!d) return "";
    const [y, m, day] = d.split("-");
    return `${day}-${m}-${y}`;
  };

  const f = (top, left, w, content, extra = "") => {
    // top/left/width are percentages of the page
    return `<div class="f ${extra}" style="top:${top}%;left:${left}%;width:${w}%;">${escHtml(content)}</div>`;
  };

  const fullName = [customer_initial, customer_name].filter(Boolean).join(" ");
  const addr1 = [door_no, address].filter(Boolean).join(", ");
  const addr2 = [area, pincode].filter(Boolean).join(", ");
  const principalFmt = fmtIndian(principal_amount);
  const presentFmt = fmtIndian(present_value);
  const inWords = numberToWords(principal_amount);

  const { lines, weights, totalWt, showIndividualWeights } = buildArticleLines(
    articles,
    jewel_type,
  );

  // Convert px-based positions (at 794×1050) to percentages of 794×1050
  // Then those percentages work on any render size
  const px = (topPx, leftPx, widthPx) => ({
    top: ((topPx / TH) * 100).toFixed(3),
    left: ((leftPx / TW) * 100).toFixed(3),
    w: ((widthPx / TW) * 100).toFixed(3),
  });

  let html = "";

  const add = (topPx, leftPx, widthPx, content, cls = "") => {
    const { top, left, w } = px(topPx, leftPx, widthPx);
    html += `<div class="f ${cls}" style="top:${top}%;left:${left}%;width:${w}%;">${escHtml(content)}</div>`;
  };
  const addCenter = (topPx, leftPx, widthPx, content, cls = "") => {
    const { top, left, w } = px(topPx, leftPx, widthPx);
    html += `<div class="f center ${cls}" style="top:${top}%;left:${left}%;width:${w}%;">${escHtml(content)}</div>`;
  };
  const addRight = (topPx, leftPx, widthPx, content, cls = "") => {
    const { top, left, w } = px(topPx, leftPx, widthPx);
    html += `<div class="f right ${cls}" style="top:${top}%;left:${left}%;width:${w}%;">${escHtml(content)}</div>`;
  };

  add(218, 158, 160, bill_number, "bold");
  add(218, 618, 164, fmtDate(bill_date));
  add(260, 115, 660, fullName);
  add(298, 175, 240, [relation_type, relation_name].filter(Boolean).join(" "));
  add(298, 510, 268, customer_mobile);
  add(336, 115, 664, addr1);
  add(372, 115, 480, addr2);
  add(410, 292, 484, principalFmt, "bold");
  add(448, 115, 660, inWords);

  // Articles
  lines.forEach((line, i) => {
    const rowY = 514 + i * 38;
    add(rowY, 40, 610, line);
    const wt = weights[i];
    if ((showIndividualWeights || articles.length === 1) && wt) {
      addCenter(rowY, 660, 58, wt.gm, "bold");
      addCenter(rowY, 726, 58, wt.mg, "bold");
    }
  });

  if (articles.length > 1) {
    const totalY = 514 + lines.length * 38;
    add(totalY, 560, 92, "Total:");
    addCenter(totalY, 660, 58, totalWt.gm, "bold");
    addCenter(totalY, 726, 58, totalWt.mg, "bold");
  }

  // Present value
  addRight(870, 622, 162, presentFmt, "bold");

  return html;
}

function escHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
