import { useEffect, useState } from "react";
import { QrCode, Clock } from "lucide-react";
import Modal from "./Modal";
import api from "../../lib/axios";

export default function QRModal({ visitorId, open, onClose, visitorName }) {
  const [qr, setQr] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open || !visitorId) return;
    setLoading(true);
    setError(null);
    api
      .get(`/visitors/${visitorId}/qr`)
      .then(({ data }) => setQr(data.data))
      .catch((err) =>
        setError(err.response?.data?.message || "Failed to load QR"),
      )
      .finally(() => setLoading(false));
  }, [open, visitorId]);

  return (
    <Modal open={open} onClose={onClose} title={`Gate Pass — ${visitorName}`}>
      <div className="text-center">
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <p className="text-red-500 text-sm py-10">{error}</p>
        ) : (
          <>
            <img
              src={qr.qrImage}
              alt="QR Pass"
              className="mx-auto rounded-xl border border-slate-200 dark:border-slate-700"
            />
            <p className="flex items-center justify-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-4">
              <Clock className="w-3.5 h-3.5" /> Valid until{" "}
              {new Date(qr.expiresAt).toLocaleTimeString()}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Share this with your visitor or show it at the gate
            </p>
          </>
        )}
      </div>
    </Modal>
  );
}
