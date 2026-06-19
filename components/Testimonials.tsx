"use client";

import { useEffect, useState } from "react";
import { landingColors, landingFont, sectionTitleStyle } from "@/lib/landing-styles";

const REVIEWS = [
  {
    name: "Thomas M.",
    role: "Fondateur SaaS",
    initials: "TM",
    quote:
      "Franchement j'étais sceptique au début, mais là j'ai eu 2 RDV qualifiés en une semaine via Reddit. Je ne savais même pas que mes clients étaient là.",
  },
  {
    name: "Sarah L.",
    role: "Solopreneure",
    initials: "SL",
    quote:
      "Le score d'intention c'est impressionnant. Avant je répondais à tout le monde, maintenant je cible juste les 90+. Mon taux de réponse a explosé.",
  },
  {
    name: "Karim B.",
    role: "Co-fondateur",
    initials: "KB",
    quote:
      "On a remplacé notre SDR junior avec ça. 99€/mois vs 2500€ de salaire... le calcul est vite fait.",
  },
  {
    name: "Marc D.",
    role: "Agence digitale",
    initials: "MD",
    quote:
      "Ça remplace facilement 3 outils qu'on utilisait avant. ROI positif dès le premier mois, sans exagérer.",
  },
  {
    name: "Julie R.",
    role: "Consultante",
    initials: "JR",
    quote:
      "Je ne sais pas comment vous faites mais les leads sont vraiment chauds. J'ai signé mon premier client 3 jours après l'accès bêta.",
  },
  {
    name: "Antoine V.",
    role: "Founder B2B",
    initials: "AV",
    quote:
      "La génération de réponse IA est bluffante. J'ai juste personnalisé 2-3 trucs et envoyé. Conversion directe.",
  },
];

function ReviewCard({ review }: { review: (typeof REVIEWS)[0] }) {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: "360px",
        margin: "0 auto",
        background: "rgba(255,255,255,0.1)",
        border: "1px solid rgba(255,255,255,0.15)",
        borderRadius: "12px",
        padding: "20px",
        boxSizing: "border-box",
      }}
    >
      <p style={{ margin: 0, fontSize: "14px", lineHeight: 1.55, color: landingColors.white }}>
        &ldquo;{review.quote}&rdquo;
      </p>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginTop: "16px",
          paddingTop: "16px",
          borderTop: "1px solid rgba(255,255,255,0.15)",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.2)",
            color: landingColors.white,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "12px",
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {review.initials}
        </div>
        <div>
          <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: landingColors.white }}>
            {review.name}
          </p>
          <p style={{ margin: "2px 0 0", fontSize: "12px", color: "rgba(255,255,255,0.7)" }}>
            {review.role}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Testimonials() {
  const [isMobile, setIsMobile] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const marqueeReviews = [...REVIEWS, ...REVIEWS];

  return (
    <section
      id="temoignages"
      style={{
        background: landingColors.accent,
        padding: "64px 0",
        fontFamily: landingFont,
        overflow: "hidden",
      }}
    >
      <style>{`
        @keyframes testimonialMarquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .testimonial-marquee-track {
          display: flex;
          gap: 16px;
          width: max-content;
          animation: testimonialMarquee 40s linear infinite;
          will-change: transform;
        }
      `}</style>

      <div style={{ padding: "0 24px", textAlign: "center", marginBottom: "40px" }}>
        <h2 style={{ ...sectionTitleStyle, color: landingColors.white }}>
          Ils ont testé en avant-première — voici leurs avis
        </h2>
        <p
          style={{
            margin: "12px 0 0",
            fontSize: "14px",
            color: "rgba(255,255,255,0.75)",
            fontStyle: "italic",
          }}
        >
          (Accès bêta fermé — places limitées)
        </p>
      </div>

      {isMobile ? (
        <div style={{ padding: "0 24px" }}>
          <ReviewCard review={REVIEWS[activeIndex]} />
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "8px",
              marginTop: "20px",
            }}
          >
            {REVIEWS.map((review, i) => (
              <button
                key={review.name}
                type="button"
                aria-label={`Témoignage ${i + 1}`}
                onClick={() => setActiveIndex(i)}
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  background:
                    i === activeIndex ? landingColors.white : "rgba(255,255,255,0.35)",
                }}
              />
            ))}
          </div>
        </div>
      ) : (
        <div style={{ overflow: "hidden", width: "100%" }}>
          <div className="testimonial-marquee-track">
            {marqueeReviews.map((review, i) => (
              <div
                key={`${review.name}-${i}`}
                style={{
                  flexShrink: 0,
                  width: "300px",
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "12px",
                  padding: "20px",
                  boxSizing: "border-box",
                }}
              >
                <p style={{ margin: 0, fontSize: "14px", lineHeight: 1.55, color: landingColors.white }}>
                  &ldquo;{review.quote}&rdquo;
                </p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginTop: "16px",
                    paddingTop: "16px",
                    borderTop: "1px solid rgba(255,255,255,0.15)",
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.2)",
                      color: landingColors.white,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      fontWeight: 700,
                    }}
                  >
                    {review.initials}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: landingColors.white }}>
                      {review.name}
                    </p>
                    <p style={{ margin: "2px 0 0", fontSize: "12px", color: "rgba(255,255,255,0.7)" }}>
                      {review.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
