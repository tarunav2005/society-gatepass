import { useState } from "react";
import { Save, Phone } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../lib/axios";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/ui/Button";
import FormField from "../../components/ui/FormField";
import PageHeader from "../../components/ui/PageHeader";

export default function Profile() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: user?.emergencyContact?.name || "",
    phone: user?.emergencyContact?.phone || "",
    relation: user?.emergencyContact?.relation || "",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch("/auth/profile", { emergencyContact: form });
      toast.success("Emergency contact saved");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg">
      <PageHeader
        title="Profile Settings"
        subtitle="Emergency contact shown to security in urgent situations"
      />

      <div className="glass rounded-2xl p-6">
        <form onSubmit={handleSubmit}>
          <FormField label="Contact Name">
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
            />
          </FormField>
          <FormField label="Contact Phone">
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
              />
            </div>
          </FormField>
          <FormField label="Relation">
            <input
              value={form.relation}
              onChange={(e) => setForm({ ...form, relation: e.target.value })}
              placeholder="Spouse, Parent, Sibling..."
              className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
            />
          </FormField>
          <Button type="submit" disabled={saving} className="w-full mt-2">
            <span className="flex items-center justify-center gap-2">
              <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save"}
            </span>
          </Button>
        </form>
      </div>
    </div>
  );
}
