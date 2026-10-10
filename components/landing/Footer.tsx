const cols = {
  Product: [["CRM", "#preview"], ["Inventory", "#preview"], ["Sales", "#preview"], ["Analytics", "#preview"], ["AI Copilot", "#preview"]],
  Company: [["About", "#problem"], ["Careers", "mailto:careers@orquestra.local"], ["Contact", "mailto:hello@orquestra.local"]],
  Legal: [["Privacy", "#pricing"], ["Terms", "#pricing"], ["Security", "#pricing"]],
};

export default function Footer() {
  return (
    <footer className="border-t border-white/10 px-6 py-16">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-4">
        <div>
          <img src="/logo/main-landing-logo.png" alt="Orquestra" className="h-12 w-auto object-contain" />
          <p className="landing-link mt-3 max-w-xs text-sm text-sub">The AI operating system for modern businesses.</p>
        </div>
        {Object.entries(cols).map(([h, items]) => (
          <div key={h}>
            <p className="font-black">{h}</p>
            <ul className="mt-4 space-y-2 text-sm text-sub">
              {items.map(([label, href]) => (<li key={label}><a href={href} className="landing-link">{label}</a></li>))}
            </ul>
          </div>
        ))}
      </div>
      <p className="landing-link mx-auto mt-12 max-w-7xl text-sm text-sub">© {new Date().getFullYear()} Orquestra. All rights reserved.</p>
    </footer>
  );
}
