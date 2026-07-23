import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { UserCog, CheckCircle2, Clock, Circle } from "lucide-react";
import api from "../../lib/axios";
import PageHeader from "../../components/ui/PageHeader";

const statusConfig = {
  checked_in: {
    label: "Currently here",
    icon: CheckCircle2,
    cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  },
  checked_out: {
    label: "Came & left",
    icon: Clock,
    cls: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  },
  not_arrived: {
    label: "Not arrived yet",
    icon: Circle,
    cls: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
  },
};

export default function MyStaff() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await api.get("/staff/mine");
      setStaff(data.data);
      setLoading(false);
    })();
  }, []);

  return (
    <div>
      <PageHeader
        title="My Staff"
        subtitle="Maids, cooks & drivers assigned to your flat"
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="h-24 rounded-2xl bg-slate-200/60 dark:bg-slate-800/60 animate-pulse"
            />
          ))}
        </div>
      ) : !staff.length ? (
        <div className="glass rounded-2xl p-12 text-center text-slate-500 dark:text-slate-400">
          No staff assigned to your flat yet. Contact admin to add one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {staff.map((s, i) => {
            const status = statusConfig[s.todayStatus];
            const Icon = status.icon;
            return (
              <motion.div
                key={s._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass rounded-2xl p-5"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-500 to-primary-600 flex items-center justify-center text-white font-semibold">
                    {s.name[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-white">
                      {s.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 capitalize flex items-center gap-1">
                      <UserCog className="w-3 h-3" /> {s.role}
                    </p>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${status.cls}`}
                >
                  <Icon className="w-3.5 h-3.5" /> {status.label}
                </span>
                {s.lastCheckIn && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                    Last check-in:{" "}
                    {new Date(s.lastCheckIn).toLocaleTimeString()}
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
