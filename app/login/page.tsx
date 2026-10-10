"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

function EyeIcon({ hidden }: { hidden: boolean }) {
  return hidden ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.2A10.6 10.6 0 0 1 12 5c5 0 8.5 4.5 9.5 7-.4 1-1.2 2.2-2.3 3.3M6.2 6.2C3.8 7.7 2.7 10 2.5 12c.5 1.3 1.7 3.2 3.8 4.7A9.8 9.8 0 0 0 12 19c1.1 0 2.2-.2 3.2-.6" /></svg> : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12S6 5 12 5s9.5 7 9.5 7S18 19 12 19s-9.5-7-9.5-7Z" /><circle cx="12" cy="12" r="2.5" /></svg>;
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [requiresVerification, setRequiresVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  async function submit(event: FormEvent) {
    event.preventDefault(); setError("");
    const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
    const data = await response.json(); if (!response.ok) return setError(data.error); if (data.requiresVerification) { setRequiresVerification(true); return; } router.push("/dashboard");
  }
  async function verify(event: FormEvent) { event.preventDefault(); setError(""); const response = await fetch("/api/auth/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, code: verificationCode }) }); const data = await response.json(); if (!response.ok) return setError(data.error); router.push("/dashboard"); }
  if (requiresVerification) return <main className="auth-page"><section className="auth-form-side auth-form-side-full"><form onSubmit={verify} className="auth-form"><p className="auth-kicker">Security check</p><h1 className="mt-3 text-4xl font-black tracking-tight">Verify your sign-in</h1><p className="mt-3 text-sm leading-relaxed text-sub">We sent a 6-digit code to {email}. Enter it below to continue.</p><label className="auth-label mt-9">Verification code<input required inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={verificationCode} onChange={(event) => setVerificationCode(event.target.value.replace(/\D/g, ""))} className="auth-input tracking-[0.35em]" autoComplete="one-time-code" /></label>{error && <p className="mt-4 text-sm text-rose-300">{error}</p>}<button className="auth-submit mt-8">Verify and continue</button></form></section></main>;
  return <main className="auth-page"><section className="auth-visual"><div className="auth-visual-grid" /><div className="auth-system"><div className="auth-orbit auth-orbit-one" /><div className="auth-orbit auth-orbit-two" /><div className="auth-node auth-node-top"><span>CRM</span></div><div className="auth-node auth-node-right"><span>Sales</span></div><div className="auth-node auth-node-bottom"><span>Inventory</span></div><div className="auth-node auth-node-left"><span>Analytics</span></div><div className="auth-core"><span /></div></div><div className="auth-visual-content"><img src="/logo/main-landing-logo.png" alt="Orquestra" className="h-20 w-auto object-contain" /><p className="mt-8 max-w-sm text-3xl font-black leading-tight">Every moving part of your business, in rhythm.</p><p className="mt-4 max-w-sm text-sm leading-relaxed text-white/55">Connect customers, inventory, sales, and intelligence in one focused workspace.</p></div></section><section className="auth-form-side"><form onSubmit={submit} className="auth-form"><div className="md:hidden"><img src="/logo/main-landing-logo.png" alt="Orquestra" className="h-9 w-auto object-contain" /></div><p className="auth-kicker">Welcome back</p><h1 className="mt-3 text-4xl font-black tracking-tight">Sign in to your account</h1><p className="mt-3 text-sm leading-relaxed text-sub">Pick up where your team left off.</p><label className="auth-label mt-9">Email address<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="auth-input" autoComplete="email" /></label><label className="auth-label mt-5">Password<div className="auth-password-wrap"><input required type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} className="auth-input" autoComplete="current-password" /><button type="button" className="auth-password-toggle" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((visible) => !visible)}><EyeIcon hidden={showPassword} /></button></div></label><div className="mt-4 flex justify-end text-xs text-white/45"><a href="#" className="auth-link">Forgot password?</a></div>{error && <p className="mt-4 text-sm text-rose-300">{error}</p>}<button className="auth-submit mt-8">Login</button><p className="mt-7 text-center text-sm text-sub">New to Orquestra? <a className="auth-link" href="/signup">Create an account</a></p></form></section></main>;
}
