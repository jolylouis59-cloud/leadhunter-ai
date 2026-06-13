import EmailForm from "./EmailForm";

const badges = ["✓ Sans CB", "✓ Setup 2 min"];

export default function FinalCTA() {
  return (
    <section className="section-padding bg-brand-dark">
      <div className="container-page mx-auto max-w-xl text-center">
        <h2 className="heading text-3xl text-white md:text-4xl">
          Tes prochains clients sont sur Reddit en ce moment.
        </h2>
        <p className="mt-4 text-base text-gray-400">
          Pendant que tu lis ça, ils cherchent une solution comme la tienne.
        </p>

        <div className="mt-8">
          <EmailForm variant="cta" buttonLabel="Commencer gratuitement" />
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {badges.map((badge) => (
            <span
              key={badge}
              className="rounded-full border border-gray-600 bg-white/5 px-4 py-1.5 text-sm text-gray-300"
            >
              {badge}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
