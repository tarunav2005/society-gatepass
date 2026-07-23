import { motion } from "framer-motion";
import clsx from "clsx";

const variants = {
  primary:
    "bg-gradient-to-r from-primary-600 to-purple-600 text-white shadow-lg shadow-primary-500/30",
  danger: "bg-red-500 text-white shadow-lg shadow-red-500/30",
  success: "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30",
  ghost: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200",
};

export default function Button({
  variant = "primary",
  className,
  children,
  ...props
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      className={clsx(
        "px-4 py-2 rounded-xl text-sm font-semibold transition disabled:opacity-60",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}
