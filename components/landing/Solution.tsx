const features = [
  ["CRM", "Every customer, their purchase history and total revenue in one profile."],
  ["Inventory", "Track stock by product and get warned before you run out."],
  ["Sales", "Record a sale, update stock and print the receipt in one step."],
  ["Analytics", "Weekly and monthly revenue, best sellers and growth at a glance."],
  ["AI Copilot", "Ask your business a question and get an answer from your own data."],
];

export default function Solution() {
  return (
    <section id="features" className="px-6 py-28">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 border-b border-white/10 pb-9 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="landing-eyebrow">One operating layer</p>
            <h2 className="mt-3 max-w-3xl text-4xl font-black tracking-tight sm:text-6xl">
              Not another dashboard.<br />An intelligent operating system.
            </h2>
          </div>
          <p className="max-w-sm text-lg leading-relaxed text-sub">
            Orquestra connects what you sell, who buys it and what is left on the shelf, then lets an AI conduct the rest.
          </p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-12">
          {features.map(([t, d], i) => (
            <div key={t}
              className={`landing-panel group relative overflow-hidden rounded-3xl border border-white/10 bg-card p-7 ${i < 3 ? "lg:col-span-4" : "lg:col-span-6"}`}>
              <div className="flex items-center justify-between"><span className="text-[10px] font-black tracking-[0.25em] text-primary">0{i + 1}</span><span className="text-lg text-white/25 transition group-hover:text-primary">↗</span></div>
              <h3 className="mt-8 text-2xl font-black transition group-hover:text-primary">{t}</h3>
              <p className="mt-3 max-w-md text-sub transition group-hover:text-white/75">{d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
