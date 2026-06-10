const testimonials = [
  {
    quote:
      "J'ai signé 3 clients en 2 semaines via Reddit. Avant je passais mes soirées à scroller.",
    name: "Thomas M.",
    role: "Founder, SaaS Analytics",
    initials: "TM",
  },
  {
    quote:
      "Mon taux de réponse est passé de 4% à 38% grâce à l'Intent Score.",
    name: "Sarah L.",
    role: "Solopreneur, Agence Growth",
    initials: "SL",
  },
  {
    quote:
      "On a remplacé notre SDR junior. 99€/mois vs 2500€ de salaire.",
    name: "Karim B.",
    role: "Co-founder, Outil No-code",
    initials: "KB",
  },
  {
    quote:
      "LeadHunter a remplacé 3 outils qu'on payait séparément. ROI positif dès le premier mois.",
    name: "Marc D.",
    role: "Agence Digitale",
    initials: "MD",
  },
];

export default function Testimonials() {
  return (
    <section id="temoignages" className="section-padding bg-brand-oatmeal">
      <div className="container-page">
        <h2 className="heading text-center text-3xl text-brand-text md:text-4xl">
          Ils ont trouvé leurs premiers clients
        </h2>

        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="card-interactive flex flex-col rounded-xl border border-brand-border bg-white p-6 hover:border-brand-cta/30"
            >
              <p className="flex-1 text-sm leading-relaxed text-brand-muted">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-6 flex items-center gap-3 border-t border-brand-border pt-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-oatmeal text-xs font-bold text-brand-cta">
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-bold text-brand-text">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
