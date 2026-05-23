import { motion } from 'framer-motion';
import { useMemo } from 'react';

export function Particles({ count = 28 }: { count?: number }) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, index) => ({
        id: index,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 1 + Math.random() * 2.5,
        duration: 6 + Math.random() * 10,
        delay: Math.random() * 4,
      })),
    [count],
  );

  return (
    <div className="particles-layer" aria-hidden>
      {particles.map((particle) => (
        <motion.span
          key={particle.id}
          className="particle"
          style={{ left: `${particle.x}%`, top: `${particle.y}%`, width: particle.size, height: particle.size }}
          animate={{ y: [0, -30, 0], opacity: [0.15, 0.75, 0.15] }}
          transition={{ duration: particle.duration, delay: particle.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}
