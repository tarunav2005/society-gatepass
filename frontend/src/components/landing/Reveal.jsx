import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

export default function Reveal({
  children,
  delay = 0,
  direction = "up",
  className = "",
}) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.15 });

  const directions = {
    up: { y: 30, x: 0 },
    left: { y: 0, x: -30 },
    right: { y: 0, x: 30 },
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...directions[direction] }}
      animate={inView ? { opacity: 1, y: 0, x: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
