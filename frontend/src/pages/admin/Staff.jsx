import { useEffect, useState } from "react";
import {
  Plus,
  UserCog,
  Trash2,
  Edit,
  QrCode,
  Power,
  FileSpreadsheet,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../lib/axios";
import DataTable from "../../components/ui/DataTable";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import FormField from "../../components/ui/FormField";
import PageHeader from "../../components/ui/PageHeader";

const roleOptions = ["maid", "cook", "driver", "gardener", "cleaner", "other"];

export default function Staff() {
  const [staff, setStaff] = useState([]);
  const [towers, setTowers] = useState([]);
  const [flatsByTower, setFlatsByTower] = useState({});
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    role: "maid",
    assignedFlats: [],
    workingHours: { start: "08:00", end: "20:00" },
    allowedDays: [],
  });
  const [saving, setSaving] = useState(false);
  const [qrModal, setQrModal] = useState(null);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/staff");
      setStaff(data.data);
    } catch {
      toast.error("Failed to load staff");
    } finally {
      setLoading(false);
    }
  };

  const fetchTowersAndFlats = async () => {
    const { data: towersRes } = await api.get("/towers");
    setTowers(towersRes.data);
    const flatsMap = {};
    for (const t of towersRes.data) {
      const { data: flatsRes } = await api.get("/flats", {
        params: { tower: t._id },
      });
      flatsMap[t._id] = flatsRes.data;
    }
    setFlatsByTower(flatsMap);
  };

  useEffect(() => {
    fetchStaff();
    fetchTowersAndFlats();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({
      name: "",
      phone: "",
      role: "maid",
      assignedFlats: [],
      workingHours: { start: "08:00", end: "20:00" },
      allowedDays: [],
    });
    setModalOpen(true);
  };

  const toggleDay = (day) => {
    setForm((f) => ({
      ...f,
      allowedDays: f.allowedDays.includes(day)
        ? f.allowedDays.filter((d) => d !== day)
        : [...f.allowedDays, day],
    }));
  };

  const openEdit = (s) => {
    setEditing(s);
    setForm({
      name: s.name,
      phone: s.phone,
      role: s.role,
      assignedFlats: s.assignedFlats.map((f) => f._id),
      workingHours: s.workingHours || { start: "08:00", end: "20:00" },
      allowedDays: s.allowedDays || [],
    });
    setModalOpen(true);
  };

  const toggleFlat = (flatId) => {
    setForm((f) => ({
      ...f,
      assignedFlats: f.assignedFlats.includes(flatId)
        ? f.assignedFlats.filter((id) => id !== flatId)
        : [...f.assignedFlats, flatId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.patch(`/staff/${editing._id}`, form);
        toast.success("Staff updated");
      } else {
        await api.post("/staff", form);
        toast.success("Staff added & QR generated");
      }
      setModalOpen(false);
      fetchStaff();
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const exportAttendance = () => {
    const token = localStorage.getItem("accessToken");
    const url = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/reports/staff-attendance/excel`;
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.blob())
      .then((blob) => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "staff-attendance.xlsx";
        link.click();
      });
  };

  const handleToggleActive = async (id) => {
    try {
      await api.patch(`/staff/${id}/toggle-active`);
      fetchStaff();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id) => {
    if (
      !confirm(
        "Delete this staff member? Their attendance history will also be removed.",
      )
    )
      return;
    try {
      await api.delete(`/staff/${id}`);
      toast.success("Staff deleted");
      fetchStaff();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const viewQR = async (s) => {
    try {
      const { data } = await api.get(`/staff/${s._id}/qr`);
      setQrModal({ name: s.name, image: data.data.qrImage });
    } catch {
      toast.error("Failed to load QR");
    }
  };

  const columns = [
    {
      key: "name",
      header: "Name",
      render: (r) => (
        <span className="flex items-center gap-2 font-medium text-slate-800 dark:text-white">
          <UserCog className="w-4 h-4 text-primary-500" /> {r.name}
        </span>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (r) => <span className="capitalize">{r.role}</span>,
    },
    { key: "phone", header: "Phone" },
    {
      key: "assignedFlats",
      header: "Assigned Flats",
      render: (r) => (
        <div className="flex flex-wrap gap-1">
          {r.assignedFlats.length ? (
            r.assignedFlats.map((f) => (
              <span
                key={f._id}
                className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-xs"
              >
                {f.tower?.name} - {f.flatNumber}
              </span>
            ))
          ) : (
            <span className="text-slate-400 text-xs">None</span>
          )}
        </div>
      ),
    },
    {
      key: "isActive",
      header: "Status",
      render: (r) => (
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
            r.isActive
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
              : "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400"
          }`}
        >
          {r.isActive ? "Active" : "Revoked"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (r) => (
        <div className="flex gap-2">
          <button
            onClick={() => viewQR(r)}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-primary-500"
            title="View QR"
          >
            <QrCode className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleToggleActive(r._id)}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-amber-500"
            title="Toggle Active"
          >
            <Power className="w-4 h-4" />
          </button>
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
        title="Staff / Maids"
        subtitle="Manage recurring staff with permanent gate passes"
        actions={
          <>
            <Button variant="ghost" onClick={exportAttendance}>
              <span className="flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4" /> Export Attendance
              </span>
            </Button>
            <Button onClick={openCreate}>
              <span className="flex items-center gap-1.5">
                <Plus className="w-4 h-4" /> Add Staff
              </span>
            </Button>
          </>
        }
      />

      <DataTable
        columns={columns}
        data={staff}
        loading={loading}
        emptyMessage="No staff added yet"
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Staff" : "Add Staff"}
      >
        <form onSubmit={handleSubmit}>
          <FormField label="Name">
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Sunita Devi"
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
          <FormField label="Role">
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 dark:text-white capitalize"
            >
              {roleOptions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Assigned Flats">
            <div className="max-h-40 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-xl p-3 space-y-2">
              {towers.map((t) => (
                <div key={t._id}>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    {t.name}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {(flatsByTower[t._id] || []).map((f) => (
                      <button
                        key={f._id}
                        type="button"
                        onClick={() => toggleFlat(f._id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                          form.assignedFlats.includes(f._id)
                            ? "bg-primary-600 text-white"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        {f.flatNumber}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <FormField label="Working Hours">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="time"
                  value={form.workingHours.start}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      workingHours: {
                        ...form.workingHours,
                        start: e.target.value,
                      },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 dark:text-white"
                />
                <input
                  type="time"
                  value={form.workingHours.end}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      workingHours: {
                        ...form.workingHours,
                        end: e.target.value,
                      },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 dark:text-white"
                />
              </div>
            </FormField>

            <FormField label="Allowed Days (leave empty for all days)">
              <div className="flex flex-wrap gap-1.5">
                {["mon", "tue", "wed", "thu", "fri", "sat", "sun"].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDay(d)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition ${
                      form.allowedDays.includes(d)
                        ? "bg-primary-600 text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </FormField>
          </FormField>
          <Button type="submit" disabled={saving} className="w-full mt-2">
            {saving
              ? "Saving..."
              : editing
                ? "Update Staff"
                : "Create Staff & Generate QR"}
          </Button>
        </form>
      </Modal>

      <Modal
        open={!!qrModal}
        onClose={() => setQrModal(null)}
        title={`Gate Pass — ${qrModal?.name}`}
      >
        <div className="text-center">
          {qrModal && (
            <>
              <img
                src={qrModal.image}
                alt="Staff QR"
                className="mx-auto rounded-xl border border-slate-200 dark:border-slate-700"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">
                This is a permanent pass — print or share with the staff member
              </p>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
