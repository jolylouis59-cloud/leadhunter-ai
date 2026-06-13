"use client";

import { useEffect, useState } from "react";
import { colors, fontFamily } from "@/lib/dashboard-styles";

const REVIEWS = [
  {
    name: "Thomas M.",
    role: "Fondateur SaaS",
    initials: "TM",
    avatarBg: "#E8F5E9",
    avatarColor: "#1F4D3A",
    quote:
      "franchement j'étais sceptique au debut mais la j'ai eu 2 rdv qualifiés en une semaine via Reddit. je savais meme pas que mes clients étaient la",
  },
  {
    name: "Sarah L.",
    role: "Solopreneure",
    initials: "SL",
    avatarBg: "#FFF3E0",
    avatarColor: "#E65100",
    quote:
      "Le score d'intention c'est ouf. avant je répondais à tout le monde, maintenant je cible juste les 90+. mon taux de réponse a explosé",
  },
  {
    name: "Karim B.",
    role: "Co-fondateur",
    initials: "KB",
    avatarBg: "#E3F2FD",
    avatarColor: "#1565C0",
    quote:
      "on a remplacé notre SDR junior avec ça. 99€/mois vs 2500€ de salaire... le calcul est vite fait lol",
  },
  {
    name: "Marc D.",
    role: "Agence digitale",
    initials: "MD",
    avatarBg: "#F3E5F5",
    avatarColor: "#7B1FA2",
    quote:
      "ca remplace facilement 3 outils qu'on utilisait avant. ROI positif dès le premier mois, sans exagerer",
  },
  {
    name: "Julie R.",
    role: "Consultante",
    initials: "JR",
    avatarBg: "#FCE4EC",
    avatarColor: "#C2185B",
    quote:
      "jsp comment vous faites mais les leads sont vraiment chauds. j'ai closé mon premier client 3 jours apres l'acces beta",
  },
  {
    name: "Antoine V.",
    role: "Founder B2B",
    initials: "AV",
    avatarBg: "#E0F2F1",
    avatarColor: "#00695C",
    quote:
      "La génération de réponse IA est bluffante. j'ai juste personalisé 2-3 trucs et envoyé. conversion direct",
  },
];

function ReviewCard({
  review,
  style,
}: {
  review: (typeof REVIEWS)[0];
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        flexShrink: 0,
        width: "300px",
        background: colors.card,
        border: `1px solid ${colors.border}`,
        borderRadius: "12px",
        padding: "20px",
        boxSizing: "border-box",
        ...style,
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: "14px",
          lineHeight: 1.55,
          color: colors.textMuted,
        }}
      >
        &ldquo;{review.quote}&rdquo;
      </p>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginTop: "16px",
          paddingTop: "16px",
          borderTop: `1px solid ${colors.border}`,
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            background: review.avatarBg,
            color: review.avatarColor,
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
          <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: colors.text }}>
            {review.name}
          </p>
          <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#9CA3AF" }}>
            {review.role}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Testimonials() {
  const [isMobile, setIsMobile] = useState(false);

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
        background: colors.bg,
        padding: "64px 0",
        fontFamily,
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
        <h2
          style={{
            margin: 0,
            fontSize: "clamp(24px, 4vw, 36px)",
            fontWeight: 800,
            color: colors.text,
            letterSpacing: "-0.02em",
          }}
        >
          Ils ont testé en avant-première — voici leurs avis
        </h2>
        <p
          style={{
            margin: "12px 0 0",
            fontSize: "14px",
            color: colors.textMuted,
            fontStyle: "italic",
          }}
        >
          (Accès bêta fermé — places limitées)
        </p>
      </div>

      {isMobile ? (
        <div
          style={{
            overflowX: "auto",
            WebkitOverflowScrolling: "touch",
            touchAction: "pan-x",
            scrollSnapType: "x mandatory",
            padding: "0 24px 8px",
            display: "flex",
            gap: "16px",
          }}
        >
          {REVIEWS.map((review) => (
            <ReviewCard
              key={review.name}
              review={review}
              style={{ scrollSnapAlign: "start" }}
            />
          ))}
        </div>
      ) : (
        <div style={{ overflow: "hidden", width: "100%" }}>
          <div className="testimonial-marquee-track">
            {marqueeReviews.map((review, i) => (
              <ReviewCard key={`${review.name}-${i}`} review={review} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
