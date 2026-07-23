import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, X, Phone, Tag, Clock, QrCode } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../lib/axios";
import { getSocket } from "../../lib/socket";
import Button from "../../components/ui/Button";
import QRModal from "../../components/ui/QRModal";
import EmptyState from "../../components/ui/EmptyState";
import PageHeader from "../../components/ui/PageHeader";

export default function Requests() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [qrModal, setQrModal] = useState(null); // { visitorId, visitorName }

  const fetchPending = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/visitors/requests", {
        params: { status: "pending" },
      });
      setPending(data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const handleNew = (visitor) => {
      setPending((prev) => [visitor, ...prev]);
      toast(`${visitor.name} is at the gate — ${visitor.category?.name}`, {
        icon: "🔔",
      });
    };
    const handleAutoApproved = (visitor) => {
      toast.success(
        `${visitor.name} auto-approved (${visitor.category?.name})`,
      );
    };
    socket.on("visitor:new_request", handleNew);
    const handleLeftAtGate = (visitor) => {
      toast(
        `📦 ${visitor.courierCompany || "Delivery"} left ${visitor.packageCount} package(s) at the gate`,
        {
          icon: "📦",
          duration: 6000,
        },
      );
    };

    socket.on("visitor:delivery_left_at_gate", handleLeftAtGate);
    socket.on("visitor:auto_approved", handleAutoApproved);
    return () => {
      socket.off("visitor:new_request", handleNew);
      socket.off("visitor:auto_approved", handleAutoApproved);
      socket.off("visitor:delivery_left_at_gate", handleLeftAtGate);
    };
  }, []);

  const respond = async (visitor, decision) => {
    setProcessingId(visitor._id);
    try {
      const { data } = await api.patch(`/visitors/${visitor._id}/respond`, {
        decision,
      });
      setPending((prev) => prev.filter((v) => v._id !== visitor._id));
      if (decision === "approved") {
        toast.success(`${visitor.name} approved`);
        setQrModal({ visitorId: data.data._id, visitorName: visitor.name });
      } else {
        toast.success(`${visitor.name} rejected`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Visitor Requests"
        subtitle="Real-time approvals for people at the gate"
      />

      {loading ? (
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-2xl bg-slate-200/60 dark:bg-slate-800/60 animate-pulse"
            />
          ))}
        </div>
      ) : !pending.length ? (
        <EmptyState
          icon={Bell}
          title="No pending requests"
          description="We'll notify you instantly when someone arrives."
        />
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {pending.map((v) => (
              <motion.div
                key={v._id}
                initial={{ opacity: 0, scale: 0.96, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{
                  opacity: 0,
                  scale: 0.95,
                  height: 0,
                  marginBottom: 0,
                  padding: 0,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="glass rounded-2xl p-5 border-2 border-primary-200 dark:border-primary-500/30"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={{ scale: [1, 1.08, 1] }}
                      transition={{ repeat: Infinity, duration: 1.6 }}
                      className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg"
                    >
                      {v.name[0].toUpperCase()}
                    </motion.div>
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-white">
                        {v.name}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Tag className="w-3 h-3" /> {v.category?.name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {v.phone}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <Clock className="w-3 h-3" />{" "}
                    {new Date(v.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                {v.purpose && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-3 pl-15">
                    Purpose: {v.purpose}
                  </p>
                )}
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="success"
                    className="flex-1"
                    disabled={processingId === v._id}
                    onClick={() => respond(v, "approved")}
                  >
                    <span className="flex items-center justify-center gap-1.5">
                      <Check className="w-4 h-4" /> Approve
                    </span>
                  </Button>
                  <Button
                    variant="danger"
                    className="flex-1"
                    disabled={processingId === v._id}
                    onClick={() => respond(v, "rejected")}
                  >
                    <span className="flex items-center justify-center gap-1.5">
                      <X className="w-4 h-4" /> Reject
                    </span>
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <QRModal
        open={!!qrModal}
        onClose={() => setQrModal(null)}
        visitorId={qrModal?.visitorId}
        visitorName={qrModal?.visitorName}
      />
    </div>
  );
}
