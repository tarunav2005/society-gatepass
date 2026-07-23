import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { motion, AnimatePresence } from "framer-motion";
import { ScanLine, CheckCircle2, XCircle, User, Home } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../lib/axios";
import Button from "../../components/ui/Button";
import PageHeader from "../../components/ui/PageHeader";

export default function ScanQR() {
  const scannerRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null); // { success, message, visitor }
  const [processing, setProcessing] = useState(false);

  const startScanner = async () => {
    setResult(null);
    setScanning(true);
    const scanner = new Html5Qrcode("qr-reader");
    scannerRef.current = scanner;

    try {
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          await scanner.stop();
          setScanning(false);
          handleScan(decodedText);
        },
        () => {}, // ignore per-frame scan failures
      );
    } catch (err) {
      setScanning(false);
      toast.error("Camera access denied or unavailable");
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
      } catch {}
    }
    setScanning(false);
  };

  useEffect(
    () => () => {
      stopScanner();
    },
    [],
  );

  const handleScan = async (token) => {
    setProcessing(true);
    try {
      const { data } = await api.post("/visitors/scan", { token });
      setResult({ success: true, message: data.message, visitor: data.data });
      toast.success("Checked in!");
    } catch (err) {
      setResult({
        success: false,
        message: err.response?.data?.message || "Scan failed",
      });
      toast.error(err.response?.data?.message || "Scan failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <PageHeader
        title="Scan Gate Pass"
        subtitle="Scan visitor QR code to check them in"
      />

      <div className="glass rounded-2xl p-6">
        {!scanning && !result && (
          <div className="text-center py-12">
            <ScanLine className="w-16 h-16 text-primary-400 mx-auto mb-4" />
            <Button onClick={startScanner}>Start Scanning</Button>
          </div>
        )}

        <div
          id="qr-reader"
          className={scanning ? "rounded-xl overflow-hidden" : "hidden"}
        />

        {scanning && (
          <Button variant="ghost" className="w-full mt-4" onClick={stopScanner}>
            Cancel
          </Button>
        )}

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`rounded-2xl p-6 text-center ${
                result.success
                  ? "bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30"
                  : "bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30"
              }`}
            >
              {result.success ? (
                <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto mb-3" />
              ) : (
                <XCircle className="w-14 h-14 text-red-500 mx-auto mb-3" />
              )}
              <p
                className={`font-semibold ${result.success ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400"}`}
              >
                {result.message}
              </p>
              {result.visitor && (
                <div className="mt-4 text-left bg-white/60 dark:bg-slate-900/40 rounded-xl p-4 space-y-1.5">
                  <p className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <User className="w-4 h-4" /> {result.visitor.name}
                  </p>
                  <p className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <Home className="w-4 h-4" /> {result.visitor.tower?.name} -{" "}
                    {result.visitor.flat?.flatNumber}
                  </p>
                </div>
              )}
              <Button className="w-full mt-4" onClick={startScanner}>
                Scan Next
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
