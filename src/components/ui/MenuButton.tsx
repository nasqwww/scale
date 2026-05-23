import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface MenuButtonProps {
  label: string;
  icon: LucideIcon;
  accent?: 'cyan' | 'amber' | 'neutral';
  onClick: () => void;
  delay?: number;
}

export function MenuButton({ label, icon: Icon, accent = 'neutral', onClick, delay = 0 }: MenuButtonProps) {
  const accentClass =
    accent === 'cyan' ? 'menu-btn-cyan' : accent === 'amber' ? 'menu-btn-amber' : 'menu-btn-neutral';

  return (
    <motion.button
      type="button"
      className={`menu-btn ${accentClass}`}
      onClick={onClick}
      initial={{ opacity: 0, x: -18 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ x: 6, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
    >
      <Icon size={18} />
      <span>{label}</span>
      <motion.span className="menu-btn-glint" animate={{ opacity: [0.2, 0.8, 0.2] }} transition={{ duration: 2.4, repeat: Infinity }} />
    </motion.button>
  );
}
