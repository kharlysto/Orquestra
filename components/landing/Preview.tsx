"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const tabs = ["AI chat", "Dashboard", "Inventory", "CRM"] as const;
type Tab = (typeof tabs)[number];

const Row = ({ a, b, c, warn }: { a: string; b: string; c: string; warn?: boolean }) => (
  <div className="grid grid-cols-3 items-center border-b border-white/5 py-3 text-sm">
    <span>{a}</span><span className="text-sub">{b}</span>
    <span className={warn ? "text-amber-400" : "text-primary"}>{c}</span>
  </div>
);

const views: Record<Tab, React.ReactNode> = {
  "AI chat": (
    <div className="space-y-4 text-sm">
      <p className="ml-auto w-fit max-w-[80%] rounded-2xl bg-white/10 px-4 py-3">Which products need restocking?</p>
      <p className="w-fit max-w-[85%] rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3">
        3 products are below their threshold: Arabica 1kg (2 left), Paper cups 12oz (4 left) and Oat milk (3 left). Arabica sold 41 units this month, so I'd reorder that first.
      </p>
    </div>
  ),
  Dashboard: (
    <div>
      <div className="grid grid-cols-3 gap-3">
        {[["Revenue", "$12,480"], ["Customers", "214"], ["Growth", "+18%"]].map(([l, v]) => (
          <div key={l} className="landing-panel rounded-xl bg-bg p-4"><p className="text-xs text-sub">{l}</p><p className="mt-1 text-xl font-black">{v}</p></div>
        ))}
      </div>
      <div className="mt-5 flex h-32 items-end gap-2">
        {[40, 55, 35, 70, 60, 85, 95].map((h, i) => (
          <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ delay: i * 0.05 }} className="flex-1 rounded-t bg-gradient-to-t from-primary/30 to-primary" />
        ))}
      </div>
    </div>
  ),
  Inventory: (
    <div>
      <Row a="Product" b="Stock" c="Status" />
      <Row a="Arabica 1kg" b="2" c="Low stock" warn />
      <Row a="Oat milk" b="3" c="Low stock" warn />
      <Row a="Paper cups 12oz" b="120" c="In stock" />
    </div>
  ),
  CRM: (
    <div>
      <Row a="Customer" b="Orders" c="Revenue" />
      <Row a="Maria Santos" b="18" c="$1,420" />
      <Row a="Juan Dela Cruz" b="11" c="$960" />
      <Row a="Lia Reyes" b="7" c="$615" />
    </div>
  ),
};

export default function Preview() {
  const [tab, setTab] = useState<Tab>("AI chat");
  return (
    <section id="preview" className="px-6 py-28">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-center text-4xl font-black tracking-tight sm:text-6xl">See it work</h2>
        <div id="demo" className="landing-panel mt-12 overflow-hidden rounded-3xl border border-white/10 bg-card shadow-[0_0_80px_#00E5C214]">
          <div role="tablist" className="flex gap-2 border-b border-white/10 p-3">
            {tabs.map((t) => (
              <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
                className={`rounded-full px-4 py-2 text-sm transition ${tab === t ? "bg-primary font-black text-bg" : "text-sub hover:text-white"}`}>
                {t}
              </button>
            ))}
          </div>
          <div className="min-h-[300px] p-6">
            <AnimatePresence mode="wait">
              <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                {views[tab]}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
