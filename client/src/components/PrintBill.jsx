import { useState, useEffect } from "react";
import { numberToWords } from "../lib/numberToWords";

// ── Formatters ──────────────────────────────────────────────
const fmtDate = (d) => {
  if (!d) return "";
  const [y, m, day] = String(d).split("T")[0].split("-");
  return `${day}-${m}-${y}`;
};

const fmtINR = (n) => {
  if (!n && n !== 0) return "";
  const int = Math.round(parseFloat(n)).toString();
  const last3 = int.slice(-3);
  const rest = int.slice(0, -3);
  return rest
    ? rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + last3
    : last3;
};

const splitWeight = (w) => {
  const num = parseFloat(w) || 0;
  const gm = Math.floor(num);
  const mg = Math.round((num - gm) * 1000);
  return { gm: String(gm), mg: mg > 0 ? String(mg).padStart(3, "0") : "" };
};

function buildArticleRows(articles, maxRows = 8) {
  if (!articles || articles.length === 0) return [];
  if (articles.length <= maxRows) {
    return articles.map((a) => {
      const tags = (a.description_tags || []).filter(Boolean).join(", ");
      const desc = [a.description, tags].filter(Boolean).join(" — ");
      const wt = splitWeight(a.net_weight);
      return { text: desc || "", gm: wt.gm, mg: wt.mg };
    });
  }
  const totalWt = articles.reduce(
    (s, a) => s + (parseFloat(a.net_weight) || 0),
    0,
  );
  const { gm, mg } = splitWeight(totalWt);
  const allTags = [
    ...new Set(articles.flatMap((a) => a.description_tags || [])),
  ];
  const tagStr = allTags.length ? ` — ${allTags.join(", ")}` : "";
  return [{ text: `Gold Articles (${articles.length})${tagStr}`, gm, mg }];
}

const UL = ({
  children,
  flex = 1,
  bold = false,
  fontSize = "inherit",
  minWidth,
  style = {},
}) => (
  <span
    style={{
      flex,
      display: "inline-block",
      borderBottom: "1px solid #000",
      minWidth: minWidth || undefined,
      fontSize,
      fontWeight: bold ? "bold" : "normal",
      paddingBottom: "1px",
      paddingLeft: "3px",
      lineHeight: 1.2,
      verticalAlign: "bottom",
      ...style,
    }}
  >
    {children}&nbsp;
  </span>
);

const LBL = ({ children, style = {} }) => (
  <span
    style={{
      paddingTop: "2px",
      fontFamily: "Arial, Helvetica, sans-serif",
      fontSize: "13px",
      fontWeight: "bold",
      whiteSpace: "nowrap",
      lineHeight: 1.2,
      ...style,
    }}
  >
    {children}
  </span>
);

