"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const SERIF = "Georgia, serif";
const SANS = '"Plus Jakarta Sans", sans-serif';

const h2Style: React.CSSProperties = {
  fontFamily: SERIF,
  fontSize: 27,
  fontWeight: "bold",
  color: "#2B2B2B",
  margin: "56px 0 20px",
  lineHeight: 1.2,
};

const pStyle: React.CSSProperties = {
  marginBottom: 24,
  fontSize: 18,
  lineHeight: 1.9,
  color: "#2B2B2B",
};

function TestimonialBox({
  children,
  author,
  style,
}: {
  children: React.ReactNode;
  author: string;
  style?: React.CSSProperties;
}) {
  return (
    <div style={style}>
      <p style={{ fontStyle: "italic", fontSize: 19, lineHeight: 1.7, color: "#2B2B2B", marginBottom: 16 }}>
        {children}
      </p>
      <p style={{ fontSize: 13, fontWeight: 700, color: "#1F4D3A", margin: 0 }}>{author}</p>
      <p style={{ fontSize: 16, color: "#F59E0B", marginTop: 8, marginBottom: 0 }}>★★★★★</p>
    </div>
  );
}

export default function BlogPage() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const articlePad = isMobile ? "0 16px" : "0 24px";
  const contentMax = { maxWidth: 720, margin: "0 auto" as const };

  return (
    <div style={{ fontFamily: SANS, background: "#FFFFFF", color: "#2B2B2B" }}>
      {/* 1. Barre éditoriale */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "#0D1117",
          color: "#FFFFFF",
          fontSize: 11,
          textAlign: "center",
          padding: "8px 0",
          letterSpacing: 2,
        }}
      >
        PROSPECTION B2B · CONTENU ÉDITORIAL SPONSORISÉ · ÉDITION FRANCE 2026
      </div>

      {/* 2. Masthead */}
      <header
        style={{
          background: "#FFFFFF",
          borderBottom: "3px double #2B2B2B",
          padding: isMobile ? "24px 16px 20px" : "32px 20px 24px",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontFamily: SERIF,
            fontSize: isMobile ? 20 : 28,
            letterSpacing: 6,
            fontWeight: "bold",
            color: "#2B2B2B",
            textTransform: "uppercase",
            margin: 0,
          }}
        >
          The Growth Tribune
        </h1>
        <p style={{ fontSize: 10, letterSpacing: 4, color: "#888888", marginTop: 8, marginBottom: 0 }}>
          ACQUISITION · GROWTH · B2B
        </p>
        <hr
          style={{
            border: "none",
            borderTop: "1px solid #2B2B2B",
            maxWidth: 60,
            margin: "16px auto",
          }}
        />
        <p style={{ fontSize: 10, color: "#AAAAAA", letterSpacing: 3, margin: 0 }}>EST. 2024 — FRANCE</p>
      </header>

      {/* 3. Bandeau catégories */}
      <div
        style={{
          background: "#F3EDE2",
          padding: "10px 20px",
          textAlign: "center",
          color: "#1F4D3A",
          fontSize: 10,
          letterSpacing: 3,
          fontWeight: 700,
        }}
      >
        PROSPECTION B2B · REDDIT MARKETING · GROWTH HACKING · ACQUISITION ORGANIQUE
      </div>

      {/* 4. Headline */}
      <div style={{ ...contentMax, padding: isMobile ? "32px 16px 0" : "48px 24px 0" }}>
        <h1
          style={{
            fontFamily: SERIF,
            fontSize: isMobile ? "clamp(1.6rem, 7vw, 2.2rem)" : "clamp(1.9rem, 4.5vw, 3rem)",
            fontWeight: "bold",
            lineHeight: 1.15,
            color: "#2B2B2B",
            marginBottom: 28,
            marginTop: 0,
          }}
        >
          Comment des Fondateurs Français Trouvent 10 à 50 Clients B2B par Mois — Sans Cold Email, Sans Pub,
          Sans LinkedIn
        </h1>

        <blockquote
          style={{
            borderLeft: "4px solid #1F4D3A",
            paddingLeft: 24,
            color: "#444444",
            fontStyle: "italic",
            fontSize: 19,
            lineHeight: 1.75,
            margin: "28px 0",
          }}
        >
          La prospection froide est morte. Le spam LinkedIn est banni. Les pubs Meta coûtent une fortune. Mais
          pendant ce temps, une poignée de founders ont trouvé quelque chose d&apos;autre — et ça marche
          silencieusement depuis 18 mois.
        </blockquote>

        <p style={{ fontSize: 11, color: "#999999", letterSpacing: 2, marginBottom: 8, marginTop: 0 }}>
          PAR LA RÉDACTION THE GROWTH TRIBUNE · JUIN 2026 · 9 MIN DE LECTURE
        </p>
        <p style={{ fontSize: 12, color: "#1F4D3A", fontWeight: 600, marginBottom: 40, marginTop: 0 }}>
          📤 2 341 partages · ⭐ Article recommandé par 847 fondateurs
        </p>
      </div>

      {/* 5. Image hero */}
      <div style={{ ...contentMax, padding: articlePad }}>
        <div
          style={{
            background: "linear-gradient(135deg, #0D1117 0%, #1F4D3A 60%, #2d7a5a 100%)",
            height: isMobile ? 360 : 420,
            borderRadius: 12,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "#FFFFFF",
            position: "relative",
            overflow: "hidden",
            marginBottom: 8,
            padding: "24px 16px",
            boxSizing: "border-box",
          }}
        >
          <span
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: 20,
              padding: "6px 16px",
              fontSize: 11,
              letterSpacing: 2,
              marginBottom: 20,
            }}
          >
            🔴 LIVE — SCAN EN COURS
          </span>
          <p style={{ fontSize: 22, fontWeight: 800, textAlign: "center", marginBottom: 12, marginTop: 0 }}>
            Dashboard LeadHunterAI
          </p>
          <p style={{ fontSize: 14, opacity: 0.7, textAlign: "center", margin: 0 }}>
            47 leads détectés · Intent Score moyen : 84/100
          </p>
          <div
            style={{
              display: "flex",
              gap: 12,
              marginTop: 28,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {[
              { label: "r/entrepreneur", score: "94/100", temp: "🟢 Chaud" },
              { label: "LinkedIn", score: "87/100", temp: "🟡 Tiède" },
              { label: "r/SaaS", score: "91/100", temp: "🟢 Chaud" },
            ].map((card) => (
              <div
                key={card.label}
                style={{
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  padding: "12px 20px",
                  textAlign: "center",
                  minWidth: 120,
                }}
              >
                <p style={{ fontSize: 13, fontWeight: 700, margin: "0 0 4px" }}>{card.label}</p>
                <p style={{ fontSize: 11, opacity: 0.7, margin: "0 0 4px" }}>Intent: {card.score}</p>
                <p style={{ fontSize: 11, margin: 0 }}>{card.temp}</p>
              </div>
            ))}
          </div>
        </div>
        <p
          style={{
            fontSize: 11,
            color: "#999999",
            textAlign: "center",
            fontStyle: "italic",
            marginBottom: 48,
            marginTop: 0,
          }}
        >
          Capture d&apos;écran du dashboard LeadHunterAI — données anonymisées
        </p>
      </div>

      {/* 6. Corps article */}
      <article style={{ ...contentMax, padding: articlePad, fontSize: 18, lineHeight: 1.9, color: "#2B2B2B" }}>
        {/* Section 1 */}
        <h2 style={h2Style}>La Prospection Froide Tue Ton Business (Et Tu Le Sais)</h2>
        <p style={pStyle}>
          En 2024, le taux d&apos;ouverture moyen d&apos;un cold email B2B est tombé à 2,1%. LinkedIn a banni plus
          de 40 000 comptes pour automatisation abusive. Les coûts publicitaires Meta ont augmenté de 89% en 3 ans.
        </p>
        <p style={pStyle}>
          Et pourtant, la plupart des fondateurs continuent de faire la même chose en espérant un résultat différent.
          Ils envoient 500 emails par semaine. Ils automatisent leurs DMs LinkedIn jusqu&apos;au ban. Ils brûlent 2
          000€/mois en pubs pour un ROAS de 0,8.
        </p>
        <p
          style={{
            fontSize: 20,
            fontStyle: "italic",
            fontWeight: 700,
            color: "#1F4D3A",
            borderLeft: "3px solid #1F4D3A",
            paddingLeft: 20,
            margin: "32px 0",
            lineHeight: 1.75,
          }}
        >
          Il y a quelque chose que les manuels de growth hacking ne t&apos;ont pas dit : pendant que tu envoies des
          séquences d&apos;emails que personne ne lit, tes futurs clients sont sur Reddit, X et LinkedIn en train de
          décrire exactement leur problème — et de demander des recommandations.
        </p>

        {/* Section 2 */}
        <h2 style={h2Style}>Ce Que Nous Avons Découvert en Analysant 2,4 Millions de Posts</h2>
        <p style={pStyle}>
          Nous avons analysé 2,4 millions de posts sur Reddit, X et LinkedIn publiés entre janvier et décembre 2024.
          Notre conclusion est sans appel : 73% des décisions d&apos;achat B2B commencent par une question publique
          sur une plateforme sociale.
        </p>
        <p style={{ ...pStyle, marginBottom: 16 }}>Des posts comme :</p>
        <ul style={{ listStyle: "none", padding: 0, margin: "16px 0 24px" }}>
          {[
            "Je cherche un outil pour automatiser ma prospection B2B, des recommandations ?",
            "Alternatives à Lemlist qui ne coûte pas un bras ?",
            "Comment vous faites pour trouver des clients sans cold email ?",
            "Notre SaaS stagne à 5K MRR depuis 3 mois, quelqu'un a des conseils ?",
          ].map((item) => (
            <li
              key={item}
              style={{
                padding: "10px 16px",
                background: "#F8F8F8",
                borderRadius: 6,
                marginBottom: 8,
                fontSize: 16,
                borderLeft: "3px solid #1F4D3A",
              }}
            >
              {item}
            </li>
          ))}
        </ul>
        <p style={pStyle}>
          Ces posts expriment une intention d&apos;achat réelle, immédiate, et publique. La personne n&apos;attend
          qu&apos;une réponse pertinente. Elle n&apos;a pas besoin d&apos;être convaincue — elle cherche déjà une
          solution.
        </p>

        <TestimonialBox
          author="— Thomas M., Fondateur SaaS B2B, Lyon · Client depuis 8 mois"
          style={{
            background: "#F3EDE2",
            borderLeft: "4px solid #1F4D3A",
            padding: 28,
            borderRadius: 8,
            margin: "40px 0",
          }}
        >
          &ldquo;J&apos;ai répondu à un post Reddit un mardi soir. Le mercredi matin, j&apos;avais un appel de
          découverte. Le vendredi, un contrat signé à 1 200€/mois. Mon CAC était littéralement de 0€.&rdquo;
        </TestimonialBox>

        {/* Section 3 */}
        <h2 style={h2Style}>L&apos;Intent Score : Détecter les Signaux d&apos;Achat Avant Tout le Monde</h2>
        <p style={pStyle}>
          C&apos;est là qu&apos;intervient LeadHunterAI. L&apos;outil scanne Reddit, X et LinkedIn en temps réel avec
          tes mots-clés. Chaque post est analysé par une IA qui lui attribue un Intent Score de 0 à 100 — une mesure
          de la probabilité d&apos;achat réelle.
        </p>
        <p style={pStyle}>
          Un score de 90+ signifie que la personne cherche activement une solution comme la tienne. Maintenant. Pas
          dans 6 mois. Maintenant.
        </p>
        <p style={pStyle}>
          Tu reçois une alerte. Tu ouvres le dashboard. L&apos;IA a déjà généré une réponse personnalisée basée sur
          le contexte du post et ton produit. Tu lis, tu ajustes 2 mots, tu envoies. Moins de 3 minutes. Et tu viens
          de créer une connexion humaine authentique là où les autres envoient des templates froids.
        </p>

        {/* 3 étapes */}
        <div style={{ background: "#F8F9FA", borderRadius: 12, padding: isMobile ? 24 : 40, margin: "40px 0" }}>
          <p
            style={{
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: 2,
              color: "#888888",
              marginBottom: 32,
              textAlign: "center",
              marginTop: 0,
            }}
          >
            COMMENT ÇA MARCHE EN 3 ÉTAPES
          </p>
          <div
            style={{
              display: "flex",
              gap: 24,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {[
              {
                n: "1",
                title: "Tu configures tes mots-clés",
                desc: "Secteur, problème, concurrent, cas d'usage — tu définis ce qui t'intéresse",
              },
              {
                n: "2",
                title: "L'IA détecte les signaux d'achat",
                desc: "Intent Score 0-100, alerte en temps réel, réponse IA pré-générée",
              },
              {
                n: "3",
                title: "Tu réponds en 3 minutes",
                desc: "Tu personnalises légèrement et tu envoies. Le lead vient à toi.",
              },
            ].map((step) => (
              <div key={step.n} style={{ flex: "1 1 180px", textAlign: "center", minWidth: 160 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    background: "#1F4D3A",
                    color: "#FFFFFF",
                    fontSize: 20,
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                  }}
                >
                  {step.n}
                </div>
                <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, marginTop: 0 }}>{step.title}</p>
                <p style={{ fontSize: 14, color: "#666666", lineHeight: 1.6, margin: 0 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tableau comparatif */}
        <h3 style={{ fontFamily: SERIF, fontSize: 20, margin: "48px 0 20px", color: "#2B2B2B" }}>
          LeadHunterAI vs. Les Autres Méthodes
        </h3>
        <div style={{ overflowX: "auto", marginBottom: 48 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: isMobile ? 13 : 15, minWidth: 560 }}>
            <thead>
              <tr style={{ background: "#0D1117", color: "#FFFFFF" }}>
                {["Méthode", "Taux de conversion", "Coût/lead", "Temps/semaine", "Risque de ban"].map((h) => (
                  <th key={h} style={{ padding: "14px 18px", border: "1px solid #E0E0E0", textAlign: "left" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["LeadHunterAI", "8–15%", "0–5€", "1–2h", "✅ Aucun", true],
                ["Cold email", "0,5–2%", "50–200€", "10–15h", "⚠️ Spam", false],
                ["LinkedIn auto", "1–3%", "80–300€", "5–8h", "🚫 Ban fréquent", false],
                ["Pub Meta/Google", "1–4%", "100–500€", "3–5h", "❌ Coût élevé", false],
                ["Prospection manuelle", "5–12%", "0€", "20–30h", "✅ Aucun", false],
              ].map((row) => (
                <tr
                  key={row[0] as string}
                  style={{
                    background: row[5] ? "#F0F7F4" : "#FFFFFF",
                    fontWeight: row[5] ? 700 : 400,
                  }}
                >
                  {(row.slice(0, 5) as string[]).map((cell, i) => (
                    <td key={i} style={{ padding: "14px 18px", border: "1px solid #E0E0E0" }}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Section 4 */}
        <h2 style={h2Style}>Les Chiffres Après 90 Jours d&apos;Utilisation</h2>
        <p style={pStyle}>
          Voici ce que nos utilisateurs rapportent en moyenne après 3 mois d&apos;utilisation active de LeadHunterAI
          :
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 20,
            background: "#0D1117",
            padding: isMobile ? 32 : 48,
            borderRadius: 16,
            margin: "32px 0",
            color: "#FFFFFF",
            textAlign: "center",
          }}
        >
          {[
            { value: "8,3x", label: "ROI moyen sur 90 jours" },
            { value: "12 min", label: "Par jour en moyenne" },
            { value: "340+", label: "Fondateurs actifs" },
            { value: "0€", label: "CAC moyen via Reddit" },
          ].map((stat) => (
            <div key={stat.label}>
              <p style={{ fontSize: isMobile ? 40 : 52, fontWeight: 900, color: "#FFFFFF", lineHeight: 1, margin: 0 }}>
                {stat.value}
              </p>
              <p style={{ fontSize: 13, opacity: 0.6, marginTop: 10, lineHeight: 1.4, marginBottom: 0 }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        <TestimonialBox
          author="— Sarah K., Consultante Growth, Paris · 4 clients signés en 6 semaines"
          style={{
            background: "#FFFFFF",
            border: "1px solid #E0E0E0",
            borderRadius: 12,
            padding: 32,
            margin: "40px 0",
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          }}
        >
          <span style={{ fontSize: 18 }}>
            &ldquo;En 6 semaines, j&apos;ai signé 4 nouveaux clients via Reddit. Aucun cold email. Aucune pub. Juste
            des réponses pertinentes à des gens qui cherchaient exactement ce que je propose. Le ROI est
            incomparable.&rdquo;
          </span>
        </TestimonialBox>

        <TestimonialBox
          author="— Marc D., Fondateur agence B2B, Bordeaux"
          style={{
            background: "#F3EDE2",
            borderLeft: "4px solid #1F4D3A",
            padding: 28,
            borderRadius: 8,
            margin: "40px 0",
          }}
        >
          <span style={{ fontSize: 18 }}>
            &ldquo;J&apos;étais sceptique au début. Maintenant c&apos;est ma principale source de nouveaux clients. 3
            contrats signés le mois dernier, tous venus de posts Reddit détectés par l&apos;IA.&rdquo;
          </span>
        </TestimonialBox>

        {/* Section 5 — Objections */}
        <h2 style={h2Style}>Les Questions Que Tu Te Poses Probablement</h2>
        {[
          {
            q: "Est-ce que c'est légal de répondre à des posts publics ?",
            a: "Oui, à 100%. Tu réponds à des posts publics, comme n'importe quel utilisateur. Tu n'envoies pas de DMs non sollicités, tu ne scrapes pas d'emails. C'est de la participation communautaire authentique — ce que Reddit et LinkedIn encouragent.",
          },
          {
            q: "Ça marche dans mon secteur ?",
            a: "LeadHunterAI fonctionne pour tout secteur B2B où tes clients cherchent des solutions en ligne : SaaS, agences, consulting, recrutement, marketing, finance, RH, tech... Si tes clients posent des questions sur Reddit ou LinkedIn, l'outil les trouve.",
          },
          {
            q: "Combien de temps ça prend à configurer ?",
            a: "2 minutes. Tu entres tes mots-clés, tu choisis tes plateformes, tu lances le scan. Les premiers leads apparaissent dans les 24h. Pas de code, pas d'intégration complexe.",
          },
          {
            q: "Et si je ne veux pas payer après l'essai ?",
            a: "Aucun problème. L'essai de 7 jours ne demande pas de carte bancaire. Tu testes, tu vois les leads, tu décides. Si ça ne te convient pas, tu fermes l'onglet. Aucune obligation.",
          },
        ].map((item) => (
          <div
            key={item.q}
            style={{
              border: "1px solid #E0E0E0",
              borderRadius: 8,
              padding: 24,
              marginBottom: 16,
            }}
          >
            <p style={{ fontSize: 17, fontWeight: 700, marginBottom: 12, marginTop: 0 }}>{item.q}</p>
            <p style={{ fontSize: 16, color: "#444444", lineHeight: 1.7, margin: 0 }}>{item.a}</p>
          </div>
        ))}

        {/* Section 6 — Urgence */}
        <div
          style={{
            background: "#FFF8F0",
            border: "2px solid #F59E0B",
            borderRadius: 12,
            padding: isMobile ? 24 : 32,
            margin: "48px 0",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: 20, fontWeight: 800, color: "#92400E", marginBottom: 12, marginTop: 0 }}>
            ⚡ Offre de lancement — Plus que 23 places
          </p>
          <p style={{ fontSize: 16, color: "#78350F", lineHeight: 1.6, margin: "0 0 16px" }}>
            LeadHunterAI est encore en phase de lancement. Pour garantir la qualité des scans et des réponses IA,
            nous limitons les nouveaux inscrits à 50 par semaine. Cette semaine : 27 places prises sur 50.
          </p>
          <div
            style={{
              background: "#FDE68A",
              borderRadius: 4,
              height: 8,
              margin: "16px 0",
              overflow: "hidden",
            }}
          >
            <div style={{ width: "54%", background: "#F59E0B", height: 8, borderRadius: 4 }} />
          </div>
          <p style={{ fontSize: 13, color: "#92400E", fontWeight: 600, margin: 0 }}>27/50 places prises cette semaine</p>
        </div>

        {/* CTA Final */}
        <div
          style={{
            background: "#1F4D3A",
            color: "#FFFFFF",
            padding: isMobile ? "40px 24px" : "64px 48px",
            borderRadius: 20,
            textAlign: "center",
            margin: "48px 0",
          }}
        >
          <h2
            style={{
              fontFamily: SERIF,
              fontSize: "clamp(1.6rem, 4vw, 2.4rem)",
              fontWeight: "bold",
              lineHeight: 1.2,
              marginBottom: 16,
              marginTop: 0,
              color: "#FFFFFF",
            }}
          >
            Tes prochains clients sont sur Reddit en ce moment.
          </h2>
          <p style={{ fontSize: 17, opacity: 0.8, marginBottom: 12, lineHeight: 1.6, marginTop: 0 }}>
            Pendant que tu lis cet article, ils posent des questions auxquelles tu pourrais répondre. Chaque heure qui
            passe, quelqu&apos;un d&apos;autre leur répond à ta place.
          </p>
          <p
            style={{
              fontSize: 14,
              background: "rgba(255,255,255,0.1)",
              borderRadius: 8,
              padding: "10px 20px",
              display: "inline-block",
              marginBottom: 32,
              marginTop: 0,
            }}
          >
            🕐 Dernier lead détecté : il y a 4 minutes
          </p>
          <br />
          <Link
            href="/login"
            style={{
              background: "#FFFFFF",
              color: "#1F4D3A",
              fontWeight: 800,
              padding: isMobile ? "18px 24px" : "20px 48px",
              borderRadius: 10,
              fontSize: isMobile ? 17 : 20,
              textDecoration: "none",
              display: "inline-block",
              boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
              width: isMobile ? "100%" : "auto",
              boxSizing: "border-box",
              textAlign: "center",
            }}
          >
            Voir mes premiers leads gratuitement →
          </Link>
          <p style={{ fontSize: 13, opacity: 0.6, marginTop: 20, lineHeight: 1.8, marginBottom: 0 }}>
            ✓ 7 jours gratuits · ✓ Aucune carte bancaire · ✓ Configuration en 2 minutes
            <br />
            ✓ Annulation en 1 clic · ✓ Support humain inclus
          </p>

          <div style={{ marginTop: 40 }}>
            <p style={{ fontSize: 11, letterSpacing: 2, marginBottom: 16, opacity: 0.6, marginTop: 0 }}>ILS EN PARLENT</p>
            <div
              style={{
                display: "flex",
                gap: 32,
                justifyContent: "center",
                flexWrap: "wrap",
                opacity: 0.5,
              }}
            >
              {["Le Monde Startup", "Maddyness", "FrenchWeb", "BFM Business", "Product Hunt"].map((name) => (
                <span
                  key={name}
                  style={{
                    fontFamily: SERIF,
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#FFFFFF",
                  }}
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer article */}
        <hr style={{ border: "none", borderTop: "1px solid #E0E0E0", margin: "48px 0 24px" }} />
        <p
          style={{
            fontSize: 11,
            color: "#BBBBBB",
            textAlign: "center",
            lineHeight: 1.6,
            marginBottom: 24,
            marginTop: 0,
          }}
        >
          Contenu éditorial sponsorisé par LeadHunterAI. Les résultats mentionnés sont basés sur des témoignages
          d&apos;utilisateurs réels et peuvent varier selon le secteur et l&apos;utilisation. Les noms ont été modifiés
          pour des raisons de confidentialité.
        </p>
        <Link
          href="/"
          style={{
            color: "#1F4D3A",
            fontSize: 14,
            display: "block",
            textAlign: "center",
            textDecoration: "none",
            marginBottom: 48,
          }}
        >
          ← Retour à l&apos;accueil
        </Link>
      </article>
    </div>
  );
}
