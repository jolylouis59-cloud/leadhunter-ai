const bullets = [
  "Posts optimisés pour Reddit, X et LinkedIn",
  "Adapté à ton produit et ta cible",
  "Calendrier de contenu suggéré par l'IA",
];

const tabs = ["Reddit", "X", "LinkedIn"];

export default function Feature2() {
  return (
    <section className="section-padding bg-brand-oatmeal">
      <div className="container-page">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="order-2 lg:order-1">
            <div className="rounded-xl border border-brand-border bg-white p-5 shadow-md">
              <div className="flex gap-1 border-b border-brand-border pb-4">
                {tabs.map((tab) => (
                  <span
                    key={tab}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                      tab === "Reddit"
                        ? "bg-brand-cta text-white"
                        : "text-brand-muted"
                    }`}
                  >
                    {tab}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-xs font-medium text-gray-400">Lundi · Post suggéré</p>
              <p className="mt-2 text-sm leading-relaxed text-brand-text">
                Voici comment j&apos;ai automatisé ma prospection B2B en 2h/semaine —
                sans cold email, sans SDR, juste en répondant aux bonnes conversations
                sur Reddit.
              </p>
              <a
                href="#hero"
                className="btn-primary mt-5 inline-block px-4 py-2 text-xs"
              >
                Générer →
              </a>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <h2 className="heading text-3xl text-brand-text md:text-4xl">
              Crée du contenu qui attire des clients
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
        </div>
      </div>
    </section>
  );
}
