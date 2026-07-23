import { useEffect, useState } from "react";
import { AlertTriangle, Phone, User, Search } from "lucide-react";
import api from "../../lib/axios";
import PageHeader from "../../components/ui/PageHeader";

export default function EmergencyLookup() {
  const [towers, setTowers] = useState([]);
  const [flats, setFlats] = useState([]);
  const [selectedTower, setSelectedTower] = useState("");
  const [selectedFlat, setSelectedFlat] = useState("");
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/towers").then(({ data }) => setTowers(data.data));
  }, []);

  const handleTowerChange = async (id) => {
    setSelectedTower(id);
    setSelectedFlat("");
    setInfo(null);
    const { data } = await api.get("/flats", { params: { tower: id } });
    setFlats(data.data.filter((f) => f.status === "occupied"));
  };

  const lookup = async (flatId) => {
    setSelectedFlat(flatId);
    if (!flatId) return setInfo(null);
    setLoading(true);
    try {
      const { data } = await api.get(`/flats/${flatId}/emergency`);
      setInfo(data.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg">
      <PageHeader
        title="🚨 Emergency Lookup"
        subtitle="Quickly find a resident's emergency contact"
      />

      <div className="glass rounded-2xl p-6 space-y-4">
        <select
          value={selectedTower}
          onChange={(e) => handleTowerChange(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 dark:text-white"
        >
          <option value="">Select tower</option>
          {towers.map((t) => (
            <option key={t._id} value={t._id}>
              {t.name}
            </option>
          ))}
        </select>

        <select
          value={selectedFlat}
          onChange={(e) => lookup(e.target.value)}
          disabled={!selectedTower}
          className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 dark:text-white disabled:opacity-50"
        >
          <option value="">Select flat</option>
          {flats.map((f) => (
            <option key={f._id} value={f._id}>
              {f.flatNumber}
            </option>
          ))}
        </select>

        {loading && (
          <div className="h-24 rounded-xl bg-slate-200/60 dark:bg-slate-800/60 animate-pulse" />
        )}

        {info && !loading && (
          <div className="rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 p-4 space-y-3">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                Resident
              </p>
              <p className="flex items-center gap-2 font-medium text-slate-800 dark:text-white">
                <User className="w-4 h-4" /> {info.primaryResident?.name || "—"}
              </p>
              <p className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 mt-1">
                <Phone className="w-3.5 h-3.5" />{" "}
                {info.primaryResident?.phone || "—"}
              </p>
            </div>
            <div className="pt-3 border-t border-red-200 dark:border-red-500/20">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                Emergency Contact
              </p>
              {info.primaryResident?.emergencyContact?.phone ? (
                <>
                  <p className="font-medium text-slate-800 dark:text-white">
                    {info.primaryResident.emergencyContact.name} (
                    {info.primaryResident.emergencyContact.relation})
                  </p>
                  <p className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 font-semibold mt-1">
                    <Phone className="w-3.5 h-3.5" />{" "}
                    {info.primaryResident.emergencyContact.phone}
                  </p>
                </>
              ) : (
                <p className="text-sm text-slate-400">Not set by resident</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
