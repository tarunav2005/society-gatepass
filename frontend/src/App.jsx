import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./layouts/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Towers from "./pages/admin/Towers";
import Flats from "./pages/admin/Flats";
import VisitorCategories from "./pages/admin/VisitorCategories";
import PendingApprovals from "./pages/admin/PendingApprovals";
import AllUsers from "./pages/admin/AllUsers";
import GuardLayout from "./layouts/GuardLayout";
import RegisterVisitor from "./pages/guard/RegisterVisitor";
import VisitorLog from "./pages/guard/VisitorLog";
import ResidentLayout from "./layouts/ResidentLayout";
import Requests from "./pages/resident/Requests";
import History from "./pages/resident/History";
import ScanQR from "./pages/guard/ScanQR";
import PendingDeliveries from "./pages/guard/PendingDeliveries";
import StaffPage from "./pages/admin/Staff";
import ScanStaffQR from "./pages/guard/ScanStaffQR";
import MyStaff from "./pages/resident/MyStaff";
import GuardDashboard from "./pages/guard/GuardDashboard";
import BlacklistPage from "./pages/admin/Blacklist";
import VisitorHistory from "./pages/admin/VisitorHistory";
import Landing from "./pages/Landing";
import InviteGuest from "./pages/resident/InviteGuest";
import Profile from "./pages/resident/Profile";
import EmergencyLookup from "./pages/guard/EmergencyLookup";
import Broadcast from "./pages/admin/Broadcast";

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const roleHome = { admin: "/admin", resident: "/resident", guard: "/guard" };

  return (
    <Routes>
      <Route
        path="/login"
        element={
          user ? <Navigate to={roleHome[user.role]} replace /> : <Login />
        }
      />
      <Route
        path="/register"
        element={
          user ? <Navigate to={roleHome[user.role]} replace /> : <Register />
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="towers" element={<Towers />} />
        <Route path="flats" element={<Flats />} />
        <Route path="categories" element={<VisitorCategories />} />
        <Route path="approvals" element={<PendingApprovals />} />
        <Route path="users" element={<AllUsers />} />
        <Route path="staff" element={<StaffPage />} />
        <Route path="blacklist" element={<BlacklistPage />} />
        <Route path="history" element={<VisitorHistory />} />
        <Route path="broadcast" element={<Broadcast />} />
      </Route>

      {/* Resident/Guard dashboards come in later modules */}
      <Route
        path="/guard"
        element={
          <ProtectedRoute roles={["guard"]}>
            <GuardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<GuardDashboard />} />
        <Route path="register" element={<RegisterVisitor />} />
        <Route path="scan" element={<ScanQR />} />
        <Route path="staff-scan" element={<ScanStaffQR />} />
        <Route path="deliveries" element={<PendingDeliveries />} />
        <Route path="log" element={<VisitorLog />} />
        <Route path="emergency" element={<EmergencyLookup />} />
      </Route>

      <Route
        path="/resident"
        element={
          <ProtectedRoute roles={["resident"]}>
            <ResidentLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Requests />} />
        <Route path="invite" element={<InviteGuest />} />
        <Route path="staff" element={<MyStaff />} />
        <Route path="history" element={<History />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      <Route path="/" element={<Landing />} />
      <Route
        path="*"
        element={
          <Navigate to={user ? roleHome[user.role] : "/login"} replace />
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              className: "!rounded-xl !text-sm !font-medium",
              style: {
                background: "var(--toast-bg, #fff)",
                color: "var(--toast-fg, #1e293b)",
              },
              success: { iconTheme: { primary: "#10b981", secondary: "#fff" } },
              error: { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
            }}
          />
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