// ── ON-SCREEN PREVIEW CANVAS ─────────────────────────────────
export function PrintCanvas({ bill, articles, settings }) {
  const articleRows = buildArticleRows(articles);
  const totalNetWeight = articles.reduce(
    (s, a) => s + (parseFloat(a.net_weight) || 0),
    0,
  );
  const totalWt = splitWeight(totalNetWeight);
  const showTotalRow = articles.length > 1;
  const MIN_ROWS = 7;
  const emptyRows = Math.max(
    0,
    MIN_ROWS - articleRows.length - (showTotalRow ? 1 : 0),
  );
  const relLine = [bill.relation_type, bill.relation_name]
    .filter(Boolean)
    .join(" ");
  const addr1 = [bill.door_no, bill.address].filter(Boolean).join(", ");

  return (
    <div
      style={{
        width: "560px", // Exact pixel equivalent of 148mm
        minHeight: "794px", // Exact pixel equivalent of 210mm
        fontFamily: "Arial, Helvetica, sans-serif",
        background: "#fff",
        padding: "30px", // Exact pixel equivalent of 8mm
        boxSizing: "border-box",
        color: "#000",
      }}
    >
      {/* 4-SIDED INNER BORDER */}
      <div
        style={{
          border: "2px solid #000",
          padding: "12px",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* ── HEADER WITH IMAGES ── */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "2px solid #000",
            padding: "0 10px 8px",
            marginBottom: "8px",
          }}
        >
          {/* Left Image (Lakshmi) */}
          <div style={{ width: "80px", height: "80px" }}>
            <img
              src="/lakshmi.png"
              alt="Lakshmi"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
              onError={(e) => (e.target.style.display = "none")}
            />
          </div>

          {/* Center Text */}
          <div style={{ textAlign: "center", flex: 1 }}>
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
                fontWeight: "bold",
                letterSpacing: "1px",
                lineHeight: 1.1,
                marginTop: "2px",
              }}
            >
              {settings?.shop_name || "YOUR SHOP NAME"}
            </div>
            <div
              style={{
                fontSize: "14px",
                fontWeight: "bold",
                letterSpacing: "2px",
                marginTop: "2px",
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
              {settings?.shop_address || "YOUR SHOP ADDRESS"}
            </div>
            <div
              style={{
                fontSize: "10px",
                display: "flex",
                justifyContent: "center",
                gap: "24px",
                marginTop: "2px",
              }}
            >
              <span>☎ {settings?.shop_phone || "PHONE NUMBER"}</span>
              <span>
                L. No.{" "}
                <span
                  style={{
                    borderBottom: "1px solid #000",
                    display: "inline-block",
                    minWidth: "60px",
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
                fontWeight: "bold",
                margin: "4px 0 0",
                letterSpacing: "2px",
              }}
            >
              ॥शुभ 卐 लाभ॥
            </div>
          </div>

          {/* Right Image (Ganesha) */}
          <div style={{ width: "80px", height: "80px" }}>
            <img
              src="/ganesha.png"
              alt="Ganesha"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
              onError={(e) => (e.target.style.display = "none")}
            />
          </div>
        </div>

        {/* ── BILL DETAILS ── */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            padding: "2px 0",
            gap: "8px",
          }}
        >
          <LBL>Bill No.</LBL>
          <UL flex={1} bold fontSize="14px">
            {bill.bill_number}
          </UL>
          <LBL style={{ marginLeft: "10px" }}>Date:</LBL>
          <UL flex={1} bold fontSize="14px">
            {fmtDate(bill.bill_date)}
          </UL>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            padding: "2px 0",
            gap: "8px",
          }}
        >
          <LBL>Name</LBL>
          <UL flex={1} fontSize="13px">
            {bill.customer_initial} {bill.customer_name}
          </UL>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            padding: "2px 0",
            gap: "8px",
          }}
        >
          <LBL>W/o S/o D/o</LBL>
          <UL flex={2}>{relLine}</UL>
          <LBL style={{ marginLeft: "8px" }}>Phone:</LBL>
          <UL flex={1}>{bill.customer_mobile}</UL>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            padding: "2px 0",
            gap: "8px",
          }}
        >
          <LBL>Address</LBL>
          <UL flex={1}>{addr1}</UL>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            padding: "2px 0",
            gap: "8px",
          }}
        >
          <UL flex={3} style={{ marginLeft: "0" }}>
            {bill.area}
          </UL>
          <LBL>Chennai</LBL>
          <UL
            minWidth="40px"
            style={{ flex: "none", width: "60px", textAlign: "center" }}
          >
            {bill.pincode}
          </UL>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            padding: "2px 0",
            gap: "8px",
            marginTop: "4px",
          }}
        >
          <LBL>Principal of the Loan ₹</LBL>
          <UL flex={1} bold fontSize="15px">
            {fmtINR(bill.principal_amount)}
          </UL>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            padding: "2px 0",
            gap: "8px",
          }}
        >
          <LBL>In words</LBL>
          <UL flex={1} fontSize="11px" style={{ whiteSpace: "normal" }}>
            {numberToWords(bill.principal_amount)}
          </UL>
        </div>

        {/* ── VALIDITY (Single Line) ── */}
        <div
          style={{
            padding: "6px 0 2px",
            fontSize: "8.5px",
            textAlign: "center",
            marginTop: "4px",
            whiteSpace: "nowrap",
          }}
        >
          இன்று முதல் 12 மாதங்களுக்கு இந்த ரசீது செல்லும் &nbsp;|&nbsp;{" "}
          <strong>This Ticket is VALID for 12 months from the Loan Date</strong>
        </div>

        {/* ── ARTICLE TABLE ── */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            tableLayout: "fixed",
            fontSize: "12px",
            border: "2px solid #000",
          }}
        >
          <colgroup>
            <col style={{ width: "80%" }} />
            <col style={{ width: "10%" }} />
            <col style={{ width: "10%" }} />
          </colgroup>
          <thead>
            <tr>
              <th
                style={{
                  padding: "6px 8px",
                  textAlign: "left",
                  fontSize: "12px",
                  borderRight: "1px solid #000",
                  borderBottom: "2px solid #000",
                }}
              >
                Detailed Description of articles
              </th>
              <th
                style={{
                  padding: "6px 4px",
                  textAlign: "center",
                  fontSize: "12px",
                  borderRight: "1px solid #000",
                  borderBottom: "2px solid #000",
                }}
              >
                Gm.
              </th>
              <th
                style={{
                  padding: "6px 4px",
                  textAlign: "center",
                  fontSize: "12px",
                  borderBottom: "2px solid #000",
                }}
              >
                Mg.
              </th>
            </tr>
          </thead>
          <tbody>
            {articleRows.map((row, i) => (
              <tr key={i}>
                <td
                  style={{
                    padding: "6px 8px",
                    verticalAlign: "top",
                    borderRight: "1px solid #000",
                    borderBottom: "1px solid #000",
                    lineHeight: 1.4,
                  }}
                >
                  {row.text}
                </td>
                <td
                  style={{
                    padding: "6px 4px",
                    textAlign: "center",
                    verticalAlign: "top",
                    borderRight: "1px solid #000",
                    borderBottom: "1px solid #000",
                  }}
                >
                  {row.gm}
                </td>
                <td
                  style={{
                    padding: "6px 4px",
                    textAlign: "center",
                    verticalAlign: "top",
                    borderBottom: "1px solid #000",
                  }}
                >
                  {row.mg}
                </td>
              </tr>
            ))}
            {showTotalRow && (
              <tr>
                <td
                  style={{
                    padding: "5px 8px",
                    fontSize: "11px",
                    color: "#333",
                    borderRight: "1px solid #000",
                    borderBottom: "1px solid #000",
                    fontStyle: "italic",
                  }}
                >
                  Total Net Weight
                </td>
                <td
                  style={{
                    padding: "5px 4px",
                    textAlign: "center",
                    borderRight: "1px solid #000",
                    borderBottom: "1px solid #000",
                    fontWeight: "bold",
                  }}
                >
                  {totalWt.gm}
                </td>
                <td
                  style={{
                    padding: "5px 4px",
                    textAlign: "center",
                    borderBottom: "1px solid #000",
                    fontWeight: "bold",
                  }}
                >
                  {totalWt.mg}
                </td>
              </tr>
            )}
            {/* Empty Rows */}
            {Array.from({ length: emptyRows }).map((_, i) => (
              <tr key={`empty-${i}`}>
                <td
                  style={{
                    padding: "4px 8px",
                    borderRight: "1px solid #000",
                    height: "24px",
                  }}
                >
                  &nbsp;
                </td>
                <td style={{ padding: "4px", borderRight: "1px solid #000" }}>
                  &nbsp;
                </td>
                <td style={{ padding: "4px" }}>&nbsp;</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: "2px solid #000" }}>
              <td style={{ borderRight: "1px solid #000", padding: "0" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    border: "none",
                    margin: "0",
                  }}
                >
                  <tbody>
                    <tr>
                      <td
                        style={{
                          padding: "6px",
                          fontSize: "10px",
                          width: "50%",
                          borderRight: "1px solid #000",
                          verticalAlign: "top",
                          borderBottom: "none",
                        }}
                      >
                        அடகு வைக்கும் பொருளுக்கு கடைசி
                        <br />
                        தவணை 1 வருடம் 7 நாட்கள்
                      </td>
                      <td
                        style={{
                          padding: "6px",
                          fontSize: "10px",
                          verticalAlign: "top",
                          borderBottom: "none",
                        }}
                      >
                        3 மாதத்திற்கு ஒரு முறை வட்டி கட்ட
                        <br />
                        வேண்டும்
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
              <td
                colSpan={2}
                style={{
                  padding: "6px",
                  textAlign: "center",
                  verticalAlign: "middle",
                }}
              >
                <div style={{ fontSize: "10px", fontWeight: "bold" }}>
                  Present Value
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: "bold",
                    marginTop: "4px",
                  }}
                >
                  ₹ {fmtINR(bill.present_value)}
                </div>
              </td>
            </tr>
          </tfoot>
        </table>

        {/* ── FOOTER WITH SIGNATURE SPACE ── */}
        <div
          style={{
            marginTop: "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              padding: "4px 0",
              textAlign: "center",
              fontSize: "10px",
              fontWeight: "bold",
              letterSpacing: "0.5px",
              borderTop: "1px solid #000",
            }}
          >
            I (PAWNER) DECLARE MY ANNUAL INCOME IS MORE THAN RS. 2,00,000
          </div>

          {/* EMPTY SPACE FOR SIGNATURES */}
          <div style={{ height: "50px" }}></div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "0 10px 4px",
              fontSize: "11px",
              fontWeight: "bold",
            }}
          >
            <span>Prop. or Agent</span>
            <span>Form F (Section 7 &amp; Rule 8)</span>
            <span>Sign. of Pawner</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── ACTUAL PRINT GENERATOR ────────────────────────────────────
