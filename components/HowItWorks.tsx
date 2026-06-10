const steps = [
  {
    num: "01",
    title: "Tu décris ton produit",
    desc: "2 minutes, tu dis ce que tu vends et à qui tu t'adresses.",
  },
  {
    num: "02",
    title: "L'IA scanne pour toi",
    desc: "24h/24 sur Reddit, X et LinkedIn. Chaque post est scoré.",
  },
  {
    num: "03",
    title: "Tu closes",
    desc: "Réponds aux leads chauds, publie ton contenu en 1 clic.",
  },
];

function StepCard({ num, title, desc }: { num: string; title: string; desc: string }) {
  return (
    <div className="card-interactive flex flex-1 flex-col rounded-xl border border-brand-border bg-white p-8 hover:border-brand-cta/20">
      <span className="text-[48px] font-extrabold leading-none text-brand-cta">{num}</span>
      <h3 className="mt-4 text-lg font-bold text-brand-text">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-brand-muted">{desc}</p>
    </div>
  );
}

export default function HowItWorks() {
  return (
    <section className="section-padding bg-white">
      <div className="container-page">
        <h2 className="heading text-center text-3xl text-brand-text md:text-4xl">
          Comment ça marche
        </h2>

        <div className="mt-14 hidden items-stretch gap-4 md:flex">
          <StepCard {...steps[0]} />
          <span className="flex shrink-0 items-center text-2xl text-brand-cta">→</span>
          <StepCard {...steps[1]} />
          <span className="flex shrink-0 items-center text-2xl text-brand-cta">→</span>
          <StepCard {...steps[2]} />
        </div>

        <div className="mt-14 grid gap-6 md:hidden">
          {steps.map((s) => (
            <StepCard key={s.num} {...s} />
          ))}
        </div>
      </div>
    </section>
  );
}
