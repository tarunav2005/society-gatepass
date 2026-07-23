import { motion } from "framer-motion";

export default function AuthShell({ children }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      {/* animated blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div className="absolute -top-32 -left-32 w-96 h-96 bg-primary-400/30 rounded-full blur-3xl animate-float" />
        <motion.div
          className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-400/30 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        />
        <motion.div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary-300/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="glass rounded-3xl p-8">{children}</div>
      </motion.div>
    </div>
  );
}
