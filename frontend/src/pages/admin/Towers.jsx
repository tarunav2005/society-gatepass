import { useEffect, useState } from "react";
import { Plus, Building2, Trash2, Edit } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../lib/axios";
import DataTable from "../../components/ui/DataTable";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import FormField from "../../components/ui/FormField";
import PageHeader from "../../components/ui/PageHeader";

export default function Towers() {
  const [towers, setTowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: "",
    totalFloors: "",
    flatsPerFloor: "",
  });
  const [saving, setSaving] = useState(false);

  const fetchTowers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/towers");
      setTowers(data.data);
    } catch {
      toast.error("Failed to load towers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTowers();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", totalFloors: "", flatsPerFloor: "" });
    setModalOpen(true);
  };

  const openEdit = (tower) => {
    setEditing(tower);
    setForm({
      name: tower.name,
      totalFloors: tower.totalFloors,
      flatsPerFloor: tower.flatsPerFloor,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.patch(`/towers/${editing._id}`, form);
        toast.success("Tower updated");
      } else {
        await api.post("/towers", form);
        toast.success("Tower created");
      }
      setModalOpen(false);
      fetchTowers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this tower? This cannot be undone.")) return;
    try {
      await api.delete(`/towers/${id}`);
      toast.success("Tower deleted");
      fetchTowers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete");
    }
  };

  const columns = [
    {
      key: "name",
      header: "Tower Name",
      render: (r) => (
        <span className="flex items-center gap-2 font-medium text-slate-800 dark:text-white">
          <Building2 className="w-4 h-4 text-primary-500" /> {r.name}
        </span>
      ),
    },
    { key: "totalFloors", header: "Floors" },
    { key: "flatsPerFloor", header: "Flats / Floor" },
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
        title="Towers"
        subtitle="Manage society towers/blocks"
        actions={
          <Button onClick={openCreate}>
            <span className="flex items-center gap-1.5">
              <Plus className="w-4 h-4" /> Add Tower
            </span>
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={towers}
        loading={loading}
        emptyMessage="No towers added yet"
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Tower" : "Add Tower"}
      >
        <form onSubmit={handleSubmit}>
          <FormField label="Tower Name">
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Tower A"
              className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
            />
          </FormField>
          <FormField label="Total Floors">
            <input
              required
              type="number"
              min="1"
              value={form.totalFloors}
              onChange={(e) =>
                setForm({ ...form, totalFloors: e.target.value })
              }
              className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
            />
          </FormField>
          <FormField label="Flats Per Floor">
            <input
              required
              type="number"
              min="1"
              value={form.flatsPerFloor}
              onChange={(e) =>
                setForm({ ...form, flatsPerFloor: e.target.value })
              }
              className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
            />
          </FormField>
          <Button type="submit" disabled={saving} className="w-full mt-2">
            {saving ? "Saving..." : editing ? "Update Tower" : "Create Tower"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
