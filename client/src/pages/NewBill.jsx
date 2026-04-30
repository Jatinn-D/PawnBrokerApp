import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import api from "../lib/api";
import {
  Field,
  Select,
  AmountInput,
  JewelToggle,
  TagSelect,
  ImageUpload,
  Btn,
  Toast,
  SectionDivider,
  ConfirmModal,
} from "../components/ui/index.jsx";
import { usePawnPrint } from "../components/ui/PawnTicket.jsx";
import { PrintPreviewModal } from "../components/PrintBill.jsx";

/* ── Template image — imported as a static asset ──────────── */
const TEMPLATE_URL = "/pawn_ticket_template.png";

/* ── helpers ──────────────────────────────────────────────── */
const todayStr = () => new Date().toISOString().split("T")[0];

const formatDateDisplay = (d) => {
  if (!d) return "";
  const [y, m, day] = d.split("-");
  return `${day}-${m}-${y}`;
};

const RELATION_OPTS = [
  { value: "", label: "Select relation" },
  { value: "S/o", label: "S/o  (Son of)" },
  { value: "W/o", label: "W/o  (Wife of)" },
  { value: "D/o", label: "D/o  (Daughter of)" },
  { value: "H/o", label: "H/o  (Husband of)" },
  { value: "F/o", label: "F/o  (Father of)" },
  { value: "M/o", label: "M/o  (Mother of)" },
];

const DESC_TAGS_DEFAULT = ["Broken", "Bend", "Scratched", "Old", "Polished"];
const PURITY_TAGS_DEFAULT = ["18k", "20k", "22k", "24k", "916"];

const emptyArticle = () => ({
  id: crypto.randomUUID(),
  description: "",
  net_weight: "",
  gross_weight: "",
  description_tags: [],
  purity_tag: "",
  image: [],
  customDescTags: [...DESC_TAGS_DEFAULT],
  customPurityTags: [...PURITY_TAGS_DEFAULT],
});

const MANDATORY_DEFAULTS = {
  customer_name: true,
  customer_mobile: true,
  principal_amount: true,
  present_value: true,
};

