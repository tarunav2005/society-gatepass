import { motion } from "framer-motion";
import {
  QrCode,
  Users,
  ShieldAlert,
  Building2,
  BarChart3,
  Bell,
  Package,
  UserCog,
  UserPlus,
  Megaphone,
  FileSpreadsheet,
} from "lucide-react";
import Reveal from "./Reveal";

export default function Features() {
  return (
    <section id="features" className="py-28 px-6">
      <div className="max-w-6xl mx-auto">
        <Reveal className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-semibold text-primary-600 dark:text-primary-400 mb-3">
            FEATURES
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white">
            Everything your gate needs
          </h2>
          <p className="mt-4 text-slate-500 dark:text-slate-400">
            One platform for residents, guards, and admins — built for how real
            societies actually operate.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-5">
          {/* Large feature card */}
          <Reveal delay={0.05} className="md:col-span-4">
            <div className="glass rounded-3xl p-8 h-full relative overflow-hidden group">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary-400/20 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-500" />
              <QrCode className="w-10 h-10 text-primary-600 dark:text-primary-400 mb-5" />
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                QR-Based Gate Passes
              </h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-md">
                Every approved visitor gets a signed, tamper-proof QR code with
                built-in expiry. Guards scan to verify instantly — no manual
                lookups, no fraud.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="md:col-span-2">
            <div className="glass rounded-3xl p-8 h-full bg-gradient-to-br from-primary-600 to-purple-700 text-white">
              <Bell className="w-9 h-9 mb-5" />
              <h3 className="text-xl font-bold mb-2">Real-Time Approvals</h3>
              <p className="text-white/80 text-sm">
                Residents get instant push notifications the moment someone's at
                the gate. Approve or reject in one tap.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.12} className="md:col-span-2">
            <div className="glass rounded-3xl p-8 h-full">
              <UserPlus className="w-9 h-9 text-primary-600 dark:text-primary-400 mb-5" />
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
                Invite Guests in Advance
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Residents pre-approve visitors and share a ready-made QR pass
                before they even arrive.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.15} className="md:col-span-2">
            <div className="glass rounded-3xl p-8 h-full">
              <Package className="w-9 h-9 text-purple-600 dark:text-purple-400 mb-5" />
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
                Delivery Management
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Dedicated flow for Amazon, Swiggy, Zomato & more — with
                leave-at-gate options.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.18} className="md:col-span-2">
            <div className="glass rounded-3xl p-8 h-full">
              <UserCog className="w-9 h-9 text-blue-600 dark:text-blue-400 mb-5" />
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
                Staff & Maid Passes
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Permanent QR IDs for recurring staff, with attendance history
                and working-hour restrictions.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.2} className="md:col-span-2">
            <div className="glass rounded-3xl p-8 h-full">
              <ShieldAlert className="w-9 h-9 text-red-500 mb-5" />
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
                Blacklist Alerts
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Guards get live warnings when a flagged visitor tries to enter.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.22} className="md:col-span-3">
            <div className="glass rounded-3xl p-8 h-full">
              <BarChart3 className="w-9 h-9 text-emerald-600 dark:text-emerald-400 mb-5" />
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                Live Analytics
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Visitor trends, peak hours, frequently visited flats, and
                approval-time metrics — all visualized in real time.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.25} className="md:col-span-3">
            <div className="glass rounded-3xl p-8 h-full">
              <Building2 className="w-9 h-9 text-cyan-600 dark:text-cyan-400 mb-5" />
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                Tower & Flat Management
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Structure your entire society, assign residents, and manage
                occupancy from one place.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.28} className="md:col-span-3">
            <div className="glass rounded-3xl p-8 h-full bg-gradient-to-br from-red-500 to-orange-600 text-white">
              <Megaphone className="w-9 h-9 mb-5" />
              <h3 className="text-xl font-bold mb-2">Emergency Broadcast</h3>
              <p className="text-white/80 text-sm">
                Instantly notify every resident in the society during
                emergencies — water cuts, fire drills, security alerts — with
                one message.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.3} className="md:col-span-3">
            <div className="glass rounded-3xl p-8 h-full">
              <FileSpreadsheet className="w-9 h-9 text-amber-600 dark:text-amber-400 mb-5" />
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                Exportable Reports
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Visitor logs, staff attendance, resident-wise history, and
                blacklist reports — export to PDF or Excel anytime.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
