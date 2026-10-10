"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

function EyeIcon({ hidden }: { hidden: boolean }) {
  return hidden ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.2A10.6 10.6 0 0 1 12 5c5 0 8.5 4.5 9.5 7-.4 1-1.2 2.2-2.3 3.3M6.2 6.2C3.8 7.7 2.7 10 2.5 12c.5 1.3 1.7 3.2 3.8 4.7A9.8 9.8 0 0 0 12 19c1.1 0 2.2-.2 3.2-.6" /></svg> : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12S6 5 12 5s9.5 7 9.5 7S18 19 12 19s-9.5-7-9.5-7Z" /><circle cx="12" cy="12" r="2.5" /></svg>;
}

const plans = [
  { value: "STARTER", label: "Starter", detail: "Free · Tier limited", note: "For focused, one-person operations" },
  { value: "GROWTH", label: "Growth", detail: "Team orchestration", note: "Add agents and coordinate workflows" },
  { value: "ENTERPRISE", label: "Enterprise", detail: "Custom operations", note: "Scale across branches and teams" },
];

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", plan: "STARTER" });
  const [showPassword, setShowPassword] = useState(false);
  const [planOpen, setPlanOpen] = useState(false);
  const [error, setError] = useState("");
  const [requiresVerification, setRequiresVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const planRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function closePlan(event: MouseEvent) { if (!planRef.current?.contains(event.target as Node)) setPlanOpen(false); }
    function closeOnEscape(event: KeyboardEvent) { if (event.key === "Escape") setPlanOpen(false); }
    document.addEventListener("mousedown", closePlan); document.addEventListener("keydown", closeOnEscape);
    return () => { document.removeEventListener("mousedown", closePlan); document.removeEventListener("keydown", closeOnEscape); };
  }, []);
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  async function submit(event: FormEvent) {
    event.preventDefault(); setError("");
    const response = await fetch("/api/auth/signup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await response.json(); if (!response.ok) return setError(data.error); if (data.requiresVerification) { setRequiresVerification(true); return; } router.push("/dashboard");
  }
  const selectedPlan = plans.find((plan) => plan.value === form.plan) || plans[0];
  async function verify(event: FormEvent) { event.preventDefault(); setError(""); const response = await fetch("/api/auth/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: form.email, code: verificationCode }) }); const data = await response.json(); if (!response.ok) return setError(data.error); router.push("/dashboard"); }
  if (requiresVerification) return <main className="auth-page"><section className="auth-form-side auth-form-side-full"><form onSubmit={verify} className="auth-form"><p className="auth-kicker">Confirm your email</p><h1 className="mt-3 text-4xl font-black tracking-tight">Verify your workspace</h1><p className="mt-3 text-sm leading-relaxed text-sub">We sent a 6-digit code to {form.email}. Enter it below to activate your account.</p><label className="auth-label mt-9">Verification code<input required inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={verificationCode} onChange={(event) => setVerificationCode(event.target.value.replace(/\D/g, ""))} className="auth-input tracking-[0.35em]" autoComplete="one-time-code" /></label>{error && <p className="mt-4 text-sm text-rose-300">{error}</p>}<button className="auth-submit mt-8">Verify and continue</button></form></section></main>;
  return <main className="auth-page"><section className="auth-visual"><div className="auth-visual-grid" /><div className="auth-system"><div className="auth-orbit auth-orbit-one" /><div className="auth-orbit auth-orbit-two" /><div className="auth-node auth-node-top"><span>CRM</span></div><div className="auth-node auth-node-right"><span>Sales</span></div><div className="auth-node auth-node-bottom"><span>Inventory</span></div><div className="auth-node auth-node-left"><span>Analytics</span></div><div className="auth-core"><span /></div></div><div className="auth-visual-content"><img src="/logo/main-landing-logo.png" alt="Orquestra" className="h-20 w-auto object-contain" /><p className="mt-8 max-w-sm text-3xl font-black leading-tight">Build a clearer operating rhythm.</p><p className="mt-4 max-w-sm text-sm leading-relaxed text-white/55">Start with the tools you need today and grow into a coordinated business system.</p></div></section><section className="auth-form-side"><form onSubmit={submit} className="auth-form"><div className="md:hidden"><img src="/logo/main-landing-logo.png" alt="Orquestra" className="h-9 w-auto object-contain" /></div><p className="auth-kicker">Create your workspace</p><h1 className="mt-3 text-4xl font-black tracking-tight">Start with Orquestra</h1><p className="mt-3 text-sm leading-relaxed text-sub">Set up your owner account and choose the plan that fits your business.</p><label className="auth-label mt-8">Full name<input required type="text" value={form.name} onChange={(event) => update("name", event.target.value)} className="auth-input" autoComplete="name" /></label><label className="auth-label mt-4">Email address<input required type="email" value={form.email} onChange={(event) => update("email", event.target.value)} className="auth-input" autoComplete="email" /></label><label className="auth-label mt-4">Password<div className="auth-password-wrap"><input required type={showPassword ? "text" : "password"} value={form.password} onChange={(event) => update("password", event.target.value)} className="auth-input" autoComplete="new-password" /><button type="button" className="auth-password-toggle" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((visible) => !visible)}><EyeIcon hidden={showPassword} /></button></div></label><label className="auth-label mt-4">Workspace plan<div ref={planRef} className={`auth-plan-picker ${planOpen ? "is-open" : ""}`}><button type="button" className="auth-plan-trigger" aria-haspopup="listbox" aria-expanded={planOpen} onClick={() => setPlanOpen((open) => !open)}><span><strong>{selectedPlan.label}</strong><small>{selectedPlan.detail}</small></span><i /></button>{planOpen && <div className="auth-plan-menu" role="listbox" aria-label="Workspace plan">{plans.map((plan) => <button type="button" role="option" aria-selected={form.plan === plan.value} key={plan.value} className={`auth-plan-option ${form.plan === plan.value ? "is-selected" : ""}`} onClick={() => { update("plan", plan.value); setPlanOpen(false); }}><span><strong>{plan.label}</strong><small>{plan.detail}</small></span>{form.plan === plan.value && <b>✓</b>}</button>)}</div>}</div><span className="auth-plan-hint">{selectedPlan.note}</span></label>{error && <p className="mt-4 text-sm text-rose-300">{error}</p>}<button className="auth-submit mt-7">Create account</button><p className="mt-7 text-center text-sm text-sub">Already have an account? <a className="auth-link" href="/login">Login</a></p></form></section></main>;
}
