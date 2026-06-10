const plans = [
  {
    name: "Starter",
    price: "49€",
    desc: "Pour les solopreneurs qui veulent leurs premiers clients",
    features: [
      "300 leads/mois",
      "Reddit + X + LinkedIn",
      "Intent Score IA",
      "Réponse IA en 1 clic",
      "Alertes email",
    ],
    cta: "Essayer 7 jours gratuits",
    variant: "outline" as const,
    popular: false,
  },
  {
    name: "Growth",
    price: "99€",
    desc: "Pour les founders qui veulent scaler leur acquisition",
    features: [
      "1000 leads/mois",
      "Reddit + X + LinkedIn",
      "Intent Score IA avancé",
      "Réponse IA ultra-personnalisée",
      "Content Studio",
      "Alertes Slack + email",
      "Dashboard analytics",
    ],
    cta: "Essayer 7 jours gratuits",
    variant: "solid" as const,
    popular: true,
  },
  {
    name: "Agency",
    price: "199€",
    desc: "Pour les agences qui gèrent plusieurs clients",
    features: [
      "Leads illimités",
      "5 workspaces clients",
      "Tout inclus",
      "API access",
      "Support prioritaire",
      "Onboarding dédié",
    ],
    cta: "Essayer 7 jours gratuits",
    variant: "outline" as const,
    popular: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="section-padding bg-white">
      <div className="container-page">
        <h2 className="heading text-center text-3xl text-brand-text md:text-4xl">
          Tarification simple
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-brand-muted">
          7 jours gratuits sur tous les plans. Aucune CB requise.
        </p>

        <div className="mt-14 grid items-center gap-6 lg:grid-cols-3">
          {plans.map((plan) => {
            const isPopular = plan.popular;
            return (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-xl p-8 ${
                  isPopular
                    ? "-translate-y-3 border border-brand-dark bg-brand-dark text-white shadow-growth"
                    : "border border-brand-border bg-white"
                }`}
              >
                {isPopular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-cta px-4 py-1 text-xs font-bold text-white">
                    POPULAIRE
                  </span>
                )}

                <h3 className={`text-xl font-bold ${isPopular ? "text-white" : "text-brand-text"}`}>
                  {plan.name}
                </h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className={`text-4xl font-extrabold ${isPopular ? "text-white" : "text-brand-text"}`}>
                    {plan.price}
                  </span>
                  <span className={isPopular ? "text-gray-400" : "text-brand-muted"}>/mois</span>
                </div>
                <p className={`mt-2 text-sm ${isPopular ? "text-gray-400" : "text-brand-muted"}`}>
                  {plan.desc}
                </p>

                <ul className="mt-6 flex-1 space-y-3">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className={`flex gap-2 text-sm ${isPopular ? "text-gray-300" : "text-brand-muted"}`}
                    >
                      <span className="font-bold text-brand-cta">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <a
                  href="#hero"
                  className={`mt-8 block w-full text-center ${
                    plan.variant === "solid"
                      ? "btn-primary"
                      : `btn-outline ${isPopular ? "!border-white !text-white hover:!bg-white/10" : ""}`
                  }`}
                >
                  {plan.cta}
                </a>
              </div>
            );
          })}
        </div>

        <p className="mx-auto mt-10 max-w-2xl text-center text-sm text-brand-muted">
          Essai 7 jours sans engagement · Aucune CB requise · Annulation en 1 clic
        </p>
      </div>
    </section>
  );
}
