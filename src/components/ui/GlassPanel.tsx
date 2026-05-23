import { motion, type HTMLMotionProps } from 'framer-motion';
import type { ReactNode } from 'react';

interface GlassPanelProps extends HTMLMotionProps<'section'> {
  children: ReactNode;
  glow?: 'cyan' | 'amber' | 'none';
}

export function GlassPanel({ children, className = '', glow = 'none', ...props }: GlassPanelProps) {
  const glowClass =
    glow === 'cyan' ? 'border-cyanSignal/25 shadow-cyan' : glow === 'amber' ? 'border-amberSignal/25 shadow-amber' : '';

  return (
    <motion.section className={`glass-panel ${glowClass} ${className}`} {...props}>
      {children}
    </motion.section>
  );
}
