import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Reveal from "./Reveal";

export default function CTASection() {
  return (
    <section className="py-24 px-6">
      <Reveal className="max-w-4xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary-600 to-purple-700 p-14 text-center">
          <motion.div
            animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ repeat: Infinity, duration: 10 }}
            className="absolute -top-10 -left-10 w-60 h-60 bg-white/10 rounded-full blur-3xl"
          />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 relative z-10">
            Ready to modernize your gate?
          </h2>
          <p className="text-white/80 mb-8 max-w-lg mx-auto relative z-10">
            Join societies already running paperless, secure visitor management
            with real-time approvals.
          </p>
          <Link to="/register">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="relative z-10 inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-white text-primary-700 font-semibold shadow-xl"
            >
              Get Started Free <ArrowRight className="w-4 h-4" />
            </motion.button>
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
