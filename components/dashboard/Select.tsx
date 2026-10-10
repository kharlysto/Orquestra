"use client";

import { useEffect, useRef, useState } from "react";

type Option = { value: string; label: string };

export default function DashboardSelect({ value, options, onChange, ariaLabel }: { value: string; options: Option[]; onChange: (value: string) => void; ariaLabel: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.value === value) || options[0];
  useEffect(() => {
    const close = (event: MouseEvent) => { if (!ref.current?.contains(event.target as Node)) setOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", close); document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", escape); };
  }, []);
  return <div ref={ref} className={`dashboard-picker ${open ? "is-open" : ""}`}><button type="button" className="dashboard-picker-trigger" aria-haspopup="listbox" aria-expanded={open} aria-label={ariaLabel} onClick={() => setOpen((current) => !current)}><span>{selected?.label}</span><i /></button>{open && <div className="dashboard-picker-menu" role="listbox" aria-label={ariaLabel}>{options.map((option) => <button type="button" role="option" aria-selected={option.value === value} key={option.value} className={`dashboard-picker-option ${option.value === value ? "is-selected" : ""}`} onClick={() => { onChange(option.value); setOpen(false); }}>{option.label}{option.value === value && <b>✓</b>}</button>)}</div>}</div>;
}
