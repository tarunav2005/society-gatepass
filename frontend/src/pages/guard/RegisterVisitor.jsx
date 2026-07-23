import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserPlus,
  Phone,
  Tag,
  Building2,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../lib/axios";
import { getSocket } from "../../lib/socket";
import Button from "../../components/ui/Button";
import FormField from "../../components/ui/FormField";
import PageHeader from "../../components/ui/PageHeader";

export default function RegisterVisitor() {
  const [towers, setTowers] = useState([]);
  const [flats, setFlats] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    purpose: "",
    category: "",
    tower: "",
    flat: "",
    courierCompany: "",
    packageCount: 1,
    deliveryMode: "hand_to_resident",
    idProofNumber: "",
    vehicleNumber: "",
    photo: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [pendingVisitor, setPendingVisitor] = useState(null); // currently awaiting resident response
  const [blacklistWarning, setBlacklistWarning] = useState(null);

  const selectedCategory = categories.find((c) => c._id === form.category);
  const isDeliveryCategory = selectedCategory?.isDelivery;

  useEffect(() => {
    (async () => {
      const [towersRes, catRes] = await Promise.all([
        api.get("/towers"),
        api.get("/visitor-categories"),
      ]);
      setTowers(towersRes.data.data);
      setCategories(catRes.data.data.filter((c) => c.isActive));
    })();
  }, []);

  useEffect(() => {
    if (form.phone.length < 10) {
      setBlacklistWarning(null);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const { data } = await api.get(`/blacklist/check/${form.phone}`);
        setBlacklistWarning(data.data.blacklisted ? data.data.entry : null);
      } catch {
        setBlacklistWarning(null);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [form.phone]);

  const handleTowerChange = async (towerId) => {
    setForm((f) => ({ ...f, tower: towerId, flat: "" }));
    const { data } = await api.get("/flats", { params: { tower: towerId } });
    setFlats(data.data.filter((f) => f.status === "occupied"));
  };

  // Listen for real-time response once we've submitted a visitor awaiting approval
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handler = (visitor) => {
      setPendingVisitor((prev) =>
        prev && prev._id === visitor._id ? visitor : prev,
      );
      if (visitor.status === "approved")
        toast.success(`${visitor.name} approved by resident!`);
      if (visitor.status === "rejected")
        toast.error(`${visitor.name} was rejected`);
    };

    socket.on("visitor:status_updated", handler);
    return () => socket.off("visitor:status_updated", handler);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await api.post("/visitors", form);
      setPendingVisitor(data.data);
      const category = categories.find((c) => c._id === form.category);
      if (category?.requiresApproval) {
        toast.success("Sent to resident for approval");
      } else {
        toast.success("Auto-approved — visitor can enter");
      }
      setForm({
        name: "",
        phone: "",
        purpose: "",
        category: "",
        tower: "",
        flat: "",
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to register visitor");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      await api.patch(`/visitors/${pendingVisitor._id}/check-in`);
      toast.success("Visitor checked in");
      setPendingVisitor(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Check-in failed");
    }
  };

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Register Visitor"
        subtitle="Log a new visitor at the gate"
      />

      <div className="glass rounded-2xl p-6">
        <form onSubmit={handleSubmit} className="space-y-1">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Visitor Name">
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Rahul Sharma"
                className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
              />
            </FormField>
            <FormField label="Phone">
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="9876543210"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                />
              </div>
            </FormField>
          </div>

          {blacklistWarning && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 flex items-start gap-2"
            >
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                  This number is blacklisted
                </p>
                <p className="text-xs text-red-600 dark:text-red-400/80">
                  Reason: {blacklistWarning.reason}
                </p>
              </div>
            </motion.div>
          )}

          <FormField label="Purpose of Visit">
            <input
              value={form.purpose}
              onChange={(e) => setForm({ ...form, purpose: e.target.value })}
              placeholder="Meeting, delivery, etc."
              className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="ID Proof Number (Optional)">
              <input
                value={form.idProofNumber}
                onChange={(e) =>
                  setForm({ ...form, idProofNumber: e.target.value })
                }
                placeholder="Aadhar, DL, etc."
                className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
              />
            </FormField>
            <FormField label="Vehicle Number (Optional)">
              <input
                value={form.vehicleNumber}
                onChange={(e) =>
                  setForm({ ...form, vehicleNumber: e.target.value })
                }
                placeholder="DL01AB1234"
                className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
              />
            </FormField>
          </div>

          <FormField label="Visitor Photo (Optional)">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onloadend = () =>
                  setForm((f) => ({ ...f, photo: reader.result }));
                reader.readAsDataURL(file);
              }}
              className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm dark:text-white file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-primary-100 dark:file:bg-primary-500/20 file:text-primary-700 dark:file:text-primary-400 file:text-xs file:font-medium"
            />
            {form.photo && (
              <img
                src={form.photo}
                alt="preview"
                className="mt-2 w-20 h-20 object-cover rounded-xl"
              />
            )}
          </FormField>

          <FormField label="Category">
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
              <select
                required
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 dark:text-white"
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </FormField>

          <AnimatePresence mode="wait">
            {isDeliveryCategory && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-1"
              >
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Courier Company">
                    <input
                      value={form.courierCompany}
                      onChange={(e) =>
                        setForm({ ...form, courierCompany: e.target.value })
                      }
                      placeholder="Amazon, Zomato..."
                      className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                    />
                  </FormField>
                  <FormField label="Package Count">
                    <input
                      type="number"
                      min="1"
                      value={form.packageCount}
                      onChange={(e) =>
                        setForm({ ...form, packageCount: e.target.value })
                      }
                      className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                    />
                  </FormField>
                </div>
                <FormField label="Delivery Mode">
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { val: "hand_to_resident", label: "Hand to Resident" },
                      { val: "leave_at_gate", label: "Leave at Gate" },
                    ].map((m) => (
                      <button
                        key={m.val}
                        type="button"
                        onClick={() =>
                          setForm({ ...form, deliveryMode: m.val })
                        }
                        className={`py-2 rounded-xl text-xs font-medium transition ${
                          form.deliveryMode === m.val
                            ? "bg-primary-100 dark:bg-primary-500/20 text-primary-700 dark:text-primary-400 border border-primary-300 dark:border-primary-500/40"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-transparent"
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                  {form.deliveryMode === "leave_at_gate" && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                      No resident approval needed — they'll just be notified.
                    </p>
                  )}
                </FormField>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Tower">
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                <select
                  required
                  value={form.tower}
                  onChange={(e) => handleTowerChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 dark:text-white"
                >
                  <option value="">Select tower</option>
                  {towers.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </FormField>
            <FormField label="Flat">
              <select
                required
                value={form.flat}
                onChange={(e) => setForm({ ...form, flat: e.target.value })}
                disabled={!form.tower}
                className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 dark:text-white disabled:opacity-50"
              >
                <option value="">Select flat</option>
                {flats.map((f) => (
                  <option key={f._id} value={f._id}>
                    {f.flatNumber} ({f.primaryResident?.name})
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <Button type="submit" disabled={submitting} className="w-full mt-4">
            <span className="flex items-center justify-center gap-2">
              <UserPlus className="w-4 h-4" />{" "}
              {submitting ? "Sending..." : "Register & Notify Resident"}
            </span>
          </Button>
        </form>
      </div>

      {pendingVisitor && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-5 mt-4"
        >
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-3">
            Latest Registration
          </p>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-800 dark:text-white">
                {pendingVisitor.name}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {pendingVisitor.flat?.flatNumber} •{" "}
                {pendingVisitor.category?.name}
              </p>
            </div>
            <StatusBadge status={pendingVisitor.status} />
          </div>

          {pendingVisitor.status === "approved" && (
            <div className="flex gap-2 mt-4">
              <Button
                variant="success"
                className="flex-1"
                onClick={handleCheckIn}
              >
                Manual Check-In
              </Button>
            </div>
          )}
          {pendingVisitor.status === "approved" && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-center">
              Or ask the visitor to show their QR pass at the gate scanner
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    pending: {
      icon: Loader2,
      cls: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
      label: "Awaiting resident",
      spin: true,
    },
    approved: {
      icon: CheckCircle2,
      cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
      label: "Approved",
    },
    rejected: {
      icon: XCircle,
      cls: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",
      label: "Rejected",
    },
    checked_in: {
      icon: CheckCircle2,
      cls: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
      label: "Inside",
    },
  };
  const s = map[status] || map.pending;
  const Icon = s.icon;
  return (
    <span
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${s.cls}`}
    >
      <Icon className={`w-3.5 h-3.5 ${s.spin ? "animate-spin" : ""}`} />{" "}
      {s.label}
    </span>
  );
}