/* ── Article Card ─────────────────────────────────────────── */
function ArticleCard({ article, index, total, onChange, onRemove }) {
  const update = (key, val) => onChange({ ...article, [key]: val });
  const toggleDescTag = (tag) => {
    const cur = article.description_tags;
    update(
      "description_tags",
      cur.includes(tag) ? cur.filter((t) => t !== tag) : [...cur, tag],
    );
  };
  const addCustomDescTag = (tag) =>
    onChange({
      ...article,
      customDescTags: article.customDescTags.includes(tag)
        ? article.customDescTags
        : [...article.customDescTags, tag],
      description_tags: [...article.description_tags, tag],
    });
  const setPurityTag = (tag) =>
    update("purity_tag", article.purity_tag === tag ? "" : tag);
  const addCustomPurityTag = (tag) =>
    onChange({
      ...article,
      customPurityTags: article.customPurityTags.includes(tag)
        ? article.customPurityTags
        : [...article.customPurityTags, tag],
      purity_tag: tag,
    });

  return (
    <div
      style={{
        border: "1px solid var(--color-linen)",
        marginBottom: "16px",
        background: "#FAFAF8",
        animation: "fadeIn 0.2s ease-out",
      }}
    >
      <div
        style={{
          padding: "11px 20px",
          borderBottom: "1px solid var(--color-linen)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "var(--color-bg)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "22px",
              height: "22px",
              background: "var(--color-navy)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: "11px",
              flexShrink: 0,
            }}
          >
            {index + 1}
          </div>
          <span style={{ fontSize: "13px", color: "var(--color-navy)" }}>
            Article {index + 1}
            {article.description && (
              <em
                style={{
                  color: "var(--color-warm-gray)",
                  marginLeft: "8px",
                  fontStyle: "italic",
                  fontSize: "12px",
                }}
              >
                — {article.description}
              </em>
            )}
          </span>
        </div>
        {total > 1 && (
          <button
            type="button"
            onClick={onRemove}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--color-warm-gray)",
              padding: "4px",
              display: "flex",
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#C0392B")}
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "var(--color-warm-gray)")
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
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        )}
      </div>
      <div className="mobile-header-pad">
        <Field
          label="Article Description"
          value={article.description}
          onChange={(e) => update("description", e.target.value)}
          placeholder="e.g. One gold chain"
          style={{ marginBottom: "14px" }}
        />
        <div className="resp-grid-2" style={{ marginBottom: "16px" }}>
          <Field
            label="Net Weight"
            type="number"
            onWheel={(e) => e.currentTarget.blur()}
            value={article.net_weight}
            onChange={(e) => update("net_weight", e.target.value)}
            placeholder="e.g. 12.500"
            suffix="gm"
          />
          <Field
            label="Gross Weight"
            type="number"
            onWheel={(e) => e.currentTarget.blur()}
            value={article.gross_weight}
            onChange={(e) => update("gross_weight", e.target.value)}
            placeholder="e.g. 14.200"
            suffix="gm"
          />
        </div>
        <div
          className="resp-grid-2"
          style={{ gap: "20px", marginBottom: "16px" }}
        >
          <TagSelect
            label="Description Tags (multiple)"
            tags={article.customDescTags}
            selected={article.description_tags}
            onToggle={toggleDescTag}
            onAddCustom={addCustomDescTag}
            multiple
          />
          <TagSelect
            label="Purity Tag (one only)"
            tags={article.customPurityTags}
            selected={article.purity_tag ? [article.purity_tag] : []}
            onToggle={setPurityTag}
            onAddCustom={addCustomPurityTag}
            multiple={false}
          />
        </div>
        {/* Multiple article photos */}
        <div>
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
            Article Photos
          </label>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              alignItems: "flex-start",
            }}
          >
            {(article.images || []).map((img, idx) => (
              <div key={idx} style={{ position: "relative" }}>
                <img
                  src={img.preview}
                  alt={`Article photo ${idx + 1}`}
                  style={{
                    width: "180px",
                    height: "180px",
                    objectFit: "cover",
                    border: "1px solid var(--color-linen)",
                    display: "block",
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const updated = (article.images || []).filter(
                      (_, i) => i !== idx,
                    );
                    update("images", updated);
                  }}
                  style={{
                    position: "absolute",
                    top: "2px",
                    right: "2px",
                    background: "rgba(47,58,85,0.85)",
                    color: "#fff",
                    border: "none",
                    padding: "2px 5px",
                    fontSize: "10px",
                    cursor: "pointer",
                    lineHeight: 1,
                  }}
                >
                  ✕
                </button>
              </div>
            ))}

            {/* Add photo button */}
            <div style={{ width: "180px", height: "108px" }}>
              <ImageUpload
                label=""
                value={null}
                onChange={(val) => {
                  if (val) update("images", [...(article.images || []), val]);
                }}
                style={{ height: "80px" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══ Main Page ════════════════════════════════════════════════ */
export default function NewBill() {
  const location = useLocation();
  const prefill = location.state?.prefill || null;
  const prefillArticles = location.state?.articles || null;
  const renewingFrom = location.state?.renewingFrom || null;
  const editMode = location.state?.editMode || false;
  const { print: printTicket } = usePawnPrint();

  const [billNumber, setBillNumber] = useState("—");
  const [billDate, setBillDate] = useState(todayStr());
  const [jewel_type, setJewelType] = useState("gold");

  /* Customer */
  const [customer_initial, setInitial] = useState("");
  const [customer_name, setName] = useState("");
  const [customer_mobile, setMobile] = useState("");
  const [customer_alt_mobile, setAltMobile] = useState("");
  const [customer_email, setEmail] = useState("");
  const [relation_type, setRelationType] = useState("");
  const [relation_name, setRelationName] = useState("");
  const [door_no, setDoorNo] = useState("");
  const [address, setAddress] = useState("");
  const [area, setArea] = useState("");
  const [pincode, setPincode] = useState("");
  const [aadhar_number, setAadhar] = useState("");
  const [aadharFront, setAadharFront] = useState(null);
  const [aadharBack, setAadharBack] = useState(null);
  const [customerPhoto, setCustomerPhoto] = useState(null);

  /* Articles & amounts */
  const [articles, setArticles] = useState([emptyArticle()]);
  const [principal_amount, setPrincipal] = useState("");
  const [present_value, setPresentValue] = useState("");

  /* UI state */
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [billSaved, setBillSaved] = useState(false);
  const [toast, setToast] = useState(null);
  const [clearConfirm, setClearConfirm] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [mandatoryFields, setMandatoryFields] = useState(MANDATORY_DEFAULTS);

  const formRef = useRef(null);
  const [settings, setSettings] = useState({});

  useEffect(() => {
    const firstInput = document.querySelector('input[placeholder="e.g. A"]');
    if (firstInput) firstInput.focus();
  }, []);

  /* Load bill number and mandatory fields from settings */
  useEffect(() => {
    api
      .get("/api/bills/next-number")
      .then((r) => setBillNumber(r.data.bill_number))
      .catch(() => {});

    api
      .get("/api/settings")
      .then((r) => {
        setSettings(r.data); // Settings fixed for printing!
        const serverMandatory = r.data?.mandatory_fields || {};
        setMandatoryFields({
          ...serverMandatory,
          customer_name: true,
          customer_mobile: true,
          principal_amount: true,
          present_value: true,
        });
      })
      .catch(() => {});
  }, []);

  /* Prefill from customer card or renew flow */
  useEffect(() => {
    if (!prefill) return;
    setInitial(prefill.customer_initial || "");
    setName(prefill.customer_name || "");
    setMobile(prefill.customer_mobile || "");
    setAltMobile(prefill.customer_alt_mobile || "");
    setEmail(prefill.customer_email || "");
    setRelationType(prefill.relation_type || "");
    setRelationName(prefill.relation_name || "");
    setDoorNo(prefill.door_no || "");
    setAddress(prefill.address || "");
    setArea(prefill.area || "");
    setPincode(prefill.pincode || "");
    setAadhar(prefill.aadhar_number || "");
    if (prefill.jewel_type) setJewelType(prefill.jewel_type);
    if (prefill.aadhar_front_url)
      setAadharFront({ preview: prefill.aadhar_front_url, file: null });
    if (prefill.aadhar_back_url)
      setAadharBack({ preview: prefill.aadhar_back_url, file: null });
    if (prefill.customer_photo_url)
      setCustomerPhoto({ preview: prefill.customer_photo_url, file: null });
    if (prefillArticles && prefillArticles.length > 0) {
      setArticles(
        prefillArticles.map((a) => {
          const descTags = new Set([
            "Broken",
            "Bend",
            "Scratched",
            "Old",
            "Polished",
            ...(a.description_tags || []),
          ]);
          const purityTags = new Set([
            "18k",
            "20k",
            "22k",
            "24k",
            "916",
            ...(a.purity_tag ? [a.purity_tag] : []),
          ]);
          return {
            id: crypto.randomUUID(),
            description: a.description || "",
            net_weight: a.net_weight ? String(a.net_weight) : "",
            gross_weight: a.gross_weight ? String(a.gross_weight) : "",
            description_tags: a.description_tags || [],
            purity_tag: a.purity_tag || "",
            images: a.image_url ? [{ preview: a.image_url, file: null }] : [],
            customDescTags: Array.from(descTags),
            customPurityTags: Array.from(purityTags),
          };
        }),
      );
    }
  }, [prefill]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const allElements = Array.from(
        formRef.current.querySelectorAll(
          'input, select, button[type="submit"]',
        ),
      );
      const focusable = allElements.filter((el) => {
        const isImage = el.closest(".image-upload-container");
        const isTag = el.closest(".tag-select-container");
        const isDropdown = el.tagName === "SELECT";
        return (
          !isImage &&
          !isTag &&
          !isDropdown &&
          !el.disabled &&
          el.type !== "file"
        );
      });
      const currentIndex = focusable.indexOf(e.target);
      if (
        e.target.placeholder === "Current market value — must exceed principal"
      ) {
        handleSave();
        return;
      }
      if (currentIndex > -1 && currentIndex < focusable.length - 1) {
        focusable[currentIndex + 1].focus();
      }
    }
  };

  /* Derived */
  const totalNetWeight = articles.reduce(
    (s, a) => s + (parseFloat(a.net_weight) || 0),
    0,
  );
  const amountsValid =
    principal_amount &&
    present_value &&
    parseFloat(principal_amount) < parseFloat(present_value);

  const buildBillData = () => ({
    bill_number: billNumber,
    bill_date: billDate,
    jewel_type,
    customer_initial,
    customer_name,
    customer_mobile,
    customer_alt_mobile,
    customer_email,
    relation_type,
    relation_name,
    door_no,
    address,
    area,
    pincode,
    aadhar_number,
    principal_amount,
    present_value,
    articles: articles.map((a) => ({
      description: a.description,
      net_weight: parseFloat(a.net_weight) || 0,
      gross_weight: parseFloat(a.gross_weight) || 0,
      description_tags: a.description_tags,
      purity_tag: a.purity_tag,
    })),
  });

  const updateArticle = (id, updated) =>
    setArticles((p) => p.map((a) => (a.id === id ? updated : a)));
  const removeArticle = (id) =>
    setArticles((p) => p.filter((a) => a.id !== id));
  const addArticle = () => setArticles((p) => [...p, emptyArticle()]);

  /* Validation */
  const validate = () => {
    const e = {};
    const checks = {
      customer_initial: customer_initial?.trim(),
      customer_name: customer_name?.trim(),
      customer_mobile: customer_mobile?.trim(),
      customer_alt_mobile: customer_alt_mobile?.trim(),
      customer_email: customer_email?.trim(),
      relation_type: relation_type,
      relation_name: relation_name?.trim(),
      door_no: door_no?.trim(),
      address: address?.trim(),
      area: area?.trim(),
      pincode: pincode?.trim(),
      aadhar_number: aadhar_number?.trim(),
      aadhar_front_url: aadharFront,
      aadhar_back_url: aadharBack,
      customer_photo_url: customerPhoto,
      principal_amount: principal_amount,
      present_value: present_value,
    };
    const labels = {
      customer_initial: "Customer Initial",
      customer_name: "Customer Name",
      customer_mobile: "Mobile Number",
      customer_alt_mobile: "Alternative Mobile",
      customer_email: "Email ID",
      relation_type: "Relation Type",
      relation_name: "Relation Name",
      door_no: "Door / House No.",
      address: "Address",
      area: "Area",
      pincode: "Pincode",
      aadhar_number: "Aadhar Number",
      aadhar_front_url: "Aadhar Front Photo",
      aadhar_back_url: "Aadhar Back Photo",
      customer_photo_url: "Customer Photo",
      principal_amount: "Principal Amount",
      present_value: "Present Value",
    };

    for (const [key, value] of Object.entries(checks)) {
      if (mandatoryFields[key] && !value) {
        e[key] = `${labels[key]} is required`;
      }
    }
    if (customer_mobile && !/^\d{10}$/.test(customer_mobile)) {
      e.customer_mobile = "Enter a valid 10-digit mobile number";
    }
    if (
      principal_amount &&
      present_value &&
      parseFloat(principal_amount) >= parseFloat(present_value)
    ) {
      e.present_value = "Present value must be greater than principal amount";
    }

    articles.forEach((a, i) => {
      if (mandatoryFields.article_description && !a.description?.trim())
        e[`article_description_${i}`] =
          `Article ${i + 1}: Description is required`;
      if (mandatoryFields.net_weight && !a.net_weight)
        e[`net_weight_${i}`] = `Article ${i + 1}: Net weight is required`;
      if (mandatoryFields.gross_weight && !a.gross_weight)
        e[`gross_weight_${i}`] = `Article ${i + 1}: Gross weight is required`;
      if (mandatoryFields.purity_tag && !a.purity_tag)
        e[`purity_tag_${i}`] = `Article ${i + 1}: Purity tag is required`;
      if (mandatoryFields.article_image && (!a.images || a.images.length === 0))
        e[`article_image_${i}`] = `Article ${i + 1}: Photo is required`;
    });
    return e;
  };

  const uploadImage = async (imgObj, folder) => {
    if (!imgObj?.file) return imgObj?.preview || null;
    const fd = new FormData();
    fd.append("file", imgObj.file);
    fd.append("folder", folder);
    const res = await api.post("/api/upload", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.url;
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      setToast({ message: "Please fill all required fields.", type: "error" });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      const [aadharFrontUrl, aadharBackUrl, customerPhotoUrl] =
        await Promise.all([
          uploadImage(aadharFront, "aadhar"),
          uploadImage(aadharBack, "aadhar"),
          uploadImage(customerPhoto, "photos"),
        ]);
      const articleData = await Promise.all(
        articles.map(async (article, i) => {
          const articleImages = await Promise.all(
            (article.images || []).map((img) => uploadImage(img, "articles")),
          );
          return {
            description: article.description,
            net_weight: parseFloat(article.net_weight) || 0,
            gross_weight: parseFloat(article.gross_weight) || 0,
            description_tags: article.description_tags,
            purity_tag: article.purity_tag,
            image_url: articleImages[0] || null,
            image_urls: articleImages,
            sort_order: i,
          };
        }),
      );

      const billRes = await api.post("/api/bills", {
        jewel_type,
        bill_date: billDate,
        customer_initial,
        customer_name,
        customer_mobile,
        customer_alt_mobile,
        customer_email,
        relation_type,
        relation_name,
        door_no,
        address,
        area,
        pincode,
        aadhar_number,
        aadhar_front_url: aadharFrontUrl,
        aadhar_back_url: aadharBackUrl,
        customer_photo_url: customerPhotoUrl,
        articles: articleData,
        principal_amount: parseFloat(principal_amount),
        present_value: parseFloat(present_value),
      });

      if (renewingFrom && billRes.data?.bill_number) {
        try {
          await api.put(`/api/bills/${renewingFrom}`, {
            renewed_bill_number: billRes.data.bill_number,
          });
        } catch (err) {
          console.error("Failed to update renewed_bill_number:", err);
        }
      }

      setBillSaved(true);
      const numRes = await api.get("/api/bills/next-number");
      setBillNumber(numRes.data.bill_number);
      setToast({ message: "Bill saved successfully!", type: "success" });
    } catch (err) {
      console.error("Error saving bill:", err);
      setToast({
        message: err.response?.data?.error || "Failed to save bill.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePrintClick = () => setShowPrintPreview(true);
  const handlePrint = () => {
    setShowPrintPreview(false);
    printTicket(buildBillData(), TEMPLATE_URL);
  };

  const handleClear = () => {
    setInitial("");
    setName("");
    setMobile("");
    setAltMobile("");
    setEmail("");
    setRelationType("");
    setRelationName("");
    setDoorNo("");
    setAddress("");
    setArea("");
    setPincode("");
    setAadhar("");
    setAadharFront(null);
    setAadharBack(null);
    setCustomerPhoto(null);
    setArticles([emptyArticle()]);
    setPrincipal("");
    setPresentValue("");
    setErrors({});
    setBillSaved(false);
    setClearConfirm(false);
    setToast({ message: "All fields cleared.", type: "info" });
  };

  const handleAadharChange = (e) => {
    const d = e.target.value.replace(/\D/g, "").slice(0, 12);
    setAadhar(d.replace(/(\d{4})(?=\d)/g, "$1 ").trim());
  };

  return (
    <div
      ref={formRef}
      onKeyDown={handleKeyDown}
      style={{ background: "var(--color-bg)", minHeight: "100%" }}
    >
      {/* ── CSS FOR RESPONSIVE GRIDS ── */}
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(6px) } to { opacity:1; transform:translateY(0) } }
        
        .resp-grid-2, .resp-grid-3, .resp-grid-custom-1, .resp-grid-custom-2, .resp-grid-custom-3, .resp-grid-custom-4 {
          display: grid;
          gap: 14px;
          grid-template-columns: 1fr;
        }
        
        /* Mobile defaults */
        .mobile-header-pad { padding: 16px 20px; }
        .mobile-body-pad { padding: 16px 20px 60px; }

        /* Action Buttons Mobile Layout */
        .action-bar { display: flex; flex-direction: column; gap: 12px; }
        .action-group { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .action-bar button { width: 100%; justify-content: center; }

        @media (min-width: 768px) {
          .resp-grid-2 { grid-template-columns: 1fr 1fr; }
          .resp-grid-3 { grid-template-columns: 1fr 1fr 1fr; }
          .resp-grid-custom-1 { grid-template-columns: 210px 1fr 1fr; }
          .resp-grid-custom-2 { grid-template-columns: 180px 1fr; }
          .resp-grid-custom-3 { grid-template-columns: 340px 1fr; }
          .resp-grid-custom-4 { grid-template-columns: 0.6fr 0.4fr; }
          
          .mobile-header-pad { padding: 20px 32px; }
          .mobile-body-pad { padding: 28px 32px 60px; }

          /* Action Buttons Desktop Layout */
          .action-bar { flex-direction: row; align-items: center; justify-content: space-between; }
          .action-group { display: flex; gap: 10px; }
          .action-bar button { width: auto; justify-content: flex-start; }
        }
      `}</style>

      {/* Sticky header */}
      <div
        className="mobile-header-pad"
        style={{
          borderBottom: "1px solid var(--color-linen)",
          background: "var(--color-bg)",
          position: "sticky",
          top: 0,
          zIndex: 20,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
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
            New Bill
          </h1>
          <p style={{ fontSize: "13px", color: "var(--color-warm-gray)" }}>
            Create a new pledge bill for a customer
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              border: "1px solid var(--color-linen)",
              padding: "8px 16px",
              background: "var(--color-linen)",
              display: "inline-block",
            }}
          >
            <div
              style={{
                fontSize: "10px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--color-slate)",
                marginBottom: "2px",
              }}
            >
              Bill No.
            </div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "20px",
                color: "var(--color-navy)",
              }}
            >
              {billNumber}
            </div>
          </div>
          <div
            style={{
              fontSize: "12px",
              color: "var(--color-warm-gray)",
              marginTop: "5px",
            }}
          >
            {formatDateDisplay(billDate)}
          </div>
        </div>
      </div>

      {/* Form body */}
      <div className="mobile-body-pad">
        {/* Jewel type + date */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
            padding: "15px",
            border: "1px solid var(--color-linen)",
          }}
        >
          <div>
            <p
              style={{
                fontSize: "11px",
                letterSpacing: "0.09em",
                textTransform: "uppercase",
                color: "var(--color-slate)",
                marginBottom: "10px",
              }}
            >
              Jewel Type
            </p>
            <JewelToggle value={jewel_type} onChange={setJewelType} />
          </div>
          <Field
            label="Bill Date"
            type="date"
            value={billDate}
            onChange={(e) => setBillDate(e.target.value)}
            required
            style={{ width: "210px" }}
          />
        </div>

        {/* ── CUSTOMER DETAILS ── */}
        <SectionDivider
          title="Customer Details"
          subtitle="Personal information and contact details"
        />

        <div className="resp-grid-custom-1" style={{ marginBottom: "14px" }}>
          <Field
            label="Initial"
            value={customer_initial}
            onChange={(e) => setInitial(e.target.value.toUpperCase())}
            placeholder="e.g. A"
            maxLength={5}
          />
          <Field
            label="Customer Name"
            value={customer_name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            required={mandatoryFields.customer_name}
            error={errors.customer_name}
          />
          <Field
            label="Email ID"
            type="email"
            value={customer_email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>
        <div className="resp-grid-3" style={{ marginBottom: "14px" }}>
          <Field
            label="Mobile Number"
            type="tel"
            value={customer_mobile}
            onChange={(e) =>
              setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))
            }
            placeholder="10-digit number"
            required={mandatoryFields.customer_mobile}
            error={errors.customer_mobile}
            maxLength={10}
          />
          <Field
            label="Alternative Mobile"
            type="tel"
            value={customer_alt_mobile}
            onChange={(e) =>
              setAltMobile(e.target.value.replace(/\D/g, "").slice(0, 10))
            }
            placeholder="10-digit number"
            maxLength={10}
          />
          <Field
            label="Aadhar Number"
            value={aadhar_number}
            onChange={handleAadharChange}
            placeholder="XXXX XXXX XXXX"
            maxLength={14}
          />
        </div>
        <div className="resp-grid-custom-2" style={{ marginBottom: "14px" }}>
          <Select
            label="Relation Type"
            value={relation_type}
            onChange={(e) => setRelationType(e.target.value)}
            options={RELATION_OPTS}
          />
          <Field
            label="Relation Name"
            value={relation_name}
            onChange={(e) => setRelationName(e.target.value)}
            placeholder="Father's / Husband's / etc. name"
          />
        </div>
        <div className="resp-grid-custom-3" style={{ marginBottom: "14px" }}>
          <Field
            label="Door / House No."
            value={door_no}
            onChange={(e) => setDoorNo(e.target.value)}
            placeholder="e.g. E6/12"
          />
          <Field
            label="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Street / Road / Colony name"
          />
        </div>
        <div className="resp-grid-custom-4" style={{ marginBottom: "14px" }}>
          <Field
            label="Area"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            placeholder="e.g. Kodambakkam"
          />
          <Field
            label="Pincode"
            value={pincode}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, "").slice(0, 6);
              setPincode(digits);
            }}
            onBlur={(e) => {
              const digits = pincode.replace(/\D/g, "");
              if (digits.length > 0 && digits.length < 6) {
                setPincode(String(600000 + parseInt(digits)));
              }
            }}
            placeholder="e.g. 24"
            maxLength={6}
          />
        </div>
        <div style={{ marginBottom: "20px", maxWidth: "280px" }}></div>
        <div
          className="resp-grid-3"
          style={{ gap: "16px", marginBottom: "8px" }}
        >
          <ImageUpload
            label="Aadhar Front"
            value={aadharFront}
            onChange={setAadharFront}
            hint="Front side of Aadhar"
          />
          <ImageUpload
            label="Aadhar Back"
            value={aadharBack}
            onChange={setAadharBack}
            hint="Back side of Aadhar"
          />
          <ImageUpload
            label="Customer Photo"
            value={customerPhoto}
            onChange={setCustomerPhoto}
            hint="Passport-size photo"
          />
        </div>

        {/* ── JEWEL DETAILS ── */}
        <SectionDivider
          title="Jewel Details"
          subtitle="Add one or more articles being pledged"
        />

        {articles.length > 1 && (
          <div
            style={{
              background: "var(--color-navy)",
              color: "#fff",
              padding: "10px 20px",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
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
              style={{ fontFamily: "var(--font-display)", fontSize: "22px" }}
            >
              {totalNetWeight.toFixed(3)} gm
            </span>
          </div>
        )}

        {articles.map((a, i) => (
          <ArticleCard
            key={a.id}
            article={a}
            index={i}
            total={articles.length}
            onChange={(updated) => updateArticle(a.id, updated)}
            onRemove={() => removeArticle(a.id)}
          />
        ))}

        {articles.length === 1 && articles[0].net_weight && (
          <p
            style={{
              fontSize: "12px",
              color: "var(--color-slate)",
              marginBottom: "6px",
            }}
          >
            Net weight:{" "}
            <strong style={{ color: "var(--color-navy)" }}>
              {parseFloat(articles[0].net_weight).toFixed(3)} gm
            </strong>
          </p>
        )}

        <button
          type="button"
          onClick={addArticle}
          style={{
            width: "100%",
            padding: "14px",
            border: "1px dashed var(--color-slate)",
            background: "transparent",
            color: "var(--color-slate)",
            cursor: "pointer",
            fontSize: "13px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            transition: "all 0.15s",
            fontFamily: "var(--font-body)",
            letterSpacing: "0.02em",
            marginBottom: "8px",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(92,107,138,0.05)";
            e.currentTarget.style.borderColor = "var(--color-navy)";
            e.currentTarget.style.color = "var(--color-navy)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.borderColor = "var(--color-slate)";
            e.currentTarget.style.color = "var(--color-slate)";
          }}
        >
          <svg
            width="15"
            height="15"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="square" d="M12 4v16m8-8H4" />
          </svg>
          Add Another Article
        </button>

        {/* ── AMOUNT DETAILS ── */}
        <SectionDivider
          title="Amount Details"
          subtitle="Principal amount must always be less than present value"
        />

        <div
          className="resp-grid-2"
          style={{ gap: "20px", marginBottom: "12px" }}
        >
          <AmountInput
            label="Principal Amount (Pledge Value)"
            value={principal_amount}
            onChange={setPrincipal}
            required={mandatoryFields.principal_amount}
            error={errors.principal_amount}
            hint="Amount for which the jewel is kept as pledge"
          />
          <AmountInput
            label="Present Value (Market Value)"
            value={present_value}
            onChange={setPresentValue}
            required={mandatoryFields.present_value}
            error={errors.present_value}
            hint="Current market value — must exceed principal"
          />
        </div>

        {amountsValid && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 14px",
              background: "#EAF7EF",
              border: "1px solid rgba(39,174,96,0.2)",
              marginBottom: "8px",
              fontSize: "13px",
              color: "#1e8449",
            }}
          >
            <svg
              width="14"
              height="14"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="square" d="M5 13l4 4L19 7" />
            </svg>
            Amounts are valid — principal is less than present value
          </div>
        )}

        {/* ── ACTION BUTTONS ── */}
        <div
          className="action-bar"
          style={{
            marginTop: "36px",
            padding: "20px 24px",
            border: "1px solid var(--color-linen)",
            background: "white",
          }}
        >
          <div className="action-group">
            <Btn
              variant="primary"
              onClick={handleSave}
              loading={saving}
              size="lg"
              icon={
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
                    d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                  />
                </svg>
              }
            >
              Save Bill
            </Btn>

            <Btn
              variant="secondary"
              onClick={handlePrintClick}
              size="lg"
              disabled={!billSaved}
              title={
                !billSaved
                  ? "Save the bill first before printing"
                  : "Preview and print this bill"
              }
              icon={
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
              }
            >
              Print Bill
            </Btn>
          </div>

          <Btn
            variant="danger"
            onClick={() => setClearConfirm(true)}
            size="lg"
            icon={
              <svg
                width="15"
                height="15"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path strokeLinecap="square" d="M6 18L18 6M6 6l12 12" />
              </svg>
            }
          >
            Clear Fields
          </Btn>
        </div>

        <p
          style={{
            fontSize: "12px",
            color: "var(--color-warm-gray)",
            marginTop: "10px",
            fontStyle: "italic",
          }}
        >
          Saving a bill does not clear the fields — use "Clear Fields" when the
          customer changes their mind.
        </p>
      </div>

      {/* Print Preview Modal */}
      {showPrintPreview && (
        <PrintPreviewModal
          bill={buildBillData()}
          articles={articles}
          settings={settings}
          onClose={() => setShowPrintPreview(false)}
        />
      )}

      {/* Clear confirm */}
      <ConfirmModal
        open={clearConfirm}
        title="Clear all fields?"
        message="This will erase all information entered. Use this when a customer changes their mind and does not want to pledge. This cannot be undone."
        confirmLabel="Yes, Clear Fields"
        confirmVariant="danger"
        onConfirm={handleClear}
        onCancel={() => setClearConfirm(false)}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
