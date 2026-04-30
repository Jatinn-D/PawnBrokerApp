import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import NewBill from "./pages/NewBill";
import Customers from "./pages/Customers";
import Database from "./pages/Database";
import BillDetail from "./pages/BillDetail";
import Settings from "./pages/Settings";
import Account from "./pages/Account";
import ResetPassword from "./pages/ResetPassword";

function AppRoutes() {
  const { user, loading } = useAuth();
  const hasSeenLanding = localStorage.getItem("vaulta_seen_landing");

  if (loading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--color-bg)",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            border: "2px solid var(--color-linen)",
            borderTop: "2px solid var(--color-navy)",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <span
          style={{
            color: "var(--color-warm-gray)",
            fontSize: "14px",
            letterSpacing: "0.05em",
          }}
        >
          Loading System...
        </span>
      </div>
    );
  }

  return (
    <Routes>
      {/* Landing — only shown once */}
      <Route
        path="/welcome"
        element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />}
      />

      {/* Auth */}
      <Route
        path="/auth"
        element={user ? <Navigate to="/dashboard" replace /> : <AuthPage />}
      />

      {/* Protected app routes */}
      <Route
        path="/"
        element={
          user ? (
            <AppLayout />
          ) : hasSeenLanding ? (
            <Navigate to="/auth" replace />
          ) : (
            <Navigate to="/welcome" replace />
          )
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="new-bill" element={<NewBill />} />
        <Route path="customers" element={<Customers />} />
        <Route path="database" element={<Database />} />
        <Route path="database/:id" element={<BillDetail />} />
        <Route path="settings" element={<Settings />} />
        <Route path="account" element={<Account />} />
      </Route>
      <Route path="/auth/reset-password" element={<ResetPassword />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter
        future={{
          v7_relativeSplatPath: true,
          v7_startTransition: true, // Might as well fix the other common warning too!
        }}
      >
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
