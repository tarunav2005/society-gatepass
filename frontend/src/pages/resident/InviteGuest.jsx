import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { UserPlus, Tag, Share2 } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../lib/axios";
import Button from "../../components/ui/Button";
import FormField from "../../components/ui/FormField";
import QRModal from "../../components/ui/QRModal";
import PageHeader from "../../components/ui/PageHeader";

export default function InviteGuest() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    purpose: "",
    category: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [qrModal, setQrModal] = useState(null);

  useEffect(() => {
    api
      .get("/visitor-categories")
      .then(({ data }) => setCategories(data.data.filter((c) => c.isActive)));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await api.post("/visitors/invite", form);
      toast.success(`${form.name} pre-approved! Share the QR pass with them.`);
      setQrModal({ visitorId: data.data._id, visitorName: data.data.name });
      setForm({ name: "", phone: "", purpose: "", category: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to invite guest");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl">
      <PageHeader
        title="Invite a Guest"
        subtitle="Pre-approve a visitor and share their gate pass in advance"
      />

      <div className="glass rounded-2xl p-6">
        <form onSubmit={handleSubmit}>
          <FormField label="Guest Name">
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Rahul Sharma"
              className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
            />
          </FormField>
          <FormField label="Phone">
            <input
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="9876543210"
              className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
            />
          </FormField>
          <FormField label="Purpose">
            <input
              value={form.purpose}
              onChange={(e) => setForm({ ...form, purpose: e.target.value })}
              placeholder="Birthday party, personal visit..."
              className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
            />
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
          <Button type="submit" disabled={submitting} className="w-full mt-2">
            <span className="flex items-center justify-center gap-2">
              <UserPlus className="w-4 h-4" />{" "}
              {submitting ? "Creating..." : "Create Pass"}
            </span>
          </Button>
        </form>
      </div>

      <QRModal
        open={!!qrModal}
        onClose={() => setQrModal(null)}
        visitorId={qrModal?.visitorId}
        visitorName={qrModal?.visitorName}
      />
    </div>
  );
}
