import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Building2, Home, Users, UserCheck, Clock } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import api from "../../lib/axios";
import PageHeader from "../../components/ui/PageHeader";

const COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#ef4444",
];

export default function Dashboard() {
  const [stats, setStats] = useState({
    towers: 0,
    flats: 0,
    users: 0,
    pending: 0,
  });
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [towers, flats, users, pending, analyticsRes] = await Promise.all([
        api.get("/towers"),
        api.get("/flats"),
        api.get("/users"),
        api.get("/users/pending"),
        api.get("/dashboard/admin"),
      ]);
      setStats({
        towers: towers.data.count,
        flats: flats.data.count,
        users: users.data.count,
        pending: pending.data.count,
      });
      setAnalytics(analyticsRes.data.data);
      setLoading(false);
    })();
  }, []);

  const cards = [
    {
      label: "Towers",
      value: stats.towers,
      icon: Building2,
      color: "from-blue-500 to-cyan-500",
    },
    {
      label: "Flats",
      value: stats.flats,
      icon: Home,
      color: "from-purple-500 to-pink-500",
    },
    {
      label: "Total Users",
      value: stats.users,
      icon: Users,
      color: "from-emerald-500 to-teal-500",
    },
    {
      label: "Pending Approvals",
      value: stats.pending,
      icon: UserCheck,
      color: "from-amber-500 to-orange-500",
    },
  ];

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Live overview of your society" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass rounded-2xl p-5"
          >
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center mb-3`}
            >
              <c.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">
              {c.value}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {c.label}
            </p>
          </motion.div>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-72 rounded-2xl bg-slate-200/60 dark:bg-slate-800/60 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Trend line - full width */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-5"
          >
            <h2 className="font-semibold text-slate-800 dark:text-white mb-4">
              Visitor Trend — Last 14 Days
            </h2>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={analytics.dailyTrend}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e2e8f0"
                  opacity={0.3}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(d) => d.slice(5)}
                  stroke="#94a3b8"
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  stroke="#94a3b8"
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "none",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Row 1: Status / Category / Tower breakdowns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass rounded-2xl p-5"
            >
              <h2 className="font-semibold text-slate-800 dark:text-white mb-4 text-sm">
                Status Breakdown
              </h2>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={analytics.statusBreakdown}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="45%"
                    outerRadius={70}
                    label={false}
                  >
                    {analytics.statusBreakdown.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    wrapperStyle={{ fontSize: 11 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="glass rounded-2xl p-5"
            >
              <h2 className="font-semibold text-slate-800 dark:text-white mb-4 text-sm">
                By Category
              </h2>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={analytics.categoryBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10 }}
                    stroke="#94a3b8"
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    stroke="#94a3b8"
                    allowDecimals={false}
                  />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-2xl p-5"
            >
              <h2 className="font-semibold text-slate-800 dark:text-white mb-4 text-sm">
                By Tower
              </h2>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={analytics.towerBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10 }}
                    stroke="#94a3b8"
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    stroke="#94a3b8"
                    allowDecimals={false}
                  />
                  <Tooltip />
                  <Bar dataKey="value" fill="#06b6d4" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Row 2: Peak hours (wide) / Most visited flats / Avg approval time */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="glass rounded-2xl p-5 lg:col-span-2"
            >
              <h2 className="font-semibold text-slate-800 dark:text-white mb-4 text-sm">
                Peak Visiting Hours
              </h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={analytics.peakHours}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis
                    dataKey="hour"
                    tick={{ fontSize: 9 }}
                    stroke="#94a3b8"
                    interval={2}
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    stroke="#94a3b8"
                    allowDecimals={false}
                  />
                  <Tooltip />
                  <Bar dataKey="count" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass rounded-2xl p-5"
            >
              <h2 className="font-semibold text-slate-800 dark:text-white mb-4 text-sm">
                Most Visited Flats
              </h2>
              <div className="space-y-2">
                {analytics.frequentFlats.length ? (
                  analytics.frequentFlats.map((f, i) => (
                    <div
                      key={f.name}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-slate-600 dark:text-slate-300">
                        #{i + 1} {f.name}
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-white">
                        {f.value}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400 text-center py-6">
                    No data yet
                  </p>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="glass rounded-2xl p-5 flex flex-col justify-center items-center text-center"
            >
              <Clock className="w-8 h-8 text-primary-500 mb-3" />
              <p className="text-3xl font-bold text-slate-800 dark:text-white">
                {analytics.avgApprovalSeconds < 60 ? (
                  <>
                    {analytics.avgApprovalSeconds}
                    <span className="text-lg text-slate-400"> sec</span>
                  </>
                ) : (
                  <>
                    {Math.round(analytics.avgApprovalSeconds / 60)}
                    <span className="text-lg text-slate-400"> min</span>
                  </>
                )}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Avg. Approval Time
              </p>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}
