import { motion } from 'framer-motion';

export function AmbientStage() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <motion.div
        className="scanner-line"
        animate={{ y: ['-12vh', '112vh'] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      />
      <div className="grid-horizon" />
      <div className="grain" />
      <div className="vignette" />
    </div>
  );
}
