import { NavLink, Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import NotificationBell from "../components/ui/NotificationBell";
import {
  LayoutDashboard,
  UserPlus,
  ListChecks,
  ScanLine,
  Package,
  UserCog,
  AlertTriangle,
  LogOut,
} from "lucide-react";
import PageTransition from "../components/ui/PageTransition";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "../components/ui/ThemeToggle";

const navItems = [
  { to: "/guard", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/guard/register", icon: UserPlus, label: "Register Visitor" },
  { to: "/guard/scan", icon: ScanLine, label: "Scan Visitor QR" },
  { to: "/guard/staff-scan", icon: UserCog, label: "Scan Staff Pass" },
  { to: "/guard/deliveries", icon: Package, label: "Pending Deliveries" },
  { to: "/guard/emergency", icon: AlertTriangle, label: "Emergency Lookup" },
  { to: "/guard/log", icon: ListChecks, label: "Today's Log" },
];

export default function GuardLayout() {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      <aside className="w-64 shrink-0 glass !rounded-none border-r border-slate-200 dark:border-slate-800 flex flex-col">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <img
              src="/favicon.svg"
              alt="Society GatePass"
              className="w-9 h-9 rounded-lg shrink-0"
            />
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent leading-tight">
                Society GatePass
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Guard
              </p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition relative ${
                  isActive
                    ? "text-primary-600 dark:text-primary-400"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="guard-nav-active"
                      className="absolute inset-0 bg-primary-50 dark:bg-primary-500/10 rounded-xl border border-primary-200 dark:border-primary-500/20"
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}
                  <Icon className="w-4.5 h-4.5 relative z-10" />
                  <span className="relative z-10">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-800 dark:text-white truncate">
                {user?.name}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate capitalize">
                {user?.shift} shift
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center justify-end gap-2 px-6 border-b border-slate-200 dark:border-slate-800">
          <NotificationBell />
          <ThemeToggle inline />
        </header>
        <main className="flex-1 p-6 overflow-auto">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
      </div>
    </div>
  );
}
