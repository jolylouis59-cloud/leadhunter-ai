import EmailForm from "./EmailForm";
import Logo from "./Logo";

export default function Hero() {
  return (
    <section id="hero" className="bg-white pt-[60px] md:pt-[100px]">
      <div className="container-page">
        <div className="grid items-center gap-12 lg:grid-cols-[3fr_2fr] lg:gap-16">
          <div className="min-w-0">
            <div className="animate-pulse-soft inline-flex items-center gap-2 rounded-full border border-brand-cta/30 bg-brand-oatmeal px-4 py-1.5">
              <span className="h-2 w-2 rounded-full bg-brand-cta animate-pulse-dot" />
              <span className="text-sm font-semibold text-brand-cta">
                🔥 +47 entrepreneurs ont rejoint cette semaine
              </span>
            </div>

            <h1 className="heading mt-6 text-[34px] leading-[1.1] text-brand-text md:text-[58px]">
              Trouve tes clients B2B sur Reddit, X et LinkedIn
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-snug text-brand-muted">
              LeadHunter AI scanne les 3 plateformes, score l&apos;intention
              d&apos;achat, et génère une réponse prête à envoyer.
            </p>

            <div className="mt-8 max-w-lg">
              <EmailForm />
            </div>

            <p className="mt-4 text-sm text-gray-400">
              Déjà 340 entrepreneurs · Essai 7 jours gratuit
            </p>
          </div>

          <div className="hidden min-w-0 lg:block">
            <div className="rounded-2xl bg-brand-surface p-6 shadow-hero">
              <div className="rounded-xl border border-brand-border bg-white p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100">
                      <svg className="h-4 w-4 text-orange-600" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.03 4.87-6.77 4.87-3.74 0-6.77-2.176-6.77-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.85-3.994 2.59.544a1.25 1.25 0 0 1 1.249-1.25z" />
                      </svg>
                    </div>
                    <span className="text-sm font-semibold text-gray-600">r/SaaS</span>
                  </div>
                  <span className="animate-pulse-amber rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-700">
                    Intent 94%
                  </span>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-gray-600">
                  Je cherche un outil de prospection B2B qui trouve mes clients sur
                  Reddit automatiquement. Des alternatives à Octolens ?
                </p>
              </div>

              <div className="my-4 flex justify-center text-xl text-brand-cta animate-pulse-arrow">
                ↓
              </div>

              <div className="rounded-xl border border-brand-border bg-white p-5">
                <div className="flex items-center gap-2">
                  <Logo size={22} showText={false} />
                  <span className="text-xs font-medium text-gray-500">Réponse IA générée</span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-gray-700">
                  Salut ! LeadHunter scanne Reddit 24/7 et t&apos;alerte dès qu&apos;un
                  prospect cherche ta solution. Essai gratuit — réponse prête en 1 clic.
                </p>
                <span className="mt-3 inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-brand-cta">
                  Prêt à envoyer ✓
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Mockup mobile — below text only on small screens */}
        <div className="mt-12 lg:hidden">
          <div className="rounded-2xl bg-brand-surface p-5 shadow-hero">
            <div className="rounded-xl border border-brand-border bg-white p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-600">r/SaaS</span>
                <span className="animate-pulse-amber rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">
                  Intent 94%
                </span>
              </div>
              <p className="mt-3 text-sm text-gray-600">
                Je cherche un outil de prospection B2B sur Reddit…
              </p>
            </div>
            <div className="my-3 text-center text-brand-cta animate-pulse-arrow">↓</div>
            <div className="rounded-xl border border-brand-border bg-white p-4">
              <p className="text-sm text-gray-700">Réponse IA prête à envoyer.</p>
              <span className="mt-2 inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-brand-cta">
                Prêt à envoyer ✓
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
