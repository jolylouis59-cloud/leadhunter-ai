const bullets = [
  "Scan Reddit, X, LinkedIn avec tes keywords",
  "Intent Score IA 0-100 sur chaque post",
  "Réponse personnalisée en 1 clic",
];

export default function Feature1() {
  return (
    <section id="fonctionnalites" className="section-padding bg-white">
      <div className="container-page">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className="heading text-3xl text-brand-text md:text-4xl">
              Trouve les prospects qui cherchent ce que tu vends
            </h2>
            <ul className="mt-8 space-y-4">
              {bullets.map((b) => (
                <li key={b} className="flex items-start gap-3 text-base font-medium text-brand-muted">
                  <span className="mt-0.5 shrink-0 font-bold text-brand-cta">✓</span>
                  {b}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-brand-border bg-white p-5 shadow-md">
            <div className="flex items-center justify-between border-b border-brand-border pb-4">
              <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
                Reddit
              </span>
              <span className="animate-pulse-amber rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-700">
                Intent 94%
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-brand-muted">
              &ldquo;Je cherche un outil de prospection B2B qui trouve mes clients sur
              Reddit automatiquement. Des alternatives à Octolens ?&rdquo;
            </p>
            <a
              href="#hero"
              className="mt-5 inline-block text-sm font-semibold text-brand-cta transition-colors hover:text-brand-cta-hover"
            >
              Voir la réponse IA →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
