import { motion } from "motion/react";

export function Visualizer({ isConnected }: { isConnected: boolean }) {
  return (
    <div className="flex items-center justify-center gap-1 h-12">
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="w-1.5 bg-emerald-500 rounded-full"
          animate={isConnected ? {
            height: [12, Math.random() * 40 + 10, 12],
          } : {
            height: 12,
          }}
          transition={{
            duration: 0.4 + Math.random() * 0.4,
            repeat: Infinity,
            delay: i * 0.05,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
}
