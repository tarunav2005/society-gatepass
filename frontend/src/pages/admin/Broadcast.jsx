import { useState } from "react";
import { Megaphone, Send } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../lib/axios";
import Button from "../../components/ui/Button";
import FormField from "../../components/ui/FormField";
import PageHeader from "../../components/ui/PageHeader";

export default function Broadcast() {
  const [form, setForm] = useState({ title: "", message: "" });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!confirm("Send this announcement to ALL residents?")) return;
    setSending(true);
    try {
      const { data } = await api.post("/notifications/broadcast", form);
      toast.success(data.message);
      setForm({ title: "", message: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-xl">
      <PageHeader
        title="📢 Emergency Broadcast"
        subtitle="Send an announcement to every resident instantly"
      />

      <div className="glass rounded-2xl p-6">
        <form onSubmit={handleSubmit}>
          <FormField label="Title">
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Water Supply Interruption"
              className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
            />
          </FormField>
          <FormField label="Message">
            <textarea
              required
              rows={4}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Water supply will be interrupted from 2 PM to 4 PM today for maintenance..."
              className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white resize-none"
            />
          </FormField>
          <Button
            type="submit"
            variant="danger"
            disabled={sending}
            className="w-full"
          >
            <span className="flex items-center justify-center gap-2">
              <Send className="w-4 h-4" />{" "}
              {sending ? "Sending..." : "Send to All Residents"}
            </span>
          </Button>
        </form>
      </div>
    </div>
  );
}
