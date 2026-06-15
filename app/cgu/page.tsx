import Link from "next/link";
import { colors, fontFamily } from "@/lib/dashboard-styles";

const sectionTitle: React.CSSProperties = {
  fontSize: "18px",
  fontWeight: 700,
  color: colors.text,
  margin: "32px 0 12px",
};

const paragraph: React.CSSProperties = {
  margin: "0 0 12px",
  fontSize: "14px",
  lineHeight: 1.7,
  color: colors.textMuted,
};

export default function CguPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: colors.bg,
        fontFamily,
        padding: "48px 24px 80px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ maxWidth: "720px", margin: "0 auto" }}>
        <Link
          href="/"
          style={{
            fontSize: "14px",
            fontWeight: 600,
            color: colors.accent,
            textDecoration: "none",
          }}
        >
          ← Retour à l&apos;accueil
        </Link>

        <h1
          style={{
            margin: "24px 0 8px",
            fontSize: "32px",
            fontWeight: 800,
            color: colors.text,
            letterSpacing: "-0.02em",
          }}
        >
          Conditions Générales d&apos;Utilisation
        </h1>
        <p style={{ ...paragraph, marginBottom: "24px" }}>
          Dernière mise à jour : mars 2026 — LeadHunter AI — contact@leadhunterai.fr
        </p>

        <div
          style={{
            background: colors.card,
            border: `1px solid ${colors.border}`,
            borderRadius: "12px",
            padding: "32px 28px",
          }}
        >
          <h2 style={{ ...sectionTitle, marginTop: 0 }}>1. Objet</h2>
          <p style={paragraph}>
            Les présentes Conditions Générales d&apos;Utilisation (CGU) régissent l&apos;accès et
            l&apos;utilisation de la plateforme LeadHunter AI, un service SaaS B2B de détection de
            prospects et de génération de réponses sur Reddit, X et LinkedIn. En créant un compte ou
            en utilisant le service, vous acceptez sans réserve les présentes CGU.
          </p>

          <h2 style={sectionTitle}>2. Éditeur du service</h2>
          <p style={paragraph}>
            LeadHunter AI<br />
            SIRET : 94292551200017<br />
            Siège social : Faches-Thumesnil, France<br />
            Email : contact@leadhunterai.fr
          </p>

          <h2 style={sectionTitle}>3. Accès et inscription</h2>
          <p style={paragraph}>
            L&apos;accès au service nécessite la création d&apos;un compte avec une adresse email
            valide. Vous vous engagez à fournir des informations exactes et à maintenir la
            confidentialité de vos identifiants. Toute activité réalisée depuis votre compte est
            réputée effectuée par vous.
          </p>

          <h2 style={sectionTitle}>4. Description du service</h2>
          <p style={paragraph}>
            LeadHunter AI permet de configurer des mots-clés et des cibles, de scanner des
            plateformes sociales, d&apos;attribuer un Intent Score aux publications détectées et de
            générer des réponses personnalisées. Les fonctionnalités disponibles dépendent du plan
            souscrit.
          </p>

          <h2 style={sectionTitle}>5. Abonnements et tarifs</h2>
          <p style={paragraph}>
            Les offres sont proposées sous forme d&apos;abonnement mensuel, hors taxes (HT) :
          </p>
          <ul style={{ ...paragraph, paddingLeft: "20px" }}>
            <li>Starter : 49 € HT / mois — 300 leads / mois</li>
            <li>Growth : 99 € HT / mois — 1 000 leads / mois</li>
            <li>Agency : 199 € HT / mois — leads illimités</li>
          </ul>
          <p style={paragraph}>
            La TVA applicable est calculée selon le pays du client au moment du paiement. Le
            paiement est effectué via Stripe. L&apos;abonnement est renouvelé automatiquement chaque
            mois jusqu&apos;à résiliation.
          </p>

          <h2 style={sectionTitle}>6. Propriété intellectuelle</h2>
          <p style={paragraph}>
            LeadHunter AI, son logo, son interface, ses algorithmes et l&apos;ensemble de ses
            contenus sont protégés par le droit de la propriété intellectuelle. Aucune reproduction,
            modification ou exploitation commerciale n&apos;est autorisée sans accord écrit préalable.
            Les données que vous importez ou générez restent votre propriété.
          </p>

          <h2 style={sectionTitle}>7. Utilisation acceptable</h2>
          <p style={paragraph}>
            Vous vous engagez à utiliser le service conformément aux lois en vigueur et aux
            conditions d&apos;utilisation des plateformes tierces (Reddit, X, LinkedIn). Tout usage
            abusif, spam, ou contournement des limites techniques peut entraîner la suspension du
            compte sans remboursement.
          </p>

          <h2 style={sectionTitle}>8. Limitation de responsabilité</h2>
          <p style={paragraph}>
            LeadHunter AI est fourni « en l&apos;état ». Nous ne garantissons pas un nombre minimum
            de leads ni un taux de conversion. Notre responsabilité est limitée au montant des
            sommes versées au cours des douze (12) derniers mois. Nous ne saurions être tenus
            responsables des dommages indirects, pertes de chiffre d&apos;affaires ou sanctions
            imposées par des plateformes tierces.
          </p>

          <h2 style={sectionTitle}>9. Résiliation</h2>
          <p style={paragraph}>
            Vous pouvez résilier votre abonnement à tout moment depuis votre dashboard. La
            résiliation prend effet à la fin de la période de facturation en cours. LeadHunter AI se
            réserve le droit de suspendre ou résilier un compte en cas de violation des présentes
            CGU, après notification lorsque cela est possible.
          </p>

          <h2 style={sectionTitle}>10. Données personnelles</h2>
          <p style={paragraph}>
            Le traitement de vos données personnelles est décrit dans notre{" "}
            <Link href="/privacy" style={{ color: colors.accent }}>
              Politique de confidentialité
            </Link>
            .
          </p>

          <h2 style={sectionTitle}>11. Modifications</h2>
          <p style={paragraph}>
            LeadHunter AI peut modifier les présentes CGU. Les utilisateurs seront informés de toute
            modification substantielle par email ou via le service. La poursuite de l&apos;utilisation
            vaut acceptation des nouvelles conditions.
          </p>

          <h2 style={sectionTitle}>12. Droit applicable et juridiction</h2>
          <p style={paragraph}>
            Les présentes CGU sont soumises au droit français. En cas de litige, et à défaut de
            résolution amiable, compétence exclusive est attribuée aux tribunaux de Lille,
            nonobstant pluralité de défendeurs ou appel en garantie.
          </p>
        </div>
      </div>
    </div>
  );
}
