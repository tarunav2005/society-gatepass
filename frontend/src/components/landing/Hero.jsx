import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  QrCode,
  ShieldCheck,
  Bell,
  CheckCircle2,
} from "lucide-react";

export default function Hero() {
  return (
    <section className="relative pt-40 pb-24 px-6 overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-50/50 via-white to-white dark:from-primary-950/30 dark:via-slate-950 dark:to-slate-950" />
        <motion.div
          animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
          transition={{ repeat: Infinity, duration: 12, ease: "easeInOut" }}
          className="absolute top-20 left-1/4 w-96 h-96 bg-primary-400/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -40, 0], y: [0, 30, 0] }}
          transition={{ repeat: Infinity, duration: 14, ease: "easeInOut" }}
          className="absolute top-40 right-1/4 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-6xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-semibold text-primary-700 dark:text-primary-400 mb-6"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Trusted by gated communities across India
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.05]"
        >
          Gate security,{" "}
          <span className="bg-gradient-to-r from-primary-600 via-purple-600 to-primary-600 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-x">
            reimagined.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto"
        >
          Replace paper registers with QR-based gate passes, real-time resident
          approvals, and a live dashboard your security team will actually enjoy
          using.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link to="/register">
            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="group flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-primary-600 to-purple-600 text-white font-semibold shadow-xl shadow-primary-500/30"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </motion.button>
          </Link>
          <a href="#how-it-works">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="px-7 py-3.5 rounded-2xl glass font-semibold text-slate-700 dark:text-slate-200"
            >
              See How It Works
            </motion.button>
          </a>
        </motion.div>

        {/* Animated dashboard mockup */}
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: 0.8,
            delay: 0.4,
            ease: [0.21, 0.47, 0.32, 0.98],
          }}
          className="relative mt-20 max-w-4xl mx-auto"
        >
          <div className="glass rounded-3xl p-3 shadow-2xl shadow-primary-500/10">
            <div className="rounded-2xl bg-slate-900 overflow-hidden">
              <div className="flex items-center gap-1.5 px-4 py-3 bg-slate-800/50">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              </div>
              <div className="p-6 grid grid-cols-3 gap-3">
                {[
                  {
                    label: "Today's Entries",
                    value: "142",
                    color: "from-blue-500 to-cyan-500",
                  },
                  {
                    label: "Currently Inside",
                    value: "38",
                    color: "from-emerald-500 to-teal-500",
                  },
                  {
                    label: "Pending Approvals",
                    value: "5",
                    color: "from-amber-500 to-orange-500",
                  },
                ].map((s, i) => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + i * 0.1 }}
                    className="bg-slate-800/60 rounded-xl p-4"
                  >
                    <div
                      className={`w-8 h-8 rounded-lg bg-gradient-to-br ${s.color} mb-3`}
                    />
                    <p className="text-2xl font-bold text-white">{s.value}</p>
                    <p className="text-xs text-slate-400">{s.label}</p>
                  </motion.div>
                ))}
              </div>
              <div className="px-6 pb-6 space-y-2">
                {[
                  { name: "Rahul Sharma", flat: "A-504", status: "Approved" },
                  { name: "Amazon Delivery", flat: "B-201", status: "Inside" },
                ].map((v, i) => (
                  <motion.div
                    key={v.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 + i * 0.1 }}
                    className="flex items-center justify-between bg-slate-800/40 rounded-lg px-4 py-2.5"
                  >
                    <span className="text-sm text-slate-200">
                      {v.name} → {v.flat}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-medium">
                      {v.status}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Floating QR badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotate: -8 }}
            animate={{ opacity: 1, scale: 1, rotate: -6 }}
            transition={{ delay: 1.2, type: "spring", stiffness: 200 }}
            className="absolute -right-8 -top-8 hidden md:block"
          >
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="glass rounded-2xl p-4 shadow-xl"
            >
              <QrCode className="w-16 h-16 text-primary-600 dark:text-primary-400" />
            </motion.div>
          </motion.div>

          {/* Floating check badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotate: 8 }}
            animate={{ opacity: 1, scale: 1, rotate: 6 }}
            transition={{ delay: 1.4, type: "spring", stiffness: 200 }}
            className="absolute -left-6 -bottom-6 hidden md:block"
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{
                repeat: Infinity,
                duration: 3.5,
                ease: "easeInOut",
              }}
              className="glass rounded-2xl p-3.5 shadow-xl flex items-center gap-2"
            >
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 pr-1">
                Approved
              </span>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
