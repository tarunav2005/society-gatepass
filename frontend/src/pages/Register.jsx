import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Phone, Lock, UserPlus } from "lucide-react";
import toast from "react-hot-toast";
import AuthShell from "../components/ui/AuthShell";
import FormField from "../components/ui/FormField";
import { useAuth } from "../context/AuthContext";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(10, "Enter a valid phone number"),
  password: z.string().min(6, "Minimum 6 characters"),
  role: z.enum(["resident", "guard"]),
  shift: z.string().optional(),
});

export default function Register() {
  const [loading, setLoading] = useState(false);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { role: "resident" },
  });

  const role = watch("role");

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      await registerUser(values);
      toast.success("Registered! Await admin approval before logging in.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <div className="text-center mb-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
          className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 mb-4 shadow-lg shadow-primary-500/30"
        >
          <UserPlus className="w-7 h-7 text-white" />
        </motion.div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
          Create account
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Join your society's gate pass system
        </p>
      </div>

      <div className="flex gap-2 mb-5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/50">
        {["resident", "guard"].map((r) => (
          <label
            key={r}
            className={`flex-1 text-center py-2 rounded-lg text-sm font-medium cursor-pointer transition capitalize ${
              role === r
                ? "bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow"
                : "text-slate-500 dark:text-slate-400"
            }`}
          >
            <input
              type="radio"
              value={r}
              {...register("role")}
              className="hidden"
            />
            {r}
          </label>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <FormField label="Full Name" error={errors.name}>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              {...register("name")}
              placeholder="Rahul Sharma"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
            />
          </div>
        </FormField>

        <FormField label="Email" error={errors.email}>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              {...register("email")}
              type="email"
              placeholder="you@example.com"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
            />
          </div>
        </FormField>

        <FormField label="Phone" error={errors.phone}>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              {...register("phone")}
              placeholder="9876543210"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
            />
          </div>
        </FormField>

        <AnimatePresence mode="wait">
          {role === "guard" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <FormField label="Shift">
                <select
                  {...register("shift")}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 dark:text-white"
                >
                  <option value="day">Day</option>
                  <option value="night">Night</option>
                  <option value="rotating">Rotating</option>
                </select>
              </FormField>
            </motion.div>
          )}
        </AnimatePresence>

        <FormField label="Password" error={errors.password}>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              {...register("password")}
              type="password"
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
            />
          </div>
        </FormField>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          disabled={loading}
          type="submit"
          className="w-full py-3 rounded-xl bg-gradient-to-r from-primary-600 to-purple-600 text-white font-semibold shadow-lg shadow-primary-500/30 disabled:opacity-60 transition mt-2"
        >
          {loading ? "Creating account..." : "Create Account"}
        </motion.button>
      </form>

      <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
        Already have an account?{" "}
        <Link
          to="/login"
          className="text-primary-600 dark:text-primary-400 font-medium hover:underline"
        >
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
