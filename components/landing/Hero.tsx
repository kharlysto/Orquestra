"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import Orbit from "./Orbit";

export default function Hero() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 600], [0, 90]);
  return (
    <section className="relative overflow-hidden px-6 pb-24 pt-36">
      <div className="grid-bg absolute inset-0" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <h1 className="text-5xl font-black leading-[1.02] tracking-tight sm:text-7xl">
            Stop managing tools.<br />Start orchestrating business.
          </h1>
          <p className="mt-8 text-xl leading-relaxed text-sub">
            Sales. Inventory. Customers. Operations.<br />
            <span className="text-white">One intelligence.</span>
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <a href="/signup" className="rounded-full bg-primary px-8 py-4 font-black text-bg shadow-[0_0_40px_#00E5C240] transition hover:bg-secondary">Start free</a>
            <a href="#demo" className="landing-link rounded-full border border-white/15 px-8 py-4 font-black">Book demo</a>
          </div>
        </motion.div>
        <motion.div style={{ y }}><Orbit /></motion.div>
      </div>
    </section>
  );
}
