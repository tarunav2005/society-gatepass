import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Mail, Phone, Shield, Home, UserCheck } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../lib/axios";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import FormField from "../../components/ui/FormField";
import EmptyState from "../../components/ui/EmptyState";
import PageHeader from "../../components/ui/PageHeader";

export default function PendingApprovals() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approveModal, setApproveModal] = useState(null);
  const [towers, setTowers] = useState([]);
  const [vacantFlats, setVacantFlats] = useState([]);
  const [selectedTower, setSelectedTower] = useState("");
  const [selectedFlat, setSelectedFlat] = useState("");
  const [processing, setProcessing] = useState(false);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/users/pending");
      setUsers(data.data);
    } catch {
      toast.error("Failed to load pending users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const openApprove = async (user) => {
    setApproveModal(user);
    setSelectedTower("");
    setSelectedFlat("");
    if (user.role === "resident") {
      const { data } = await api.get("/towers");
      setTowers(data.data);
    }
  };

  const handleTowerChange = async (towerId) => {
    setSelectedTower(towerId);
    setSelectedFlat("");
    const { data } = await api.get("/flats/vacant");
    setVacantFlats(data.data.filter((f) => f.tower._id === towerId));
  };

  const confirmApprove = async () => {
    if (approveModal.role === "resident" && (!selectedTower || !selectedFlat)) {
      toast.error("Select tower and flat for the resident");
      return;
    }
    setProcessing(true);
    try {
      await api.patch(`/users/${approveModal._id}/approve`, {
        tower: selectedTower,
        flat: selectedFlat,
      });
      toast.success(`${approveModal.name} approved`);
      setApproveModal(null);
      fetchPending();
    } catch (err) {
      toast.error(err.response?.data?.message || "Approval failed");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (user) => {
    if (!confirm(`Reject ${user.name}'s registration?`)) return;
    try {
      await api.patch(`/users/${user._id}/reject`);
      toast.success("User rejected");
      fetchPending();
    } catch {
      toast.error("Failed to reject");
    }
  };

  return (
    <div>
      <PageHeader
        title="Pending Approvals"
        subtitle={`${users.length} account${users.length !== 1 ? "s" : ""} awaiting review`}
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-32 rounded-2xl bg-slate-200/60 dark:bg-slate-800/60 animate-pulse"
            />
          ))}
        </div>
      ) : !users.length ? (
        <EmptyState
          icon={UserCheck}
          title="No pending approvals"
          description="All caught up! New signups will appear here."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {users.map((u) => (
              <motion.div
                key={u._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass rounded-2xl p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                      {u.name[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-white">
                        {u.name}
                      </p>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                          u.role === "resident"
                            ? "bg-primary-100 text-primary-700 dark:bg-primary-500/10 dark:text-primary-400"
                            : "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400"
                        }`}
                      >
                        {u.role}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 mb-4 text-sm text-slate-600 dark:text-slate-400">
                  <p className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5" /> {u.email}
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5" /> {u.phone}
                  </p>
                  {u.role === "guard" && u.shift && (
                    <p className="flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5" /> {u.shift} shift
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="success"
                    className="flex-1"
                    onClick={() => openApprove(u)}
                  >
                    <span className="flex items-center justify-center gap-1.5">
                      <Check className="w-4 h-4" /> Approve
                    </span>
                  </Button>
                  <Button
                    variant="danger"
                    className="flex-1"
                    onClick={() => handleReject(u)}
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

      <Modal
        open={!!approveModal}
        onClose={() => setApproveModal(null)}
        title={`Approve ${approveModal?.name || ""}`}
      >
        {approveModal?.role === "resident" ? (
          <>
            <FormField label="Tower">
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
            </FormField>
            <FormField label="Flat">
              <select
                value={selectedFlat}
                onChange={(e) => setSelectedFlat(e.target.value)}
                disabled={!selectedTower}
                className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 dark:text-white disabled:opacity-50"
              >
                <option value="">Select flat</option>
                {vacantFlats.map((f) => (
                  <option key={f._id} value={f._id}>
                    {f.flatNumber}
                  </option>
                ))}
              </select>
            </FormField>
            {selectedTower && !vacantFlats.length && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mb-3 flex items-center gap-1">
                <Home className="w-3.5 h-3.5" /> No vacant flats in this tower
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            This will approve {approveModal?.name} as a security guard.
          </p>
        )}
        <Button
          variant="success"
          className="w-full"
          disabled={processing}
          onClick={confirmApprove}
        >
          {processing ? "Approving..." : "Confirm Approval"}
        </Button>
      </Modal>
    </div>
  );
}
