"use client";

import { useEffect, useState } from "react";

const links = [["Problem", "#problem"], ["Features", "#features"], ["Preview", "#preview"], ["Pricing", "#pricing"]] as const;

export default function Navbar() {
  const [active, setActive] = useState("");

  useEffect(() => {
    const sections = links.map(([, href]) => document.querySelector(href));
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible?.target.id) setActive(`#${visible.target.id}`);
    }, { rootMargin: "-18% 0px -62% 0px", threshold: [0.1, 0.35, 0.6] });
    sections.forEach((section) => section && observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-bg/70 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <a href="#" className="flex items-center gap-2 tracking-tight">
          <img src="/logo/main-landing-logo.png" alt="Orquestra" className="h-10 w-auto object-contain" />
        </a>
        <ul className="hidden gap-8 text-sm text-sub md:flex">
          {links.map(([l, h]) => (
            <li key={h}><a href={h} onClick={() => setActive(h)} className={`landing-nav-link ${active === h ? "is-active" : ""}`}>{l}</a></li>
          ))}
        </ul>
        <div className="flex items-center gap-1">
          <a href="/login" className="landing-link rounded-full px-3 py-2 text-sm font-bold text-sub">Login</a>
          <a href="/signup" className="rounded-full border border-primary/50 px-4 py-2 text-sm font-black text-primary transition hover:bg-primary hover:text-bg">Signup</a>
        </div>
      </nav>
    </header>
  );
}
