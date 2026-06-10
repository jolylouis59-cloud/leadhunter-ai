import Logo from "./Logo";

const links = [
  { label: "Fonctionnalités", href: "#fonctionnalites" },
  { label: "Tarification", href: "#pricing" },
  { label: "Contact", href: "mailto:hello@leadhunter.ai" },
  { label: "CGU", href: "#" },
];

export default function Footer() {
  return (
    <footer className="border-t border-brand-border bg-white py-12">
      <div className="container-page flex flex-col items-center justify-between gap-8 md:flex-row">
        <div className="text-center md:text-left">
          <Logo />
          <p className="mt-2 text-sm text-brand-muted">
            Trouve tes clients. Pendant que tu dors.
          </p>
          <p className="mt-4 text-xs text-gray-400">© LeadHunter AI 2025</p>
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-sm font-medium text-brand-muted transition-colors hover:text-brand-text"
            >
              {l.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
