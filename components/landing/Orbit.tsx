"use client";
import { motion } from "framer-motion";

const nodes = ["CRM", "Inventory", "Sales", "Analytics", "Copilot"];
const spin = { duration: 48, repeat: Infinity, ease: "linear" as const };

export default function Orbit() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[540px]" aria-hidden>
      <div className="absolute inset-[8%] rounded-full border border-primary/20" />
      <div className="absolute inset-[22%] rounded-full border border-secondary/20" />
      <motion.div className="absolute inset-0" animate={{ rotate: 360 }} transition={spin}>
        {nodes.map((n, i) => {
          const a = (i / nodes.length) * Math.PI * 2 - Math.PI / 2;
          return (
            <div key={n} className="absolute" style={{ left: `${50 + 42 * Math.cos(a)}%`, top: `${50 + 42 * Math.sin(a)}%`, transform: "translate(-50%,-50%)" }}>
              <motion.div animate={{ rotate: -360 }} transition={spin}
                className="rounded-xl border border-white/10 bg-card/90 px-4 py-2 text-sm shadow-[0_0_30px_#00E5C214] backdrop-blur">
                {n}
              </motion.div>
            </div>
          );
        })}
      </motion.div>
      <motion.div className="absolute inset-0 m-auto h-32 w-32 rounded-full"
        style={{ background: "radial-gradient(circle at 35% 30%, #4BF8FF, #00E5C2 45%, #064e45 100%)" }}
        animate={{ scale: [1, 1.06, 1], boxShadow: ["0 0 60px #00E5C255", "0 0 120px #00E5C288", "0 0 60px #00E5C255"] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />
    </div>
  );
}
