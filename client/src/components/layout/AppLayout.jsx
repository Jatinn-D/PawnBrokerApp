import {
  useState,
  useEffect,
  createContext,
  useContext,
  useCallback,
} from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import VaultaLogo from "../ui/VaultaLogo";
import api from "../../lib/api";
import { useIdleTimeout } from "../../hooks/useIdleTimeout";

export const SidebarContext = createContext({ collapsed: false });
export const useSidebar = () => useContext(SidebarContext);

const Icon = ({ d, size = 18 }) => (
  <svg
    width={size}
    height={size}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.5"
    style={{ flexShrink: 0 }}
  >
    <path strokeLinecap="square" strokeLinejoin="miter" d={d} />
  </svg>
);

const NAV = [
  {
    path: "/dashboard",
    label: "Dashboard",
    d: "M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 13a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1h-4a1 1 0 01-1-1v-5z",
  },
  {
    path: "/new-bill",
    label: "New Bill",
    d: "M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z",
  },
  {
    path: "/customers",
    label: "Customers",
    d: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
  },
  {
    path: "/database",
    label: "Database",
    d: "M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4M4 7v5m16-5v5M4 12c0 2.21 3.582 4 8 4s8-1.79 8-4M4 12v5c0 2.21 3.582 4 8 4s8-1.79 8-4v-5",
  },
];

const BOTTOM_NAV = [
  {
    path: "/settings",
    label: "Settings",
    d: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z",
  },
  {
    path: "/account",
    label: "Account",
    d: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  },
];

const W_FULL = 228;
const W_COLLAPSED = 60;