export function PrintPreviewModal(props) {
  let { bill, articles, onClose, settings } = props;
  const [scale, setScale] = useState(1);

  // Magic calculation to perfectly shrink the bill to fit any phone screen
  useEffect(() => {
    const updateScale = () => {
      const availableWidth = window.innerWidth - 40; // 20px padding on each side
      const baseWidth = 560; // Our fixed pixel width for A5
      if (availableWidth < baseWidth) {
        setScale(availableWidth / baseWidth);
      } else {
        setScale(1);
      }
    };
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  if (props.open === false) return null;
  if (!bill && props.data) bill = props.data;
  if (!Array.isArray(articles)) articles = bill?.articles || [];
  bill = bill || {};

  // Cleanly remove iframe when modal closes
  const handleClose = () => {
    const iframe = document.getElementById("print-iframe");
    if (iframe) iframe.remove();
    onClose();
  };

  const handlePrint = () => {
    const articleRows = buildArticleRows(articles);
    const totalNetWeight = articles.reduce(
      (s, a) => s + (parseFloat(a.net_weight) || 0),
      0,
    );
    const totalWt = splitWeight(totalNetWeight);
    const showTotalRow = articles.length > 1;
    const MIN_ROWS = 7;
    const emptyRows = Math.max(
      0,
      MIN_ROWS - articleRows.length - (showTotalRow ? 1 : 0),
    );
    const relLine = [bill.relation_type, bill.relation_name]
      .filter(Boolean)
      .join(" ");
    const addr1 = [bill.door_no, bill.address].filter(Boolean).join(", ");

    const articleRowsHtml = articleRows
      .map(
        (row) => `
      <tr>
        <td style="padding:6px 8px;vertical-align:top;border-right:1px solid #000;border-bottom:1px solid #000;line-height:1.4;">${row.text}</td>
        <td style="padding:6px 4px;text-align:center;vertical-align:top;border-right:1px solid #000;border-bottom:1px solid #000;">${row.gm}</td>
        <td style="padding:6px 4px;text-align:center;vertical-align:top;border-bottom:1px solid #000;">${row.mg}</td>
      </tr>
    `,
      )
      .join("");

    const totalRowHtml = showTotalRow
      ? `
      <tr>
        <td style="padding:5px 8px;font-size:11px;color:#333;border-right:1px solid #000;border-bottom:1px solid #000;font-style:italic;">Total Net Weight</td>
        <td style="padding:5px 4px;text-align:center;border-right:1px solid #000;border-bottom:1px solid #000;font-weight:bold;">${totalWt.gm}</td>
        <td style="padding:5px 4px;text-align:center;border-bottom:1px solid #000;font-weight:bold;">${totalWt.mg}</td>
      </tr>`
      : "";

    const emptyRowsHtml = Array.from({ length: emptyRows })
      .map(
        () => `
      <tr>
        <td style="padding:4px 8px;border-right:1px solid #000;height:26px;">&nbsp;</td>
        <td style="padding:4px;border-right:1px solid #000;">&nbsp;</td>
        <td style="padding:4px;">&nbsp;</td>
      </tr>`,
      )
      .join("");

    const generateBillHtml = (copyType) => `
      <div class="page-container">
        <div class="page-border">
          <div style="position: absolute; top: 15px; right: 15px; font-size: 9px; color: #555; font-weight: bold; border: 1px solid #ccc; padding: 2px 6px;">
            ${copyType}
          </div>

          <div class="header">
            <div style="width: 80px; height: 80px;">
              <img src="${window.location.origin}/lakshmi.png" style="width:100%; height:100%; object-fit:contain;" onerror="this.style.display='none'" />
            </div>

            <div style="text-align: center; flex: 1;">
              <div style="font-size:10px;font-weight:bold;letter-spacing:2px;">PAWN - TICKET</div>
              <div style="font-size:28px;font-weight:bold;letter-spacing:1px;line-height:1.1;margin-top:2px;">
                ${settings?.shop_name || "YOUR SHOP NAME"}
              </div>
              <div style="font-size:14px;font-weight:bold;letter-spacing:2px;margin-top:2px;">PAWN BROKER</div>
              <div style="font-size:10px;margin-top:4px;text-transform:uppercase;">
                ${settings?.shop_address || "YOUR SHOP ADDRESS"}
              </div>
              <div style="font-size:10px;display:flex;justify-content:center;gap:20px;margin-top:2px;">
                <span>&#9990; ${settings?.shop_phone || "PHONE NUMBER"}</span>
                <span>L. No. <span style="border-bottom:1px solid #000;display:inline-block;min-width:60px;">&nbsp;</span></span>
              </div>
              <div style="font-size:16px;color:red;font-weight:bold;font-family:serif;margin:4px 0 0;letter-spacing:2px;-webkit-print-color-adjust: exact;">
                &#2409;&#2369;&#2349; &#9784; &#2354;&#2366;&#2349;
              </div>
            </div>

            <div style="width: 80px; height: 80px;">
              <img src="${window.location.origin}/ganesha.png" style="width:100%; height:100%; object-fit:contain;" onerror="this.style.display='none'" />
            </div>
          </div>

          <div class="row">
            <span class="lbl">Bill No.</span>
            <span class="ul" style="font-size:14px;font-weight:bold;">${bill.bill_number || ""}</span>
            <span class="lbl" style="margin-left:10px;">Date:</span>
            <span class="ul" style="font-size:14px;font-weight:bold;">${fmtDate(bill.bill_date)}</span>
          </div>
          <div class="row">
            <span class="lbl">Name</span>
            <span class="ul" style="font-size:13px;">${bill.customer_initial || ""} ${bill.customer_name || ""}</span>
          </div>
          <div class="row">
            <span class="lbl">W/o S/o D/o</span>
            <span class="ul" style="flex:2;">${relLine}</span>
            <span class="lbl" style="margin-left:8px;">Phone:</span>
            <span class="ul" style="flex:1;">${bill.customer_mobile || ""}</span>
          </div>
          <div class="row">
            <span class="lbl">Address</span>
            <span class="ul">${addr1}</span>
          </div>
          <div class="row">
            <span class="ul" style="flex:3;">${bill.area || ""}</span>
            <span class="lbl">Chennai</span>
            <span class="ul" style="flex:none;width:60px;text-align:center;">${bill.pincode || "&nbsp;"}</span>
          </div>
          <div class="row">
            <span class="lbl">Principal of the Loan &#8377;</span>
            <span class="ul" style="font-size:15px;font-weight:bold;">${fmtINR(bill.principal_amount)}</span>
          </div>
          <div class="row">
            <span class="lbl">In words</span>
            <span class="ul" style="font-size:11px;white-space:normal;line-height:1.4;">${numberToWords(bill.principal_amount)}</span>
          </div>
          
          <div style="padding:6px 0 2px; font-size:8.5px; text-align:center; margin-top: 4px; white-space:nowrap;">
            இன்று முதல் 12 மாதங்களுக்கு இந்த ரசீது செல்லும் &nbsp;|&nbsp; <strong>This Ticket is VALID for 12 months from the Loan Date</strong>
          </div>

          <table>
            <colgroup><col style="width:80%"><col style="width:10%"><col style="width:10%"></colgroup>
            <thead>
              <tr>
                <th style="padding:6px 8px;text-align:left;font-size:12px;border-right:1px solid #000; border-bottom: 2px solid #000;">Detailed Description of articles</th>
                <th style="padding:6px 4px;text-align:center;font-size:12px;border-right:1px solid #000; border-bottom: 2px solid #000;">Gm.</th>
                <th style="padding:6px 4px;text-align:center;font-size:12px; border-bottom: 2px solid #000;">Mg.</th>
              </tr>
            </thead>
            <tbody>
              ${articleRowsHtml}
              ${totalRowHtml}
              ${emptyRowsHtml}
            </tbody>
            <tfoot>
              <tr style="border-top:2px solid #000;">
                <td style="border-right:1px solid #000;padding:0;">
                  <table style="width:100%;border-collapse:collapse; border:none; margin:0;">
                    <tr>
                      <td style="padding:6px;font-size:10px;width:50%;border-right:1px solid #000;vertical-align:top; border-bottom:none;">
                        அடகு வைக்கும் பொருளுக்கு கடைசி<br>தவணை 1 வருடம் 7 நாட்கள்
                      </td>
                      <td style="padding:6px;font-size:10px;vertical-align:top; border-bottom:none;">
                        3 மாதத்திற்கு ஒரு முறை வட்டி கட்ட<br>வேண்டும்
                      </td>
                    </tr>
                  </table>
                </td>
                <td colspan="2" style="padding:6px;text-align:center;vertical-align:middle;">
                  <div style="font-size:10px;font-weight:bold;">Present Value</div>
                  <div style="font-size:14px;font-weight:bold;margin-top:4px;">&#8377; ${fmtINR(bill.present_value)}</div>
                </td>
              </tr>
            </tfoot>
          </table>

          <div style="margin-top: auto; display: flex; flex-direction: column;">
            <div style="padding: 4px 0; text-align: center; font-size: 10px; font-weight: bold; letter-spacing: 0.5px; border-top: 1px solid #000;">
              I (PAWNER) DECLARE MY ANNUAL INCOME IS MORE THAN RS. 2,00,000
            </div>
            <div style="height: 50px;"></div>
            <div style="display:flex; justify-content:space-between; padding:0 10px 4px; font-size:11px; font-weight:bold;">
              <span>Prop. or Agent</span>
              <span>Form F (Section 7 &amp; Rule 8)</span>
              <span>Sign. of Pawner</span>
            </div>
          </div>
        </div>
      </div>
    `;

    const html = `<!DOCTYPE html><html><head>
      <title>Bill ${bill.bill_number || ""}</title>
      <style>
        @page { size: 148mm 210mm portrait; margin: 0; }
        * { margin:0; padding:0; box-sizing:border-box; }
        body { 
          font-family: Arial, Helvetica, sans-serif; 
          font-size:12px; 
          color:#000; 
          background: #fff;
        }
        
        .page-container {
          width: 148mm; 
          height: 210mm;
          padding: 8mm;
        }

        .page-border { 
          width: 100%;
          height: 100%;
          border: 2px solid #000; 
          padding: 12px;
          display: flex;
          flex-direction: column;
          position: relative;
        }
        
        .header { display:flex; justify-content:space-between; align-items:center; padding: 0 10px 8px; border-bottom:2px solid #000; margin-bottom:8px; }
        .row { display:flex; align-items:flex-end; padding:2px 0px; gap:8px; margin-bottom:2px; }
        .lbl { font-weight:bold; white-space:nowrap; font-size:13px; }
        .ul { flex:1; border-bottom:1px solid #000; padding-left:3px; padding-bottom:1px; min-height:18px; }
        table { width:100%; border-collapse:collapse; font-size:12px; table-layout:fixed; border: 2px solid #000; margin-top: 10px; }
        th, td { padding:4px; }
        
        .page-break { page-break-after: always; }
      </style>
    </head>
    <body>
      <!-- PAGE 1: CUSTOMER COPY -->
      ${generateBillHtml("CUSTOMER COPY")}
      <div class="page-break"></div>
      <!-- PAGE 2: SHOP COPY -->
      ${generateBillHtml("SHOP COPY")}
    </body>
    </html>`;

    // ── INVISIBLE IFRAME PRINTING ──
    let oldIframe = document.getElementById("print-iframe");
    if (oldIframe) oldIframe.remove();

    const iframe = document.createElement("iframe");
    iframe.id = "print-iframe";
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(html);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    }, 500);
  };

  return (
    <div
      className="print-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(47,58,85,0.85)",
        zIndex: 2000,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        overflow: "auto",
      }}
    >
      <style>{`
        .print-modal-overlay { padding: 32px 20px; }
        .print-scroll-container { 
          padding: 20px; 
          display: flex; 
          justify-content: center; 
          background: #d4d4d4;
        }
        .print-action-bar {
           padding: 14px 24px;
           border-top: 1px solid var(--color-linen);
           display: flex;
           align-items: center;
           justify-content: space-between;
           flex-wrap: wrap;
           gap: 16px;
        }
        .print-action-btns { display: flex; gap: 10px; }
        
        @media (max-width: 600px) {
          .print-modal-overlay { padding: 16px 10px; }
          .print-scroll-container { padding: 16px 0; justify-content: center; }
          .print-action-bar { flex-direction: column; align-items: stretch; padding: 16px; }
          .print-action-btns { width: 100%; }
          .print-action-btns button { flex: 1; justify-content: center; }
        }
      `}</style>

      <div
        style={{
          background: "var(--color-bg)",
          border: "1px solid var(--color-linen)",
          width: "100%",
          maxWidth: "160mm",
          animation: "fadeIn 0.2s ease-out",
        }}
      >
        <div
          style={{
            padding: "16px 24px",
            borderBottom: "1px solid var(--color-linen)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "18px",
                color: "var(--color-navy)",
                fontWeight: 400,
                marginBottom: "2px",
              }}
            >
              Print Preview
            </h3>
            <p style={{ fontSize: "12px", color: "var(--color-warm-gray)" }}>
              Bill {bill.bill_number || ""} · Review before printing
            </p>
          </div>
          <button
            onClick={handleClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--color-warm-gray)",
              padding: "4px",
              display: "flex",
            }}
          >
            <svg
              width="18"
              height="18"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="square" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="print-scroll-container">
          {/* This wrapper reserves the exact scaled height/width so the layout doesn't collapse! */}
          <div
            style={{
              width: `${560 * scale}px`,
              height: `${794 * scale}px`,
              position: "relative",
            }}
          >
            {/* This inner div is the exact A5 size, perfectly scaled down using CSS Transform */}
            <div
              style={{
                width: "560px",
                height: "794px",
                transform: `scale(${scale})`,
                transformOrigin: "top left",
                boxShadow: "0 4px 24px rgba(0,0,0,0.25)",
                background: "#fff",
                position: "absolute",
                top: 0,
                left: 0,
              }}
            >
              <PrintCanvas
                bill={bill}
                articles={articles}
                settings={settings}
              />
            </div>
          </div>
        </div>

        <div className="print-action-bar">
          <p
            style={{
              fontSize: "12px",
              color: "var(--color-warm-gray)",
              fontStyle: "italic",
              margin: 0,
            }}
          >
            Select "Actual size" in printer settings for best results.
          </p>
          <div className="print-action-btns">
            <button
              onClick={handleClose}
              style={{
                padding: "10px 20px",
                border: "1px solid var(--color-linen)",
                background: "transparent",
                fontSize: "13px",
                cursor: "pointer",
                color: "var(--color-navy)",
                fontFamily: "var(--font-body)",
              }}
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              style={{
                padding: "10px 24px",
                border: "none",
                background: "var(--color-navy)",
                fontSize: "13px",
                cursor: "pointer",
                color: "#fff",
                fontFamily: "var(--font-body)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
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
              Print Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
