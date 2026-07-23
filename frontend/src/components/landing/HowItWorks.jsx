import { motion } from "framer-motion";
import { UserPlus, Bell, QrCode, DoorOpen } from "lucide-react";
import Reveal from "./Reveal";

const steps = [
  {
    icon: UserPlus,
    title: "Guard registers visitor",
    desc: "At the gate, the guard logs visitor details in seconds.",
  },
  {
    icon: Bell,
    title: "Resident gets notified",
    desc: "An instant push notification asks for approval — no app switching.",
  },
  {
    icon: QrCode,
    title: "QR pass generated",
    desc: "Once approved, a secure, expiring QR code is created automatically.",
  },
  {
    icon: DoorOpen,
    title: "Scan & enter",
    desc: "Guard scans the QR to verify and check the visitor in instantly.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="py-28 px-6 bg-slate-50/50 dark:bg-slate-900/30"
    >
      <div className="max-w-5xl mx-auto">
        <Reveal className="text-center max-w-xl mx-auto mb-16">
          <p className="text-sm font-semibold text-primary-600 dark:text-primary-400 mb-3">
            HOW IT WORKS
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white">
            From gate to approved in seconds
          </h2>
        </Reveal>

        <div className="relative">
          <div className="hidden md:block absolute top-10 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-200 via-purple-300 to-primary-200 dark:from-primary-900 dark:via-purple-800 dark:to-primary-900" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            {steps.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.15}>
                <div className="relative flex flex-col items-center text-center">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="relative z-10 w-20 h-20 rounded-2xl bg-white dark:bg-slate-800 shadow-lg flex items-center justify-center mb-5 border border-slate-100 dark:border-slate-700"
                  >
                    <s.icon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-br from-primary-600 to-purple-600 text-white text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                  </motion.div>
                  <h3 className="font-bold text-slate-800 dark:text-white mb-2">
                    {s.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {s.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
