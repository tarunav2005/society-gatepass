import { useEffect, useState } from "react";
import { Package, Home, Phone, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import api from "../../lib/axios";
import Button from "../../components/ui/Button";
import PageHeader from "../../components/ui/PageHeader";

export default function PendingDeliveries() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const fetchDeliveries = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/visitors/deliveries/pending");
      setDeliveries(data.data);
    } catch {
      toast.error("Failed to load deliveries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const markPickedUp = async (id) => {
    setProcessingId(id);
    try {
      await api.patch(`/visitors/${id}/pickup`);
      setDeliveries((prev) => prev.filter((d) => d._id !== id));
      toast.success("Marked as picked up");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Pending Deliveries"
        subtitle={`${deliveries.length} package(s) waiting at gate`}
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-32 rounded-2xl bg-slate-200/60 dark:bg-slate-800/60 animate-pulse"
            />
          ))}
        </div>
      ) : !deliveries.length ? (
        <div className="glass rounded-2xl p-12 text-center text-slate-500 dark:text-slate-400">
          No packages waiting at the gate
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {deliveries.map((d) => (
              <motion.div
                key={d._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass rounded-2xl p-5"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-white">
                      {d.courierCompany || "Courier"}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {d.packageCount} package(s)
                    </p>
                  </div>
                </div>
                <div className="space-y-1.5 mb-4 text-sm text-slate-600 dark:text-slate-400">
                  <p className="flex items-center gap-2">
                    <Home className="w-3.5 h-3.5" /> {d.tower?.name} -{" "}
                    {d.flat?.flatNumber}
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5" /> {d.resident?.name} (
                    {d.resident?.phone})
                  </p>
                </div>
                <Button
                  variant="success"
                  className="w-full"
                  disabled={processingId === d._id}
                  onClick={() => markPickedUp(d._id)}
                >
                  <span className="flex items-center justify-center gap-1.5">
                    <Check className="w-4 h-4" /> Mark Picked Up
                  </span>
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
