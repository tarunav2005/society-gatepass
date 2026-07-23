import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  UserPlus,
  ScanLine,
  Package,
  Users,
  Clock,
  Home,
  UserCog,
  ArrowRight,
  DoorOpen,
} from "lucide-react";
import api from "../../lib/axios";
import { getSocket } from "../../lib/socket";
import PageHeader from "../../components/ui/PageHeader";

export default function GuardDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const { data } = await api.get("/dashboard/guard");
      setData(data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // Live refresh on any visitor status change
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const refresh = () => fetchDashboard();
    socket.on("visitor:status_updated", refresh);
    socket.on("visitor:checked_in", refresh);
    socket.on("visitor:checked_out", refresh);
    return () => {
      socket.off("visitor:status_updated", refresh);
      socket.off("visitor:checked_in", refresh);
      socket.off("visitor:checked_out", refresh);
    };
  }, []);

  if (loading || !data) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-24 rounded-2xl bg-slate-200/60 dark:bg-slate-800/60 animate-pulse"
          />
        ))}
      </div>
    );
  }

  const stats = [
    {
      label: "Today's Entries",
      value: data.todayTotal,
      icon: UserPlus,
      color: "from-blue-500 to-cyan-500",
    },
    {
      label: "Awaiting Approval",
      value: data.todayPending,
      icon: Clock,
      color: "from-amber-500 to-orange-500",
    },
    {
      label: "Currently Inside",
      value: data.insideCount,
      icon: DoorOpen,
      color: "from-emerald-500 to-teal-500",
    },
    {
      label: "Pending Pickups",
      value: data.pendingDeliveries,
      icon: Package,
      color: "from-purple-500 to-pink-500",
    },
  ];

  const quickActions = [
    {
      to: "/guard/register",
      icon: UserPlus,
      label: "Register Visitor",
      color: "from-primary-500 to-purple-600",
    },
    {
      to: "/guard/scan",
      icon: ScanLine,
      label: "Scan Visitor QR",
      color: "from-emerald-500 to-teal-600",
    },
    {
      to: "/guard/staff-scan",
      icon: UserCog,
      label: "Scan Staff Pass",
      color: "from-purple-500 to-fuchsia-600",
    },
    {
      to: "/guard/deliveries",
      icon: Package,
      label: "Pending Deliveries",
      color: "from-amber-500 to-orange-600",
    },
  ];

  return (
    <div>
      <PageHeader
        title="Gate Overview"
        subtitle="Live status of your society's entry points"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="glass rounded-2xl p-5"
          >
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3`}
            >
              <s.icon className="w-5 h-5 text-white" />
            </div>
            <motion.p
              key={s.value}
              initial={{ scale: 1.15 }}
              animate={{ scale: 1 }}
              className="text-2xl font-bold text-slate-800 dark:text-white"
            >
              {s.value}
            </motion.p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {s.label}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {quickActions.map((a, i) => (
          <Link key={a.to} to={a.to}>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              whileHover={{ y: -3 }}
              className="glass rounded-2xl p-4 flex items-center gap-3 cursor-pointer group"
            >
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${a.color} flex items-center justify-center shrink-0`}
              >
                <a.icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200 flex-1">
                {a.label}
              </span>
              <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:translate-x-1 transition" />
            </motion.div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-5">
          <h2 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-500" /> Visitors Inside (
            {data.currentlyInsideVisitors.length})
          </h2>
          {!data.currentlyInsideVisitors.length ? (
            <p className="text-sm text-slate-400 dark:text-slate-500 py-6 text-center">
              No visitors currently inside
            </p>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {data.currentlyInsideVisitors.map((v) => (
                <div
                  key={v._id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      {v.name}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      {v.tower?.name} - {v.flat?.flatNumber} •{" "}
                      {v.category?.name}
                    </p>
                  </div>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    Inside
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass rounded-2xl p-5">
          <h2 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <UserCog className="w-4 h-4 text-purple-500" /> Staff Inside (
            {data.currentlyInsideStaff.length})
          </h2>
          {!data.currentlyInsideStaff.length ? (
            <p className="text-sm text-slate-400 dark:text-slate-500 py-6 text-center">
              No staff currently inside
            </p>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {data.currentlyInsideStaff.map((s) => (
                <div
                  key={s._id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      {s.staff?.name}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 capitalize">
                      {s.staff?.role} • {s.flat?.flatNumber}
                    </p>
                  </div>
                  <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                    {new Date(s.checkInAt).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="glass rounded-2xl p-5 mt-6">
        <h2 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" /> Your Recent Activity
        </h2>
        {!data.recentActivity.length ? (
          <p className="text-sm text-slate-400 dark:text-slate-500 py-6 text-center">
            No activity yet today
          </p>
        ) : (
          <div className="space-y-2">
            {data.recentActivity.map((v) => (
              <div
                key={v._id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50"
              >
                <div className="flex items-center gap-2">
                  <Home className="w-3.5 h-3.5 text-slate-400" />
                  <p className="text-sm text-slate-700 dark:text-slate-200">
                    {v.name}{" "}
                    <span className="text-slate-400">
                      → {v.flat?.flatNumber}
                    </span>
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                    v.status === "checked_in"
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                      : v.status === "approved"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                        : v.status === "pending"
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                          : v.status === "rejected"
                            ? "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400"
                            : "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                  }`}
                >
                  {v.status.replace("_", " ")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
