import { motion } from "framer-motion";

export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass rounded-2xl p-12 text-center"
    >
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
          <Icon className="w-6 h-6 text-slate-400 dark:text-slate-500" />
        </div>
      )}
      <p className="font-semibold text-slate-700 dark:text-slate-200">
        {title}
      </p>
      {description && (
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </motion.div>
  );
}
