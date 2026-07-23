import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../lib/axios";
import DataTable from "../../components/ui/DataTable";
import PageHeader from "../../components/ui/PageHeader";

const statusColors = {
  pending:
    "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  approved:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  rejected: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",
  checked_in:
    "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  checked_out:
    "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
};

export default function VisitorLog() {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const fetchVisitors = async () => {
    const { data } = await api.get("/visitors/mine");
    setVisitors(data.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchVisitors();
  }, []);

  const handleCheckIn = async (id) => {
    setProcessingId(id);
    try {
      await api.patch(`/visitors/${id}/check-in`);
      toast.success("Checked in");
      fetchVisitors();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to check in");
    } finally {
      setProcessingId(null);
    }
  };

  const handleCheckOut = async (id) => {
    setProcessingId(id);
    try {
      await api.patch(`/visitors/${id}/check-out`);
      toast.success("Checked out");
      fetchVisitors();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to check out");
    } finally {
      setProcessingId(null);
    }
  };

  const columns = [
    {
      key: "name",
      header: "Visitor",
      render: (r) => (
        <span className="font-medium text-slate-800 dark:text-white">
          {r.name}
        </span>
      ),
    },
    { key: "phone", header: "Phone" },
    { key: "category", header: "Category", render: (r) => r.category?.name },
    {
      key: "flat",
      header: "Flat",
      render: (r) => `${r.tower?.name} - ${r.flat?.flatNumber}`,
    },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[r.status]}`}
        >
          {r.status.replace("_", " ")}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Time",
      render: (r) => new Date(r.createdAt).toLocaleTimeString(),
    },
    {
      key: "actions",
      header: "",
      render: (r) => (
        <>
          {r.status === "approved" && (
            <button
              onClick={() => handleCheckIn(r._id)}
              disabled={processingId === r._id}
              className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline disabled:opacity-50"
            >
              {processingId === r._id ? "..." : "Check In"}
            </button>
          )}
          {r.status === "checked_in" && (
            <button
              onClick={() => handleCheckOut(r._id)}
              disabled={processingId === r._id}
              className="text-xs font-medium text-red-600 dark:text-red-400 hover:underline disabled:opacity-50"
            >
              {processingId === r._id ? "..." : "Check Out"}
            </button>
          )}
        </>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Today's Log"
        subtitle={`${visitors.length} visitors registered today`}
      />
      <DataTable
        columns={columns}
        data={visitors}
        loading={loading}
        emptyMessage="No visitors registered today yet"
      />
    </div>
  );
}
