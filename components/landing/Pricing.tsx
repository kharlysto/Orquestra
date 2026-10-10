const plans = [
  { name: "Starter", price: "Free", note: "For one-person shops", items: ["1 user", "100 products", "Basic analytics", "20 AI questions a month"], cta: "Start free" },
  { name: "Growth", price: "$29", note: "per month, for growing teams", items: ["5 users", "Unlimited products", "Full analytics", "Unlimited AI Copilot", "Low stock alerts"], cta: "Start free trial", hot: true },
  { name: "Enterprise", price: "Custom", note: "For multi-branch businesses", items: ["Unlimited users", "Roles and permissions", "Priority support", "Custom integrations"], cta: "Book demo" },
];

export default function Pricing() {
  return (
    <section id="pricing" className="px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-4xl font-black tracking-tight sm:text-6xl">Pricing that grows with you</h2>
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {plans.map((p) => (
            <div key={p.name} className={`landing-panel flex flex-col rounded-3xl border bg-card p-8 ${p.hot ? "border-primary shadow-[0_0_60px_#00E5C220]" : "border-white/10"}`}>
              <h3 className="text-xl font-black">{p.name}</h3>
              <p className="mt-4 text-5xl font-black">{p.price}</p>
              <p className="mt-1 text-sm text-sub">{p.note}</p>
              <ul className="mt-8 flex-1 space-y-3 text-sm">
                {p.items.map((i) => (<li key={i} className="flex gap-3"><span className="text-primary">✓</span>{i}</li>))}
              </ul>
              <a href="/signup" className={`mt-8 rounded-full py-3 text-center font-black transition ${p.hot ? "bg-primary text-bg hover:bg-secondary" : "border border-white/15 hover:border-primary hover:text-primary"}`}>{p.cta}</a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
