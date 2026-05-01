import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const features = [
  {
    icon: (
      <svg
        width="28"
        height="28"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path
          strokeLinecap="square"
          strokeLinejoin="miter"
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
    title: "Instant Billing",
    desc: "Create detailed pledge bills in seconds — customer details, jewel cards, amounts, all in one place.",
  },
  {
    icon: (
      <svg
        width="28"
        height="28"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path
          strokeLinecap="square"
          strokeLinejoin="miter"
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
    title: "Customer Profiles",
    desc: "Every customer gets a card with loyalty ratings, history, and auto-fill for repeat pledges.",
  },
  {
    icon: (
      <svg
        width="28"
        height="28"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path
          strokeLinecap="square"
          strokeLinejoin="miter"
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
    title: "Smart Dashboard",
    desc: "See all your stats at a glance — active pledges, released amounts, today's activity, and trend charts.",
  },
  {
    icon: (
      <svg
        width="28"
        height="28"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path
          strokeLinecap="square"
          strokeLinejoin="miter"
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    title: "Interest Calculator",
    desc: "Real-time interest calculation with adjustable rate sliders. Know exactly what a customer owes.",
  },
  {
    icon: (
      <svg
        width="28"
        height="28"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path
          strokeLinecap="square"
          strokeLinejoin="miter"
          d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
        />
      </svg>
    ),
    title: "Powerful Database",
    desc: "Search millions of records instantly. Filter, sort, release, renew — everything at your fingertips.",
  },
  {
    icon: (
      <svg
        width="28"
        height="28"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path
          strokeLinecap="square"
          strokeLinejoin="miter"
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      </svg>
    ),
    title: "Secure & Backed Up",
    desc: "Your data is encrypted and automatically backed up to Google Drive and local storage.",
  },
];

const steps = [
  {
    num: "01",
    title: "Create your account",
    desc: "Sign up with your name, email, and mobile number in under a minute.",
  },
  {
    num: "02",
    title: "Configure your settings",
    desc: "Set your bill number format, threshold values, and mandatory fields.",
  },
  {
    num: "03",
    title: "Start creating bills",
    desc: "Add customers, jewel details, and amounts. System handles the rest.",
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleGetStarted = () => {
    localStorage.setItem("vaulta_seen_landing", "true");
    navigate("/auth");
  };

  const parallaxY = scrollY * 0.3;

  return (
    <div
      style={{
        background: "var(--color-bg)",
        minHeight: "100vh",
        overflowX: "hidden",
      }}
    >
      {/* ── NAV ── */}
      <nav
        className="nav-pad"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background:
            scrollY > 40 ? "rgba(245, 246, 243, 0.96)" : "transparent",
          borderBottom:
            scrollY > 40
              ? "1px solid var(--color-linen)"
              : "1px solid transparent",
          transition: "background 0.3s, border-color 0.3s",
          backdropFilter: scrollY > 40 ? "blur(8px)" : "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "22px",
              color: "var(--color-navy)",
              letterSpacing: "0.02em",
              fontStyle: "italic",
            }}
          >
            Suvarna
          </span>
        </div>
        <button
          className="hide-on-mobile"
          onClick={handleGetStarted}
          style={{
            background: "var(--color-navy)",
            color: "#fff",
            border: "none",
            padding: "10px 24px",
            fontSize: "14px",
            letterSpacing: "0.04em",
            cursor: "pointer",
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) =>
            (e.target.style.background = "var(--color-slate)")
          }
          onMouseLeave={(e) =>
            (e.target.style.background = "var(--color-navy)")
          }
        >
          Get Started
        </button>
      </nav>

      {/* ── HERO ── */}
      <section
        ref={heroRef}
        style={{
          minHeight: "100vh",
          background: "var(--color-navy)",
          display: "flex",
          alignItems: "center",
          position: "relative",
          overflow: "hidden",
          paddingTop: "64px",
        }}
      >
        {/* Geometric background pattern */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            overflow: "hidden",
            opacity: 0.06,
          }}
        >
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="grid"
                width="60"
                height="60"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 60 0 L 0 0 0 60"
                  fill="none"
                  stroke="white"
                  strokeWidth="0.5"
                />
              </pattern>
              <pattern
                id="diag"
                width="120"
                height="120"
                patternUnits="userSpaceOnUse"
              >
                <line
                  x1="0"
                  y1="120"
                  x2="120"
                  y2="0"
                  stroke="white"
                  strokeWidth="0.8"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            <rect width="100%" height="100%" fill="url(#diag)" />
          </svg>
        </div>

        {/* Decorative vault circle - Hidden on Mobile */}
        <div
          className="hide-on-mobile"
          style={{
            position: "absolute",
            right: "-120px",
            top: "50%",
            transform: `translateY(calc(-50% + ${parallaxY}px))`,
            width: "600px",
            height: "600px",
            border: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "480px",
              height: "480px",
              border: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: "360px",
                height: "360px",
                border: "1px solid rgba(255,255,255,0.10)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div style={{ opacity: 0.08 }}>
                <VaultaLogo size={180} color="white" />
              </div>
            </div>
          </div>
        </div>

        {/* Hero content */}
        <div
          className="hero-pad"
          style={{
            position: "relative",
            zIndex: 2,
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          <div style={{ maxWidth: "620px" }}>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 400,
                fontSize: "clamp(42px, 6vw, 72px)",
                lineHeight: "1.05",
                color: "var(--color-linen)",
                marginBottom: "28px",
                letterSpacing: "-0.01em",
              }}
            >
              Your entire
              <br />
              <em
                style={{ color: "rgba(231,226,222,0.5)", fontStyle: "italic" }}
              >
                pledge business,
              </em>
              <br />
              organised.
            </h1>

            <p
              style={{
                fontSize: "17px",
                lineHeight: "1.7",
                color: "rgba(231, 226, 222, 0.65)",
                marginBottom: "48px",
                maxWidth: "480px",
              }}
            >
              Replace the piles of manual registers with a fast, reliable, and
              beautifully simple system — built specifically for jewellery
              pledge businesses.
            </p>

            <div
              style={{
                display: "flex",
                gap: "16px",
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <button
                onClick={handleGetStarted}
                style={{
                  background: "var(--color-linen)",
                  color: "var(--color-navy)",
                  border: "none",
                  padding: "16px 40px",
                  fontSize: "15px",
                  letterSpacing: "0.04em",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#fff";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--color-linen)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                Get Started
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="square" d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          style={{
            position: "absolute",
            bottom: "36px",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
            color: "rgba(231,226,222,0.3)",
            fontSize: "11px",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            animation: "scrollBounce 2s ease-in-out infinite",
          }}
        >
          <span>Scroll</span>
          <svg
            width="16"
            height="16"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path strokeLinecap="square" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ── PROBLEM STATEMENT ── */}
      <section
        className="section-pad"
        style={{ maxWidth: "1200px", margin: "0 auto" }}
      >
        <div className="problem-grid">
          <div>
            <p
              style={{
                color: "var(--color-slate)",
                fontSize: "12px",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginBottom: "20px",
              }}
            >
              The Problem
            </p>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(28px, 3.5vw, 44px)",
                color: "var(--color-navy)",
                lineHeight: "1.15",
                marginBottom: "28px",
                fontWeight: 400,
              }}
            >
              Searching through registers takes too long.
            </h2>
            <p
              style={{
                color: "var(--color-warm-gray)",
                fontSize: "16px",
                lineHeight: "1.8",
                marginBottom: "20px",
              }}
            >
              When a customer walks in to release their jewel, finding their
              record in a stack of handwritten registers wastes valuable time —
              and it's easy to miss entries or miscalculate interest.
            </p>
            <p
              style={{
                color: "var(--color-warm-gray)",
                fontSize: "16px",
                lineHeight: "1.8",
              }}
            >
              Search your every customer's history instantly. Search by name,
              mobile, bill number, or address — results appear in milliseconds.
            </p>
          </div>

          {/* Old way vs Vaulta */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            {[
              {
                old: "Flip through registers to find a customer",
                new: "Type a name → instant result",
              },
              {
                old: "Calculate interest by hand or calculator",
                new: "Slider shows interest in real time",
              },
              {
                old: "No way to know customer loyalty",
                new: "Automatic rating score 1–10",
              },
              {
                old: "Easy to lose track of release dates",
                new: "Clear status on every bill",
              },
              {
                old: "No backup if register is lost",
                new: "Auto-backup to Google Drive",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="compare-grid"
                style={{
                  border: "1px solid var(--color-linen)",
                  animation: `fadeIn 0.4s ease-out ${i * 0.08}s both`,
                }}
              >
                <div
                  style={{
                    padding: "16px",
                    background: "#FAF0EE",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                  }}
                >
                  <span
                    style={{
                      color: "#C0392B",
                      marginTop: "2px",
                      flexShrink: 0,
                    }}
                  >
                    <svg
                      width="14"
                      height="14"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path strokeLinecap="square" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </span>
                  <span
                    style={{
                      fontSize: "13px",
                      color: "var(--color-warm-gray)",
                      lineHeight: "1.5",
                    }}
                  >
                    {item.old}
                  </span>
                </div>
                <div
                  style={{
                    padding: "16px",
                    background: "#F2F8F5",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                  }}
                >
                  <span
                    style={{
                      color: "#27AE60",
                      marginTop: "2px",
                      flexShrink: 0,
                    }}
                  >
                    <svg
                      width="14"
                      height="14"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path strokeLinecap="square" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <span
                    style={{
                      fontSize: "13px",
                      color: "var(--color-navy)",
                      lineHeight: "1.5",
                    }}
                  >
                    {item.new}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ── */}
      <section
        className="section-pad"
        style={{ background: "var(--color-navy)" }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "72px" }}>
            <p
              style={{
                color: "rgba(231,226,222,0.4)",
                fontSize: "12px",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginBottom: "16px",
              }}
            >
              Everything You Need
            </p>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(28px, 3.5vw, 48px)",
                color: "var(--color-linen)",
                fontWeight: 400,
                lineHeight: "1.15",
              }}
            >
              Built for how a pledge business actually works.
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "1px",
              border: "1px solid rgba(231,226,222,0.08)",
              background: "rgba(231,226,222,0.08)",
            }}
          >
            {features.map((f, i) => (
              <div
                key={i}
                style={{
                  background: "var(--color-navy)",
                  padding: "40px 36px",
                  borderBottom: "1px solid rgba(231,226,222,0.06)",
                  transition: "background 0.2s",
                  cursor: "default",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#364261")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "var(--color-navy)")
                }
              >
                <div
                  style={{
                    color: "rgba(231,226,222,0.5)",
                    marginBottom: "20px",
                  }}
                >
                  {f.icon}
                </div>
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "22px",
                    fontWeight: 400,
                    color: "var(--color-linen)",
                    marginBottom: "12px",
                  }}
                >
                  {f.title}
                </h3>
                <p
                  style={{
                    color: "rgba(231,226,222,0.5)",
                    fontSize: "14px",
                    lineHeight: "1.75",
                  }}
                >
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section
        className="section-pad"
        style={{ maxWidth: "1200px", margin: "0 auto" }}
      >
        <div style={{ textAlign: "center", marginBottom: "72px" }}>
          <p
            style={{
              color: "var(--color-slate)",
              fontSize: "12px",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: "16px",
            }}
          >
            Getting Started
          </p>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(28px, 3.5vw, 48px)",
              color: "var(--color-navy)",
              fontWeight: 400,
            }}
          >
            Up and running in minutes.
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "2px",
          }}
        >
          {steps.map((s, i) => (
            <div
              key={i}
              style={{
                padding: "48px 40px",
                border: "1px solid var(--color-linen)",
                position: "relative",
                background: "var(--color-bg)",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "64px",
                  fontWeight: 400,
                  color: "var(--color-linen)",
                  lineHeight: 1,
                  marginBottom: "24px",
                  letterSpacing: "-0.02em",
                }}
              >
                {s.num}
              </div>
              <h3
                style={{
                  fontSize: "18px",
                  color: "var(--color-navy)",
                  marginBottom: "12px",
                  letterSpacing: "0.01em",
                }}
              >
                {s.title}
              </h3>
              <p
                style={{
                  color: "var(--color-warm-gray)",
                  fontSize: "14px",
                  lineHeight: "1.75",
                }}
              >
                {s.desc}
              </p>

              {i < steps.length - 1 && (
                <div
                  className="hide-on-mobile"
                  style={{
                    position: "absolute",
                    top: "50%",
                    right: "-16px",
                    transform: "translateY(-50%)",
                    zIndex: 2,
                    color: "var(--color-linen)",
                  }}
                >
                  <svg
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1"
                  >
                    <path strokeLinecap="square" d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── PWA CALLOUT ── */}
      <section className="pwa-pad" style={{ background: "var(--color-linen)" }}>
        <div
          className="pwa-flex"
          style={{ maxWidth: "900px", margin: "0 auto" }}
        >
          <div style={{ flex: 1, minWidth: "260px" }}>
            <p
              style={{
                color: "var(--color-slate)",
                fontSize: "12px",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginBottom: "16px",
              }}
            >
              Works like an app
            </p>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(24px, 3vw, 38px)",
                color: "var(--color-navy)",
                fontWeight: 400,
                lineHeight: "1.2",
                marginBottom: "20px",
              }}
            >
              Install it on any device — no app store needed.
            </h2>
            <p
              style={{
                color: "var(--color-warm-gray)",
                fontSize: "15px",
                lineHeight: "1.8",
              }}
            >
              Open it in your browser once, click "Install", and it appears on
              your desktop or home screen — ready to use just like any other
              app.
            </p>
          </div>
          <div
            style={{
              flex: 1,
              minWidth: "260px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            {[
              {
                platform: "Windows / Mac",
                how: "Chrome browser → address bar install icon",
              },
              {
                platform: "Android phone",
                how: 'Chrome → "Add to Home Screen" prompt',
              },
              {
                platform: "iPhone / iPad",
                how: 'Safari → Share → "Add to Home Screen"',
              },
            ].map((p, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  padding: "16px 20px",
                  background: "var(--color-bg)",
                  border: "1px solid rgba(47,58,85,0.1)",
                }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    background: "var(--color-slate)",
                    flexShrink: 0,
                  }}
                />
                <div>
                  <div
                    style={{
                      fontSize: "13px",
                      color: "var(--color-navy)",
                      marginBottom: "2px",
                    }}
                  >
                    {p.platform}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "var(--color-warm-gray)",
                    }}
                  >
                    {p.how}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section
        className="cta-pad"
        style={{
          background: "var(--color-navy)",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", inset: 0, opacity: 0.04 }}>
          <svg width="100%" height="100%">
            <defs>
              <pattern
                id="dots"
                width="32"
                height="32"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="16" cy="16" r="1" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>
        <div style={{ position: "relative", zIndex: 2 }}>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(32px, 5vw, 60px)",
              color: "var(--color-linen)",
              fontWeight: 400,
              marginBottom: "24px",
              lineHeight: "1.1",
            }}
          >
            Ready to leave the
            <br />
            <em
              style={{ fontStyle: "italic", color: "rgba(231,226,222,0.45)" }}
            >
              registers behind?
            </em>
          </h2>
          <p
            style={{
              color: "rgba(231,226,222,0.5)",
              fontSize: "17px",
              marginBottom: "48px",
              maxWidth: "480px",
              margin: "0 auto 48px",
            }}
          >
            Built for simplicity.
          </p>
          <button
            onClick={handleGetStarted}
            style={{
              background: "var(--color-linen)",
              color: "var(--color-navy)",
              border: "none",
              padding: "18px 52px",
              fontSize: "16px",
              letterSpacing: "0.04em",
              cursor: "pointer",
              transition: "all 0.2s",
              display: "inline-flex",
              alignItems: "center",
              gap: "12px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#fff";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--color-linen)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            Create Your Account
            <svg
              width="18"
              height="18"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="square" d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
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

      {/* ── RESPONSIVE STYLES ── */}
      <style>{`
        @keyframes scrollBounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(6px); }
        }

        .nav-pad { padding: 0 48px; }
        .hero-pad { padding: 80px 48px; }
        .section-pad { padding: 100px 48px; }
        .pwa-pad { padding: 72px 48px; }
        .cta-pad { padding: 120px 48px; }
        .footer-pad { padding: 32px 48px; }
        
        .problem-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; alignItems: center; }
        .compare-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; border: 1px solid var(--color-linen); overflow: hidden; }
        .pwa-flex { display: flex; align-items: center; gap: 60px; flex-wrap: wrap; }
        .footer-flex { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; }

        @media (max-width: 768px) {
          .nav-pad { padding: 0 20px !important; }
          .hide-on-mobile { display: none !important; }
          .hero-pad { padding: 60px 20px 80px !important; }
          .section-pad { padding: 60px 20px !important; }
          .pwa-pad { padding: 60px 20px !important; }
          .cta-pad { padding: 80px 20px !important; }
          .footer-pad { padding: 32px 20px !important; }

          .problem-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .compare-grid { grid-template-columns: 1fr !important; }
          .pwa-flex { gap: 32px !important; flex-direction: column; align-items: flex-start !important; }
          .footer-flex { flex-direction: column !important; justify-content: center !important; text-align: center; }
        }
      `}</style>
    </div>
  );
}

// Vaulta Logo — vault door icon
function VaultaLogo({ size = 32, color = "var(--color-navy)" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="4" y="6" width="32" height="28" stroke={color} strokeWidth="2" />
      <circle cx="20" cy="20" r="8" stroke={color} strokeWidth="1.5" />
      <circle cx="20" cy="20" r="3" stroke={color} strokeWidth="1.5" />
      <line x1="20" y1="12" x2="20" y2="6" stroke={color} strokeWidth="1.5" />
      <line x1="20" y1="28" x2="20" y2="34" stroke={color} strokeWidth="1.5" />
      <line x1="12" y1="20" x2="6" y2="20" stroke={color} strokeWidth="1.5" />
      <line x1="28" y1="20" x2="36" y2="20" stroke={color} strokeWidth="1.5" />
      <line
        x1="14.34"
        y1="14.34"
        x2="10.1"
        y2="10.1"
        stroke={color}
        strokeWidth="1.5"
      />
      <line
        x1="25.66"
        y1="25.66"
        x2="29.9"
        y2="29.9"
        stroke={color}
        strokeWidth="1.5"
      />
      <line
        x1="25.66"
        y1="14.34"
        x2="29.9"
        y2="10.1"
        stroke={color}
        strokeWidth="1.5"
      />
      <line
        x1="14.34"
        y1="25.66"
        x2="10.1"
        y2="29.9"
        stroke={color}
        strokeWidth="1.5"
      />
      <rect x="32" y="18" width="4" height="4" fill={color} />
    </svg>
  );
}
