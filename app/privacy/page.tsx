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

export default function PrivacyPage() {
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
          Politique de confidentialité
        </h1>
        <p style={{ ...paragraph, marginBottom: "24px" }}>
          Conforme au RGPD — Dernière mise à jour : mars 2026
        </p>

        <div
          style={{
            background: colors.card,
            border: `1px solid ${colors.border}`,
            borderRadius: "12px",
            padding: "32px 28px",
          }}
        >
          <h2 style={{ ...sectionTitle, marginTop: 0 }}>1. Responsable du traitement</h2>
          <p style={paragraph}>
            LeadHunter AI<br />
            Email : contact@leadhunterai.fr<br />
            Contact DPO : contact@leadhunterai.fr
          </p>

          <h2 style={sectionTitle}>2. Données collectées</h2>
          <p style={paragraph}>Nous collectons les données suivantes :</p>
          <ul style={{ ...paragraph, paddingLeft: "20px" }}>
            <li>Identité : prénom, nom</li>
            <li>Contact : adresse email, numéro de téléphone (optionnel)</li>
            <li>Compte : identifiant utilisateur, mot de passe chiffré</li>
            <li>Usage : configuration scanner, leads détectés, logs d&apos;activité</li>
            <li>Paiement : données de facturation via Stripe (nous ne stockons pas vos coordonnées bancaires)</li>
            <li>Formulaires : messages de contact, candidatures « Tenter ma chance »</li>
          </ul>

          <h2 style={sectionTitle}>3. Finalités et bases légales</h2>
          <ul style={{ ...paragraph, paddingLeft: "20px" }}>
            <li>
              <strong>Exécution du contrat</strong> — fourniture du service, gestion du compte,
              facturation
            </li>
            <li>
              <strong>Consentement</strong> — cookies non essentiels, candidatures marketing,
              communications commerciales
            </li>
            <li>
              <strong>Intérêt légitime</strong> — amélioration du service, sécurité, prévention de la
              fraude
            </li>
          </ul>

          <h2 style={sectionTitle}>4. Durée de conservation</h2>
          <ul style={{ ...paragraph, paddingLeft: "20px" }}>
            <li>Données de compte : durée de l&apos;abonnement + 3 ans après résiliation</li>
            <li>Données de facturation : 10 ans (obligations comptables)</li>
            <li>Logs techniques : 12 mois maximum</li>
            <li>Candidatures « Tenter ma chance » : 12 mois</li>
            <li>Messages de contact : 24 mois</li>
          </ul>

          <h2 style={sectionTitle}>5. Destinataires des données</h2>
          <p style={paragraph}>
            Vos données peuvent être traitées par nos sous-traitants : Supabase (hébergement base de
            données), Vercel (hébergement application), Stripe (paiement), Anthropic (scoring IA).
            Ces prestataires sont soumis à des obligations contractuelles de confidentialité et de
            sécurité conformes au RGPD.
          </p>

          <h2 style={sectionTitle}>6. Transferts hors UE</h2>
          <p style={paragraph}>
            Certains sous-traitants peuvent être situés hors de l&apos;Union européenne. Dans ce cas,
            des garanties appropriées sont mises en place (clauses contractuelles types de la
            Commission européenne).
          </p>

          <h2 style={sectionTitle}>7. Vos droits</h2>
          <p style={paragraph}>
            Conformément au RGPD, vous disposez des droits suivants :
          </p>
          <ul style={{ ...paragraph, paddingLeft: "20px" }}>
            <li>Droit d&apos;accès à vos données</li>
            <li>Droit de rectification</li>
            <li>Droit à l&apos;effacement (« droit à l&apos;oubli »)</li>
            <li>Droit à la limitation du traitement</li>
            <li>Droit à la portabilité</li>
            <li>Droit d&apos;opposition</li>
            <li>Droit de retirer votre consentement à tout moment</li>
          </ul>
          <p style={paragraph}>
            Pour exercer vos droits : contact@leadhunterai.fr. Réponse sous 30 jours. Vous pouvez
            également introduire une réclamation auprès de la CNIL (www.cnil.fr).
          </p>

          <h2 style={sectionTitle}>8. Cookies</h2>
          <p style={paragraph}>Nous utilisons les cookies suivants :</p>
          <ul style={{ ...paragraph, paddingLeft: "20px" }}>
            <li>
              <strong>Cookies essentiels</strong> — session d&apos;authentification Supabase
              (obligatoires au fonctionnement)
            </li>
            <li>
              <strong>Cookies de préférence</strong> — consentement cookies (localStorage :
              cookie_consent)
            </li>
            <li>
              <strong>Cookies analytiques</strong> — uniquement si vous avez accepté via la bannière
              cookies
            </li>
          </ul>
          <p style={paragraph}>
            Vous pouvez modifier votre choix à tout moment en supprimant le cookie_consent de votre
            navigateur et en rechargeant la page.
          </p>

          <h2 style={sectionTitle}>9. Sécurité</h2>
          <p style={paragraph}>
            Nous mettons en œuvre des mesures techniques et organisationnelles appropriées :
            chiffrement HTTPS, Row Level Security sur Supabase, accès restreint aux données,
            authentification sécurisée.
          </p>

          <h2 style={sectionTitle}>10. Contact</h2>
          <p style={paragraph}>
            Pour toute question relative à cette politique : contact@leadhunterai.fr ou via notre{" "}
            <Link href="/contact" style={{ color: colors.accent }}>
              page de contact
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
