"use client";
import { motion } from "framer-motion";

const tools = [
  { name: "Facebook", x: -60, y: -20, r: -8 },
  { name: "Google Sheets", x: 40, y: 30, r: 6 },
  { name: "Inventory app", x: -30, y: 50, r: -4 },
  { name: "Email", x: 70, y: -30, r: 9 },
  { name: "Invoices", x: -50, y: 10, r: -6 },
];

export default function Problem() {
  return (
    <section id="problem" className="px-6 py-28">
      <div className="mx-auto max-w-5xl text-center">
        <h2 className="text-4xl font-black tracking-tight sm:text-6xl">Your business runs on five tabs that never talk to each other.</h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-sub">Orders arrive on Facebook, stock lives in a sheet, invoices go out by email. Nobody sees the whole picture.</p>

        <div className="mt-16 flex flex-col items-center gap-10">
          <div className="flex flex-wrap justify-center gap-4">
            {tools.map((t, i) => (
              <motion.div key={t.name}
                initial={{ x: t.x, y: t.y, rotate: t.r, opacity: 0.6 }}
                whileInView={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
                viewport={{ once: false, margin: "-30% 0px" }}
                transition={{ delay: 0.3 + i * 0.12, type: "spring", stiffness: 70, damping: 14 }}
                className="landing-panel rounded-xl border border-white/10 bg-card px-5 py-3 text-sm">
                {t.name}
              </motion.div>
            ))}
          </div>
          <motion.div initial={{ scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: false }} transition={{ delay: 1.1, duration: 0.6 }}
            className="h-16 w-px origin-top bg-primary/60" />
          <motion.div initial={{ opacity: 0.3, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: false }} transition={{ delay: 1.5 }}
            className="landing-panel rounded-2xl border border-primary/40 bg-card px-10 py-5 text-xl font-black shadow-[0_0_60px_#00E5C230]">
            <img src="/logo/main-landing-logo.png" alt="Orquestra" className="h-12 w-auto object-contain" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
