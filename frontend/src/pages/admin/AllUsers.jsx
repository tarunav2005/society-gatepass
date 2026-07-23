import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../lib/axios";
import DataTable from "../../components/ui/DataTable";
import { Download } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";

export default function AllUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/users");
      setUsers(data.data);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const downloadResidentReport = (userId) => {
    const token = localStorage.getItem("accessToken");
    const url = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/reports/resident/${userId}/excel`;
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.blob())
      .then((blob) => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "resident-report.xlsx";
        link.click();
      });
  };

  const toggleSuspend = async (id) => {
    setProcessingId(id);
    try {
      await api.patch(`/users/${id}/suspend`);
      fetchUsers();
    } catch {
      toast.error("Action failed");
    } finally {
      setProcessingId(null);
    }
  };

  const statusColors = {
    approved:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
    pending:
      "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    rejected: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",
    suspended:
      "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
  };

  const columns = [
    {
      key: "name",
      header: "Name",
      render: (r) => (
        <span className="font-medium text-slate-800 dark:text-white">
          {r.name}
        </span>
      ),
    },
    { key: "email", header: "Email" },
    {
      key: "role",
      header: "Role",
      render: (r) => <span className="capitalize">{r.role}</span>,
    },
    {
      key: "flat",
      header: "Flat",
      render: (r) => (r.flat ? `${r.tower?.name} - ${r.flat.flatNumber}` : "—"),
    },
    {
      key: "emergencyContact",
      header: "Emergency Contact",
      render: (r) =>
        r.emergencyContact?.phone ? (
          <div className="text-xs">
            <p className="text-slate-700 dark:text-slate-300">
              {r.emergencyContact.name} ({r.emergencyContact.relation})
            </p>
            <p className="text-slate-400">{r.emergencyContact.phone}</p>
          </div>
        ) : (
          <span className="text-slate-400 text-xs">Not set</span>
        ),
    },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[r.status]}`}
        >
          {r.status}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (r) => (
        <div className="flex items-center gap-3">
          {r.role === "resident" && (
            <button
              onClick={() => downloadResidentReport(r._id)}
              className="text-slate-400 hover:text-primary-500"
              title="Download report"
            >
              <Download className="w-4 h-4" />
            </button>
          )}
          {r.role !== "admin" && (
            <button
              onClick={() => toggleSuspend(r._id)}
              disabled={processingId === r._id}
              className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline disabled:opacity-50"
            >
              {r.status === "suspended" ? "Reactivate" : "Suspend"}
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="All Users"
        subtitle={`${users.length} total accounts`}
      />
      <DataTable columns={columns} data={users} loading={loading} />
    </div>
  );
}
