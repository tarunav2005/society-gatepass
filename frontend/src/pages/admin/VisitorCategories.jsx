import { useEffect, useState } from "react";
import { Plus, Tags, Trash2, Edit } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../lib/axios";
import DataTable from "../../components/ui/DataTable";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import FormField from "../../components/ui/FormField";
import PageHeader from "../../components/ui/PageHeader";

export default function VisitorCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: "",
    requiresApproval: true,
    isDelivery: false,
    defaultValidityMinutes: 120,
  });
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/visitor-categories");
      setCategories(data.data);
    } catch {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({
      name: "",
      requiresApproval: true,
      isDelivery: false,
      defaultValidityMinutes: 120,
    });
    setModalOpen(true);
  };

  const openEdit = (cat) => {
    setEditing(cat);
    setForm({
      name: cat.name,
      requiresApproval: cat.requiresApproval,
      isDelivery: cat.isDelivery,
      defaultValidityMinutes: cat.defaultValidityMinutes,
    });
    setModalOpen(true);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.patch(`/visitor-categories/${editing._id}`, form);
        toast.success("Category updated");
      } else {
        await api.post("/visitor-categories", form);
        toast.success("Category created");
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this category?")) return;
    try {
      await api.delete(`/visitor-categories/${id}`);
      toast.success("Category deleted");
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete");
    }
  };

  const columns = [
    {
      key: "name",
      header: "Category",
      render: (r) => (
        <span className="flex items-center gap-2 font-medium text-slate-800 dark:text-white">
          <Tags className="w-4 h-4 text-primary-500" /> {r.name}
        </span>
      ),
    },
    {
      key: "requiresApproval",
      header: "Needs Approval",
      render: (r) => (
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
            r.requiresApproval
              ? "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
              : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
          }`}
        >
          {r.requiresApproval ? "Yes" : "No"}
        </span>
      ),
    },
    {
      key: "isDelivery",
      header: "Delivery",
      render: (r) => (
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
            r.isDelivery
              ? "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400"
              : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
          }`}
        >
          {r.isDelivery ? "Yes" : "No"}
        </span>
      ),
    },
    { key: "defaultValidityMinutes", header: "Validity (min)" },
    {
      key: "actions",
      header: "",
      render: (r) => (
        <div className="flex gap-2">
          <button
            onClick={() => openEdit(r)}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(r._id)}
            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Visitor Categories"
        subtitle="Guest, Delivery, Cab, Vendor, etc."
        actions={
          <Button onClick={openCreate}>
            <span className="flex items-center gap-1.5">
              <Plus className="w-4 h-4" /> Add Category
            </span>
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={categories}
        loading={loading}
        emptyMessage="No categories yet"
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Category" : "Add Category"}
      >
        <form onSubmit={handleSubmit}>
          <FormField label="Category Name">
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Guest"
              className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
            />
          </FormField>
          <FormField label="Default Validity (minutes)">
            <input
              required
              type="number"
              min="1"
              value={form.defaultValidityMinutes}
              onChange={(e) =>
                setForm({ ...form, defaultValidityMinutes: e.target.value })
              }
              className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
            />
          </FormField>
          <label className="flex items-center gap-2 mb-4 text-sm text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={form.requiresApproval}
              onChange={(e) =>
                setForm({ ...form, requiresApproval: e.target.checked })
              }
              className="rounded"
            />
            Requires resident approval
          </label>
          <label className="flex items-center gap-2 mb-4 text-sm text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={form.isDelivery}
              onChange={(e) =>
                setForm({ ...form, isDelivery: e.target.checked })
              }
              className="rounded"
            />
            This is a delivery category (shows courier/package fields to guard)
          </label>
          <Button type="submit" disabled={saving} className="w-full">
            {saving
              ? "Saving..."
              : editing
                ? "Update Category"
                : "Create Category"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