function SidebarNav({ items, collapsed, onClick }) {
  return items.map((item) => (
    <NavLink
      key={item.path}
      to={item.path}
      onClick={onClick}
      style={({ isActive }) => ({
        display: "flex",
        alignItems: "center",
        gap: collapsed ? 0 : "11px",
        padding: collapsed ? "13px 0" : "10px 18px",
        justifyContent: collapsed ? "center" : "flex-start",
        color: isActive ? "var(--color-navy)" : "var(--color-warm-gray)",
        background: isActive ? "var(--color-linen)" : "transparent",
        borderLeft: isActive
          ? "3px solid var(--color-navy)"
          : "3px solid transparent",
        textDecoration: "none",
        fontSize: "13.5px",
        letterSpacing: "0.01em",
        position: "relative",
        whiteSpace: "nowrap",
        overflow: "hidden",
        transition: "background 0.12s, color 0.12s",
      })}
      onMouseEnter={(e) => {
        if (!e.currentTarget.style.background.includes("linen"))
          e.currentTarget.style.background = "#EDEBE7";
      }}
      onMouseLeave={(e) => {
        if (!e.currentTarget.getAttribute("aria-current"))
          e.currentTarget.style.background = "";
      }}
    >
      <Icon d={item.d} />
      {!collapsed && (
        <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
          {item.label}
        </span>
      )}
      {collapsed && (
        <span
          style={{
            position: "absolute",
            left: "calc(100% + 8px)",
            top: "50%",
            transform: "translateY(-50%)",
            background: "var(--color-navy)",
            color: "#fff",
            padding: "5px 10px",
            fontSize: "12px",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            zIndex: 200,
            opacity: 0,
            transition: "opacity 0.1s",
          }}
          className="nav-tooltip"
        >
          {item.label}
        </span>
      )}
    </NavLink>
  ));
}

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("vaulta_sidebar_collapsed") === "true",
  );
  const [mobileOpen, setMobileOpen] = useState(false);
  const [prevPath, setPrevPath] = useState("");

  // Auto-logout after 10 minutes of inactivity
  const handleIdleLogout = useCallback(() => {
    logout();
    navigate("/auth");
  }, [logout, navigate]);
  useIdleTimeout(handleIdleLogout);

  useEffect(() => {
    setMobileOpen(false);
    const cleanSection = (path) => {
      const clean = path.replace(/^\//, "") || "dashboard";
      if (clean.startsWith("database/")) return "database";
      if (clean.startsWith("new-bill")) return "new-bill";
      return clean;
    };

    const cur = cleanSection(location.pathname);
    const prev = cleanSection(prevPath);

    if (prev && prev !== cur) {
      api
        .post("/api/activity/nav", { from_section: prev, to_section: cur })
        .catch(() => {});
    }
    setPrevPath(location.pathname);
  }, [location.pathname]);

  const toggleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("vaulta_sidebar_collapsed", String(next));
  };

  const sidebarW = collapsed ? W_COLLAPSED : W_FULL;

  // Render the actual Sidebar HTML
  // We force `collapsed=true` when rendering on Mobile
  const SidebarContent = ({ isMobile = false }) => {
    const isActuallyCollapsed = isMobile ? true : collapsed;

    return (
      <>
        {/* Header inside the sidebar */}
        <div
          style={{
            height: "60px",
            padding: isActuallyCollapsed ? "0" : "0 14px 0 18px",
            borderBottom: "1px solid var(--color-linen)",
            display: "flex",
            alignItems: "center",
            justifyContent: isActuallyCollapsed ? "center" : "space-between",
            flexShrink: 0,
          }}
        >
          {/* Only show the full text logo if we are on Desktop and expanded */}
          {!isActuallyCollapsed && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                overflow: "hidden",
                fontFamily: "var(--font-display)",
                fontSize: "20px",
                color: "var(--color-navy)",
                whiteSpace: "nowrap",
              }}
            >
              Asha Pawn Broker
            </div>
          )}
          {/* Show the small logo icon if we are collapsed (Mobile or Desktop) */}
          {isActuallyCollapsed && <VaultaLogo size={22} />}

          {/* Expand/Collapse Button (Desktop Only) */}
          {!isMobile && (
            <button
              onClick={toggleCollapse}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--color-warm-gray)",
                padding: "0px",
                display: "flex",
                flexShrink: 0,
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--color-navy)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--color-warm-gray)")
              }
            >
              {collapsed ? (
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="square" d="M9 5l7 7-7 7" />
                </svg>
              ) : (
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="square" d="M15 19l-7-7 7-7" />
                </svg>
              )}
            </button>
          )}
        </div>

        {/* Main nav links */}
        <nav
          style={{
            flex: 1,
            padding: "10px 0",
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          {!isActuallyCollapsed && (
            <p
              style={{
                fontSize: "9px",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "rgba(110,111,115,0.45)",
                padding: "8px 18px 4px",
              }}
            >
              Menu
            </p>
          )}
          <SidebarNav
            items={NAV}
            collapsed={isActuallyCollapsed}
            onClick={isMobile ? () => setMobileOpen(false) : undefined}
          />
        </nav>

        {/* Bottom nav links */}
        <div style={{ borderTop: "1px solid var(--color-linen)" }}>
          <SidebarNav
            items={BOTTOM_NAV}
            collapsed={isActuallyCollapsed}
            onClick={isMobile ? () => setMobileOpen(false) : undefined}
          />

          {/* User Profile Strip */}
          <div
            style={{
              borderTop: "1px solid var(--color-linen)",
              padding: isActuallyCollapsed ? "12px 0" : "12px 16px",
              display: "flex",
              flexDirection: isActuallyCollapsed ? "column" : "row",
              alignItems: "center",
              gap: "9px",
              justifyContent: isActuallyCollapsed ? "center" : "flex-start",
              cursor: isActuallyCollapsed ? "pointer" : "default", // Make the avatar clickable to logout on mobile
            }}
            onClick={
              isActuallyCollapsed
                ? () => {
                    logout();
                    navigate("/auth");
                  }
                : undefined
            }
            title={isActuallyCollapsed ? "Log out" : ""}
          >
            <div
              style={{
                width: "30px",
                height: "30px",
                background: "var(--color-navy)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: "12px",
                flexShrink: 0,
              }}
            >
              {user?.name?.charAt(0).toUpperCase()}
            </div>

            {!isActuallyCollapsed && (
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: "13px",
                    color: "var(--color-navy)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {user?.name}
                </div>
                <button
                  onClick={() => {
                    logout();
                    navigate("/auth");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    margin: 0,
                    fontSize: "11px",
                    color: "var(--color-warm-gray)",
                    cursor: "pointer",
                    textDecoration: "underline",
                    textUnderlineOffset: "2px",
                    fontFamily: "var(--font-body)",
                    transition: "color 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "#C0392B")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "var(--color-warm-gray)")
                  }
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </>
    );
  };

  return (
    <SidebarContext.Provider value={{ collapsed }}>
      <div
        style={{
          display: "flex",
          height: "100vh",
          overflow: "hidden",
          background: "var(--color-bg)",
        }}
      >
        <style>{`
          @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
          @media (max-width: 768px) {
            .desktop-sidebar { display: none !important; }
            .mobile-topbar   { display: flex !important; }
            .main-wrap       { margin-left: 0 !important; }
          }
          @media (min-width: 769px) {
            .mobile-overlay  { display: none !important; }
            .mobile-sidebar  { display: none !important; }
            .mobile-topbar   { display: none !important; }
          }
        `}</style>

        {/* ── DESKTOP SIDEBAR ── */}
        <aside
          className="desktop-sidebar"
          style={{
            width: sidebarW,
            flexShrink: 0,
            background: "var(--color-bg)",
            borderRight: "1px solid var(--color-linen)",
            display: "flex",
            flexDirection: "column",
            height: "100vh",
            position: "fixed",
            left: 0,
            top: 0,
            zIndex: 50,
            transition: "width 0.22s ease",
            overflow: "hidden",
          }}
        >
          <SidebarContent />
        </aside>

        {/* ── MOBILE OVERLAY ── */}
        {mobileOpen && (
          <div
            className="mobile-overlay"
            onClick={() => setMobileOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(47,58,85,0.5)",
              zIndex: 100,
            }}
          />
        )}

        {/* ── MOBILE SIDEBAR (Icons Only) ── */}
        <aside
          className="mobile-sidebar"
          style={{
            position: "fixed",
            left: 0,
            top: 0,
            bottom: 0,
            width: W_COLLAPSED, // Force width to 60px
            background: "var(--color-bg)",
            borderRight: "1px solid var(--color-linen)",
            zIndex: 101,
            display: "flex",
            flexDirection: "column",
            transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
            transition: "transform 0.22s ease",
          }}
        >
          <SidebarContent isMobile={true} />
        </aside>

        {/* ── MAIN CONTENT WRAPPER ── */}
        <div
          className="main-wrap"
          style={{
            marginLeft: sidebarW,
            flex: 1,
            display: "flex",
            flexDirection: "column",
            height: "100vh",
            overflow: "hidden",
            minWidth: 0,
            transition: "margin-left 0.22s ease",
          }}
        >
          {/* ── MOBILE TOPBAR (Hamburger on LEFT) ── */}
          <div
            className="mobile-topbar"
            style={{
              height: "56px",
              padding: "0 16px",
              borderBottom: "1px solid var(--color-linen)",
              background: "var(--color-bg)",
              alignItems: "center",
              justifyContent: "flex-start",
              flexShrink: 0,
              gap: "12px", // Space between hamburger and logo
            }}
          >
            {/* Hamburger Menu Button */}
            <button
              onClick={() => setMobileOpen(true)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--color-navy)",
                display: "flex",
                padding: "4px 0",
              }}
            >
              <svg
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path strokeLinecap="square" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Logo and Name */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <VaultaLogo size={20} />
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "17px",
                  color: "var(--color-navy)",
                }}
              >
                Asha Pawn Broker
              </span>
            </div>
          </div>

          <main style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarContext.Provider>
  );
}
