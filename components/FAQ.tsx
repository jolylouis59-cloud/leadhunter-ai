"use client";

import { useState, type ReactNode } from "react";
import { colors, fontFamily } from "@/lib/dashboard-styles";

const MAILTO_LINK_STYLE: React.CSSProperties = {
  color: colors.accent,
  fontWeight: 600,
  textDecoration: "none",
};

const FAQ_ITEMS: { q: string; a: ReactNode }[] = [
  {
    q: "Comment LeadHunter AI trouve mes prospects ?",
    a: "On scanne Reddit, LinkedIn et X en temps réel avec des mots-clés liés à ton produit. Chaque post est analysé par notre IA qui lui attribue un Intent Score de 0 à 100 selon la probabilité d'achat.",
  },
  {
    q: "C'est quoi exactement l'Intent Score ?",
    a: "C'est un score entre 0 et 100 calculé par notre IA. Il mesure à quel point un post indique une intention d'achat réelle. Un score de 90+ signifie que la personne cherche activement une solution comme la tienne maintenant.",
  },
  {
    q: "Est-ce que ça fonctionne pour mon secteur ?",
    a: "LeadHunter fonctionne pour n'importe quel business B2B qui a des clients actifs sur Reddit, LinkedIn ou X. SaaS, agences, freelances, consultants, coaches — si tes clients parlent de leurs problèmes en ligne, on les trouve.",
  },
  {
    q: "Est-ce que mon compte LinkedIn ou X risque d'être banni ?",
    a: "Zéro risque. LeadHunter ne touche pas à ton compte LinkedIn ou X. On détecte les signaux via les APIs officielles des plateformes. C'est toi qui réponds manuellement aux prospects — ton compte reste 100% propre.",
  },
  {
    q: "Combien de temps avant de voir mes premiers leads ?",
    a: "Dès la première connexion. Tu configures ton produit et tes mots-clés en 2 minutes, et les premiers leads apparaissent immédiatement dans ton dashboard.",
  },
  {
    q: "Quelle est la différence avec Lemlist ou Waalaxy ?",
    a: "Lemlist et Waalaxy t'aident à envoyer des messages en masse à froid. LeadHunter détecte les personnes qui expriment un besoin maintenant — tu réponds à chaud, pas à froid. Le taux de conversion est sans comparaison.",
  },
  {
    q: "Est-ce que les réponses générées par l'IA sont personnalisées ?",
    a: "Oui. L'IA analyse le contexte du post, le problème exprimé et ton produit pour générer une réponse ultra-ciblée. Tu peux la modifier avant d'envoyer en 1 clic.",
  },
  {
    q: "Combien de leads puis-je obtenir par mois ?",
    a: "Ça dépend de ton marché et de tes mots-clés. En moyenne nos utilisateurs voient entre 50 et 500 leads qualifiés par mois selon leur secteur.",
  },
  {
    q: "Puis-je tester avant de payer ?",
    a: 'On offre 1 mois gratuit à quelques profils sélectionnés pendant notre phase de lancement. Clique sur "Tenter ma chance" sur la page d\'accueil et réponds à 3 questions. On revient vers toi sous 6 à 12h.',
  },
  {
    q: "Comment fonctionne la facturation ?",
    a: "Abonnement mensuel sans engagement. Tu peux annuler à tout moment depuis ton dashboard, sans frais ni préavis.",
  },
  {
    q: "Est-ce que je peux changer de plan ?",
    a: "Oui, à tout moment depuis tes paramètres. Le changement prend effet immédiatement.",
  },
  {
    q: "Mes données sont-elles sécurisées ?",
    a: "Oui. Toutes tes données sont stockées sur Supabase avec chiffrement. On ne revend jamais tes informations à des tiers.",
  },
  {
    q: "Est-ce que ça marche si je vends des services et pas un logiciel ?",
    a: "Absolument. LeadHunter est utilisé par des freelances, consultants, agences et coaches. Si ton client parle de son problème en ligne, on le détecte.",
  },
  {
    q: "Puis-je configurer plusieurs produits ou cibles ?",
    a: "Oui, depuis la page Paramètres tu peux définir ton produit, ta cible, tes mots-clés et les subreddits à scanner.",
  },
  {
    q: "Est-ce que LeadHunter scanne aussi les commentaires ou seulement les posts ?",
    a: "On scanne les posts ET les commentaires. Un commentaire \"j'ai besoin d'un outil comme ça\" est souvent plus qualifié qu'un post.",
  },
  {
    q: "Combien de temps me prend LeadHunter par jour ?",
    a: "Moins de 15 minutes. Tu ouvres ton dashboard, tu vois les leads du jour classés par score, tu envoies les réponses aux meilleurs. C'est tout.",
  },
  {
    q: "Est-ce que je peux exporter mes leads ?",
    a: "L'export CSV arrive dans la prochaine mise à jour. En attendant, tous tes leads sont visibles et filtrables dans le dashboard.",
  },
  {
    q: "Vous scannez quels subreddits ?",
    a: "Tu choisis toi-même les subreddits dans tes paramètres. On te suggère des subreddits pertinents selon ton secteur au moment de la configuration.",
  },
  {
    q: "C'est quoi la différence entre le plan Starter et Growth ?",
    a: "Starter (49€/mois) : 300 leads/mois, scan Reddit. Growth (99€/mois) : 1000 leads/mois, scan Reddit + X + LinkedIn, alertes email. Agency (199€/mois) : illimité, 5 workspaces, API access.",
  },
  {
    q: "Comment vous contacter ?",
    a: (
      <>
        Écrivez-nous à{" "}
        <a href="mailto:contact@leadhunterai.fr" style={MAILTO_LINK_STYLE}>
          contact@leadhunterai.fr
        </a>
        , on répond rapidement.
      </>
    ),
  },
];

function FaqItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      style={{
        borderBottom: `1px solid ${colors.border}`,
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          padding: "20px 0",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          fontFamily,
        }}
      >
        <span
          style={{
            fontSize: "15px",
            fontWeight: 600,
            color: colors.text,
            lineHeight: 1.4,
          }}
        >
          {question}
        </span>
        <span
          style={{
            flexShrink: 0,
            fontSize: "12px",
            color: colors.accent,
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 250ms ease",
            display: "inline-block",
          }}
          aria-hidden
        >
          ▼
        </span>
      </button>

      <div
        style={{
          maxHeight: isOpen ? "400px" : "0",
          opacity: isOpen ? 1 : 0,
          overflow: "hidden",
          transition: "max-height 300ms ease, opacity 250ms ease, padding 300ms ease",
          paddingBottom: isOpen ? "20px" : "0",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: "14px",
            lineHeight: 1.65,
            color: colors.textMuted,
          }}
        >
          {answer}
        </p>
      </div>
    </div>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  function handleToggle(index: number) {
    setOpenIndex((prev) => (prev === index ? null : index));
  }

  return (
    <section
      id="faq"
      style={{
        background: colors.bg,
        padding: "64px 24px",
        fontFamily,
      }}
    >
      <div style={{ maxWidth: "720px", margin: "0 auto" }}>
        <h2
          style={{
            margin: "0 0 32px",
            textAlign: "center",
            fontSize: "clamp(24px, 4vw, 36px)",
            fontWeight: 800,
            color: colors.text,
            letterSpacing: "-0.02em",
          }}
        >
          Questions fréquentes
        </h2>

        <div
          style={{
            background: colors.card,
            border: `1px solid ${colors.border}`,
            borderRadius: "12px",
            padding: "8px 24px",
          }}
        >
          {FAQ_ITEMS.map((item, index) => (
            <FaqItem
              key={item.q}
              question={item.q}
              answer={item.a}
              isOpen={openIndex === index}
              onToggle={() => handleToggle(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
