import { useEffect, useState } from "react";
import { Plus, Home, Trash2, Edit } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../lib/axios";
import DataTable from "../../components/ui/DataTable";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import FormField from "../../components/ui/FormField";
import PageHeader from "../../components/ui/PageHeader";

export default function Flats() {
  const [flats, setFlats] = useState([]);
  const [towers, setTowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ tower: "", flatNumber: "", floor: "" });
  const [saving, setSaving] = useState(false);
  const [filterTower, setFilterTower] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [flatsRes, towersRes] = await Promise.all([
        api.get("/flats", {
          params: filterTower ? { tower: filterTower } : {},
        }),
        api.get("/towers"),
      ]);
      setFlats(flatsRes.data.data);
      setTowers(towersRes.data.data);
    } catch {
      toast.error("Failed to load flats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterTower]);

  const openCreate = () => {
    setEditing(null);
    setForm({ tower: towers[0]?._id || "", flatNumber: "", floor: "" });
    setModalOpen(true);
  };

  const openEdit = (flat) => {
    setEditing(flat);
    setForm({
      tower: flat.tower._id,
      flatNumber: flat.flatNumber,
      floor: flat.floor,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.patch(`/flats/${editing._id}`, form);
        toast.success("Flat updated");
      } else {
        await api.post("/flats", form);
        toast.success("Flat created");
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this flat?")) return;
    try {
      await api.delete(`/flats/${id}`);
      toast.success("Flat deleted");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete");
    }
  };

  const columns = [
    {
      key: "flatNumber",
      header: "Flat No.",
      render: (r) => (
        <span className="flex items-center gap-2 font-medium text-slate-800 dark:text-white">
          <Home className="w-4 h-4 text-primary-500" /> {r.flatNumber}
        </span>
      ),
    },
    { key: "tower", header: "Tower", render: (r) => r.tower?.name },
    { key: "floor", header: "Floor" },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
            r.status === "occupied"
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
          }`}
        >
          {r.status}
        </span>
      ),
    },
    {
      key: "primaryResident",
      header: "Resident",
      render: (r) => r.primaryResident?.name || "—",
    },
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
        title="Flats"
        subtitle="Manage flats across towers"
        actions={
          <Button onClick={openCreate} disabled={!towers.length}>
            <span className="flex items-center gap-1.5">
              <Plus className="w-4 h-4" /> Add Flat
            </span>
          </Button>
        }
      />

      <div className="mb-4">
        <select
          value={filterTower}
          onChange={(e) => setFilterTower(e.target.value)}
          className="px-4 py-2 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm dark:text-white"
        >
          <option value="">All Towers</option>
          {towers.map((t) => (
            <option key={t._id} value={t._id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      {!towers.length && !loading && (
        <div className="glass rounded-2xl p-6 mb-4 text-amber-600 dark:text-amber-400 text-sm">
          Create a tower first before adding flats.
        </div>
      )}

      <DataTable
        columns={columns}
        data={flats}
        loading={loading}
        emptyMessage="No flats added yet"
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Flat" : "Add Flat"}
      >
        <form onSubmit={handleSubmit}>
          <FormField label="Tower">
            <select
              required
              value={form.tower}
              onChange={(e) => setForm({ ...form, tower: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 dark:text-white"
            >
              {towers.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Flat Number">
            <input
              required
              value={form.flatNumber}
              onChange={(e) => setForm({ ...form, flatNumber: e.target.value })}
              placeholder="101"
              className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
            />
          </FormField>
          <FormField label="Floor">
            <input
              required
              type="number"
              min="0"
              value={form.floor}
              onChange={(e) => setForm({ ...form, floor: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
            />
          </FormField>
          <Button type="submit" disabled={saving} className="w-full mt-2">
            {saving ? "Saving..." : editing ? "Update Flat" : "Create Flat"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
