import { ShieldCheck } from "lucide-react";

export default function Footer() {
  return (
    <footer className="py-10 px-6 border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Society GatePass
          </span>
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          © {new Date().getFullYear()} Society GatePass. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
