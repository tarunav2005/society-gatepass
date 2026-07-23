import { useEffect, useState } from "react";
import { Plus, ShieldAlert, Trash2, Download } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../lib/axios";
import DataTable from "../../components/ui/DataTable";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import FormField from "../../components/ui/FormField";
import PageHeader from "../../components/ui/PageHeader";

export default function Blacklist() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ phone: "", name: "", reason: "" });
  const [saving, setSaving] = useState(false);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/blacklist");
      setEntries(data.data);
    } catch {
      toast.error("Failed to load blacklist");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/blacklist", form);
      toast.success("Added to blacklist");
      setModalOpen(false);
      setForm({ phone: "", name: "", reason: "" });
      fetchEntries();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add");
    } finally {
      setSaving(false);
    }
  };

  const exportBlacklist = () => {
    const token = localStorage.getItem("accessToken");
    const url = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/reports/blacklist/excel`;
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.blob())
      .then((blob) => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "blacklist-report.xlsx";
        link.click();
      });
  };

  const handleDelete = async (id) => {
    if (!confirm("Remove this number from the blacklist?")) return;
    try {
      await api.delete(`/blacklist/${id}`);
      toast.success("Removed from blacklist");
      fetchEntries();
    } catch {
      toast.error("Failed to remove");
    }
  };

  const columns = [
    {
      key: "phone",
      header: "Phone",
      render: (r) => (
        <span className="flex items-center gap-2 font-medium text-slate-800 dark:text-white">
          <ShieldAlert className="w-4 h-4 text-red-500" /> {r.phone}
        </span>
      ),
    },
    { key: "name", header: "Name", render: (r) => r.name || "—" },
    { key: "reason", header: "Reason" },
    { key: "addedBy", header: "Added By", render: (r) => r.addedBy?.name },
    {
      key: "actions",
      header: "",
      render: (r) => (
        <button
          onClick={() => handleDelete(r._id)}
          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Blacklist"
        subtitle="Flagged visitors — guards get warned on registration"
        actions={
          <>
            <Button variant="ghost" onClick={exportBlacklist}>
              <span className="flex items-center gap-1.5">
                <Download className="w-4 h-4" /> Export
              </span>
            </Button>
            <Button onClick={() => setModalOpen(true)}>
              <span className="flex items-center gap-1.5">
                <Plus className="w-4 h-4" /> Add Entry
              </span>
            </Button>
          </>
        }
      />

      <DataTable
        columns={columns}
        data={entries}
        loading={loading}
        emptyMessage="No blacklisted numbers"
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Blacklist a Number"
      >
        <form onSubmit={handleSubmit}>
          <FormField label="Phone Number">
            <input
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="9876543210"
              className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
            />
          </FormField>
          <FormField label="Name (optional)">
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
            />
          </FormField>
          <FormField label="Reason">
            <textarea
              required
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white resize-none"
            />
          </FormField>
          <Button
            type="submit"
            variant="danger"
            disabled={saving}
            className="w-full"
          >
            {saving ? "Adding..." : "Add to Blacklist"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
