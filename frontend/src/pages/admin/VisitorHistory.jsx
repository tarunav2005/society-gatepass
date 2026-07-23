import { useEffect, useState } from "react";
import { Search, X, FileSpreadsheet, FileText } from "lucide-react";
import api from "../../lib/axios";
import DataTable from "../../components/ui/DataTable";
import Pagination from "../../components/ui/Pagination";
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
  expired: "bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400",
};

const initialFilters = {
  search: "",
  status: "",
  category: "",
  tower: "",
  visitorType: "",
  startDate: "",
  endDate: "",
};

export default function VisitorHistory() {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(initialFilters);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });
  const [categories, setCategories] = useState([]);
  const [towers, setTowers] = useState([]);

  useEffect(() => {
    (async () => {
      const [catRes, towerRes] = await Promise.all([
        api.get("/visitor-categories"),
        api.get("/towers"),
      ]);
      setCategories(catRes.data.data);
      setTowers(towerRes.data.data);
    })();
  }, []);

  const fetchVisitors = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      Object.entries(filters).forEach(([k, v]) => {
        if (v) params[k] = v;
      });
      const { data } = await api.get("/visitors/admin/all", { params });
      setVisitors(data.data);
      setPagination(data.pagination);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search + immediate filter changes
  useEffect(() => {
    const timer = setTimeout(fetchVisitors, filters.search ? 400 : 0);
    return () => clearTimeout(timer);
  }, [filters, page]);

  const updateFilter = (key, value) => {
    setPage(1);
    setFilters((f) => ({ ...f, [key]: value }));
  };

  const clearFilters = () => {
    setPage(1);
    setFilters(initialFilters);
  };

  const handleExport = (format) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params.append(k, v);
    });
    const token = localStorage.getItem("accessToken");
    const url = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/reports/visitors/${format}?${params.toString()}`;

    // Use fetch to include auth header, then trigger download
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.blob())
      .then((blob) => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `visitor-report.${format === "excel" ? "xlsx" : "pdf"}`;
        link.click();
      });
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const columns = [
    {
      key: "name",
      header: "Visitor",
      render: (r) => (
        <div>
          <p className="font-medium text-slate-800 dark:text-white">{r.name}</p>
          <p className="text-xs text-slate-400">{r.phone}</p>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (r) => (
        <span className="capitalize text-xs">{r.visitorType}</span>
      ),
    },
    { key: "category", header: "Category", render: (r) => r.category?.name },
    {
      key: "location",
      header: "Location",
      render: (r) => `${r.tower?.name} - ${r.flat?.flatNumber}`,
    },
    {
      key: "vehicleNumber",
      header: "Vehicle",
      render: (r) => r.vehicleNumber || "—",
    },
    {
      key: "idProof",
      header: "ID Proof",
      render: (r) => r.idProofNumber || "—",
    },
    {
      key: "photo",
      header: "Photo",
      render: (r) =>
        r.photo ? (
          <img
            src={r.photo}
            alt={r.name}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <span className="text-slate-400 text-xs">—</span>
        ),
    },
    { key: "resident", header: "Resident", render: (r) => r.resident?.name },
    {
      key: "registeredBy",
      header: "Guard",
      render: (r) => r.registeredBy?.name,
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
      header: "Date",
      render: (r) => new Date(r.createdAt).toLocaleString(),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Visitor History"
        subtitle="Full searchable record of all visitor activity"
      />

      <div className="glass rounded-2xl p-4 mb-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
              placeholder="Search by name or phone..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white text-sm"
            />
          </div>
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 text-sm text-red-500 hover:underline shrink-0"
            >
              <X className="w-3.5 h-3.5" /> Clear ({activeFilterCount})
            </button>
          )}

          <button
            onClick={() => handleExport("excel")}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-medium hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition shrink-0"
          >
            <FileSpreadsheet className="w-4 h-4" /> Excel
          </button>
          <button
            onClick={() => handleExport("pdf")}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-100 dark:hover:bg-red-500/20 transition shrink-0"
          >
            <FileText className="w-4 h-4" /> PDF
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          <select
            value={filters.status}
            onChange={(e) => updateFilter("status", e.target.value)}
            className="px-3 py-2 rounded-lg bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs dark:text-white"
          >
            <option value="">All Status</option>
            {[
              "pending",
              "approved",
              "rejected",
              "checked_in",
              "checked_out",
              "expired",
            ].map((s) => (
              <option key={s} value={s} className="capitalize">
                {s.replace("_", " ")}
              </option>
            ))}
          </select>

          <select
            value={filters.visitorType}
            onChange={(e) => updateFilter("visitorType", e.target.value)}
            className="px-3 py-2 rounded-lg bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs dark:text-white"
          >
            <option value="">All Types</option>
            {["guest", "delivery", "cab", "vendor", "staff"].map((t) => (
              <option key={t} value={t} className="capitalize">
                {t}
              </option>
            ))}
          </select>

          <select
            value={filters.category}
            onChange={(e) => updateFilter("category", e.target.value)}
            className="px-3 py-2 rounded-lg bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs dark:text-white"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={filters.tower}
            onChange={(e) => updateFilter("tower", e.target.value)}
            className="px-3 py-2 rounded-lg bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs dark:text-white"
          >
            <option value="">All Towers</option>
            {towers.map((t) => (
              <option key={t._id} value={t._id}>
                {t.name}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => updateFilter("startDate", e.target.value)}
            className="px-3 py-2 rounded-lg bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs dark:text-white"
          />

          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => updateFilter("endDate", e.target.value)}
            className="px-3 py-2 rounded-lg bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs dark:text-white"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={visitors}
        loading={loading}
        emptyMessage="No visitors match your filters"
      />
      <Pagination
        page={page}
        totalPages={pagination.totalPages}
        total={pagination.total}
        onPageChange={setPage}
      />
    </div>
  );
}
