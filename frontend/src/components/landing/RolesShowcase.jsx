import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Home, UserCog } from "lucide-react";
import Reveal from "./Reveal";

const roles = [
  {
    key: "admin",
    label: "Admin",
    icon: ShieldCheck,
    title: "Complete oversight, zero blind spots",
    points: [
      "Live analytics dashboard with charts",
      "Manage towers, flats & visitor categories",
      "Blacklist management with instant guard alerts",
      "Export PDF/Excel reports anytime",
    ],
  },
  {
    key: "resident",
    label: "Resident",
    icon: Home,
    title: "Approve visitors from your phone",
    points: [
      "Instant push notification when someone arrives",
      "One-tap approve or reject",
      "View & share QR passes with guests",
      "Track staff attendance for your flat",
    ],
  },
  {
    key: "guard",
    label: "Guard",
    icon: UserCog,
    title: "Everything at the gate, simplified",
    points: [
      "Register visitors in under 30 seconds",
      "Scan QR codes with your phone camera",
      "Live view of who's currently inside",
      "Blacklist warnings before you let anyone in",
    ],
  },
];

export default function RolesShowcase() {
  const [active, setActive] = useState("admin");
  const activeRole = roles.find((r) => r.key === active);

  return (
    <section id="roles" className="py-28 px-6">
      <div className="max-w-5xl mx-auto">
        <Reveal className="text-center max-w-xl mx-auto mb-12">
          <p className="text-sm font-semibold text-primary-600 dark:text-primary-400 mb-3">
            BUILT FOR EVERYONE
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white">
            One system, three experiences
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="flex justify-center gap-2 mb-10">
            {roles.map((r) => (
              <button
                key={r.key}
                onClick={() => setActive(r.key)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition ${
                  active === r.key
                    ? "bg-gradient-to-r from-primary-600 to-purple-600 text-white shadow-lg shadow-primary-500/30"
                    : "glass text-slate-600 dark:text-slate-300"
                }`}
              >
                <r.icon className="w-4 h-4" /> {r.label}
              </button>
            ))}
          </div>
        </Reveal>

        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35 }}
            className="glass rounded-3xl p-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
          >
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white mb-5">
                {activeRole.title}
              </h3>
              <ul className="space-y-3">
                {activeRole.points.map((p) => (
                  <li
                    key={p}
                    className="flex items-start gap-2.5 text-slate-600 dark:text-slate-300"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2 shrink-0" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-primary-500/10 to-purple-500/10 p-8 flex items-center justify-center">
              <activeRole.icon
                className="w-32 h-32 text-primary-500/40"
                strokeWidth={1}
              />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
