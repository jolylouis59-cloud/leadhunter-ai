export type ResponseGoal =
  | "visit_site"
  | "contact_dm"
  | "book_call"
  | "waitlist"
  | "other";

export type ResponseClosingStyle = "soft" | "direct" | "consultative" | "other";

export type ResponseLinkFrequency = "always" | "if_relevant" | "never";

export type ReplyConfig = {
  product_description: string;
  target: string;
  product_name: string | null;
  response_goal: ResponseGoal | null;
  response_goal_other: string | null;
  response_link: string | null;
  response_closing_style: ResponseClosingStyle | null;
  response_closing_other: string | null;
  response_link_frequency: ResponseLinkFrequency | null;
  offer_description: string | null;
  tone_avoid: string | null;
};

export type ReplyLead = {
  post_title?: string | null;
  title?: string | null;
  post_body?: string | null;
  subreddit?: string | null;
  author?: string | null;
  username?: string | null;
};

const GOAL_INSTRUCTIONS: Record<ResponseGoal, string> = {
  visit_site:
    "Objectif principal : orienter vers le site sans URL publique (chercher le nom de la marque ou proposer le lien en DM).",
  contact_dm:
    "Objectif principal : inviter à te contacter en message privé (DM) pour en savoir plus.",
  book_call:
    "Objectif principal : inviter à réserver un appel ou une démo (sans lien, via DM si besoin).",
  waitlist:
    "Objectif principal : inviter à rejoindre la liste d'attente ou la newsletter (sans URL, via recherche du nom ou DM).",
  other: "",
};

const CLOSING_INSTRUCTIONS: Record<Exclude<ResponseClosingStyle, "other">, string> = {
  soft:
    "Style de closing : doux et discret. Suggestion légère, sans pression. Laisse la porte ouverte sans insister.",
  direct:
    "Style de closing : direct et clair. Appel à l'action explicite mais discret, sans ton vendeur.",
  consultative:
    "Style de closing : consultatif. Pose une question ou propose un échange pour comprendre le besoin avant de suggérer la suite.",
};

const CTA_FREQUENCY_INSTRUCTIONS: Record<ResponseLinkFrequency, string> = {
  always:
    "Fréquence du CTA : tu DOIS mentionner l'offre ou un appel à l'action (chercher le nom ou DM). Jamais d'URL dans le commentaire.",
  if_relevant:
    "Fréquence du CTA : mentionne l'offre ou un appel à l'action uniquement si le contexte du post le rend naturel. Jamais d'URL dans le commentaire.",
  never:
    "Fréquence du CTA : ne fais aucun pitch ni appel à l'action vers l'offre. Jamais d'URL dans le commentaire.",
};

const OFFER_RELEVANCE_PATTERNS = [
  /\b(vs|versus)\b/i,
  /\bcompar(e|r|aison|ons|er|atif)\b/i,
  /\balternative/i,
  /\brecommand/i,
  /\brecommend/i,
  /\bquel\s+(outil|logiciel|saas|tool|software|app)/i,
  /\b(which|best|meilleur(e)?)\s+(outil|tool|software|saas|app)/i,
  /\boutils?\s+(de|pour|for)\b/i,
  /\btools?\s+(for|to)\b/i,
  /\bstack\b/i,
  /\bsubstitut/i,
  /\breplace\b/i,
  /\blooking\s+for\s+(a\s+)?(tool|software|solution)/i,
  /\bcherche\s+(un\s+)?(outil|logiciel|solution)/i,
  /\bsuggestions?\b/i,
  /\bdes\s+recommandations?\b/i,
];

export function isOfferContextRelevant(lead: ReplyLead): boolean {
  const text = `${lead.post_title ?? lead.title ?? ""} ${lead.post_body ?? ""}`;
  return OFFER_RELEVANCE_PATTERNS.some((pattern) => pattern.test(text));
}

/** @deprecated Use isOfferContextRelevant — kept for any external imports */
export function isLinkContextRelevant(lead: ReplyLead): boolean {
  return isOfferContextRelevant(lead);
}

function resolveGoalInstruction(config: ReplyConfig): string {
  const goal = config.response_goal;
  if (!goal) {
    return "Objectif : apporter de la valeur et engager une conversation naturelle.";
  }
  if (goal === "other" && config.response_goal_other?.trim()) {
    return `Objectif principal (personnalisé) : ${config.response_goal_other.trim()}`;
  }
  return GOAL_INSTRUCTIONS[goal] || GOAL_INSTRUCTIONS.visit_site;
}

function resolveGoalPriority(config: ReplyConfig, productName: string): string | null {
  const goal = config.response_goal;
  if (!goal) return null;

  if (goal === "other" && config.response_goal_other?.trim()) {
    return `Respecte cet objectif sans URL publique : ${config.response_goal_other.trim()}`;
  }

  const priorities: Record<ResponseGoal, string> = {
    visit_site: `Oriente vers le site sans URL : propose de chercher « ${productName} » sur Google ou d'envoyer le lien en DM si intéressé.`,
    contact_dm: "Invite à te contacter en DM pour en savoir plus. Pas d'URL dans le commentaire.",
    book_call: "Invite à réserver un appel ou une démo via DM. Pas d'URL dans le commentaire.",
    waitlist:
      "Si tu mentionnes l'offre, invite à chercher le nom ou à DM pour le lien d'inscription waitlist/newsletter. Pas d'URL dans le commentaire.",
    other: "",
  };

  return priorities[goal] || null;
}

function resolveClosingInstruction(config: ReplyConfig): string {
  const style = config.response_closing_style;
  if (!style) {
    return CLOSING_INSTRUCTIONS.soft;
  }
  if (style === "other" && config.response_closing_other?.trim()) {
    return `Style de closing (personnalisé) : ${config.response_closing_other.trim()}`;
  }
  if (style === "other") {
    return CLOSING_INSTRUCTIONS.soft;
  }
  return CLOSING_INSTRUCTIONS[style];
}

function resolveClosingPriority(config: ReplyConfig): string | null {
  const style = config.response_closing_style;
  if (!style) return null;

  if (style === "other" && config.response_closing_other?.trim()) {
    return `Respecte ce style de closing sans URL publique : ${config.response_closing_other.trim()}`;
  }
  if (style === "other") return null;

  const priorities: Record<Exclude<ResponseClosingStyle, "other">, string> = {
    soft: "Termine par une suggestion légère et discrète, sans pression.",
    direct:
      "Termine par une action sans lien : DM, recherche du nom, ou inscription. Tu peux poser une question qui accompagne l'action, jamais seule en dernière phrase.",
    consultative:
      "Termine en proposant un échange ou une question pour comprendre le besoin, sans coller d'URL.",
  };

  return priorities[style];
}

function resolveCtaInstruction(config: ReplyConfig, lead: ReplyLead): string {
  const frequency = config.response_link_frequency ?? "if_relevant";
  const base = CTA_FREQUENCY_INSTRUCTIONS[frequency];

  if (frequency === "if_relevant" && isOfferContextRelevant(lead)) {
    return `${base}\nContexte détecté : comparaison d'outils, recommandation ou recherche d'alternative — un CTA discret vers l'offre est naturel ici (toujours sans URL).`;
  }

  if (frequency === "if_relevant" && !isOfferContextRelevant(lead)) {
    return `${base}\nContexte : le post ne demande pas d'outil ou de recommandation — privilégie le conseil pur sans pitch.`;
  }

  return base;
}

function resolveCtaPriority(
  config: ReplyConfig,
  lead: ReplyLead,
  productName: string
): string | null {
  const frequency = config.response_link_frequency ?? "if_relevant";

  if (frequency === "never") {
    return "Ne fais aucun pitch ni CTA vers l'offre. Concentre-toi sur le conseil à valeur ajoutée.";
  }

  const ctaWithoutUrl = `Propose de chercher « ${productName} » sur Google, ou d'envoyer le lien en DM si la personne est intéressée. INTERDIT : toute URL (http, https, www, domaine .fr/.com, etc.).`;

  if (frequency === "always") {
    return `Tu DOIS inclure un CTA vers l'offre dans ta réponse. ${ctaWithoutUrl}`;
  }

  if (isOfferContextRelevant(lead)) {
    return `Le contexte rend un CTA discret pertinent. ${ctaWithoutUrl}`;
  }

  return "Le contexte ne rend pas un CTA vers l'offre naturel. Pas de pitch, uniquement du conseil utile.";
}

function buildAntiShadowbanBlock(
  config: ReplyConfig,
  lead: ReplyLead,
  productName: string
): string {
  const sections: string[] = ["=== ANTI-SHADOWBAN (priorité absolue) ===", ""];

  let index = 1;

  sections.push(
    `${index}. AUCUNE URL dans le commentaire public. Jamais de lien cliquable, quel que soit le réglage (always, if_relevant, never). Pas de http, https, www, ni de domaine externe.`
  );
  sections.push("");
  index++;

  sections.push(
    `${index}. LONGUEUR : 2 à 4 phrases max, un seul bloc de texte. Comme un vrai commentaire Reddit humain, pas un mini-article ni plusieurs paragraphes.`
  );
  sections.push("");
  index++;

  sections.push(`${index}. STRUCTURE : varie selon le post. Choisis UNE approche :`);
  sections.push("   - Commencer par un conseil concret sur le problème posé");
  sections.push("   - Commencer par une question courte pour comprendre le besoin");
  sections.push('   - Partager une expérience personnelle brève ("j\'ai testé X, voilà ce qui a marché")');
  sections.push("   - Répondre directement à la question sans te présenter");
  sections.push(
    '   INTERDIT : toujours commencer par "Salut !", reformuler le problème, puis pitcher l\'outil dans le même ordre.'
  );
  sections.push("");
  index++;

  sections.push(`${index}. MENTION DU PRODUIT : ne cite PAS systématiquement « ${productName} ». Choisis UNE variante :`);
  sections.push(`   - Nom explicite (« ${productName} ») : rare, seulement si très naturel`);
  sections.push('   - Mention vague ("un outil qui fait ça", "quelque chose dans ce genre")');
  sections.push("   - Zéro pitch : uniquement du conseil utile, sans citer ton produit");
  sections.push("");
  index++;

  const goalPriority = resolveGoalPriority(config, productName);
  if (goalPriority) {
    sections.push(`${index}. OBJECTIF : ${goalPriority}`);
    sections.push("");
    index++;
  }

  const closingPriority = resolveClosingPriority(config);
  if (closingPriority) {
    sections.push(`${index}. CLOSING : ${closingPriority}`);
    sections.push("");
    index++;
  }

  const ctaPriority = resolveCtaPriority(config, lead, productName);
  if (ctaPriority) {
    sections.push(`${index}. CTA / OFFRE : ${ctaPriority}`);
    sections.push("");
    index++;
  }

  if (config.tone_avoid?.trim()) {
    sections.push(`${index}. ÉVITE dans ton ton : ${config.tone_avoid.trim()}`);
    sections.push("");
  }

  return sections.join("\n");
}

export function buildReplyPrompt(lead: ReplyLead, config: ReplyConfig): string {
  const title = lead.post_title ?? lead.title ?? "";
  const body = lead.post_body ?? "";
  const subreddit = lead.subreddit ? `r/${lead.subreddit.replace(/^r\//i, "")}` : "ce subreddit";
  const author = (lead.author ?? lead.username ?? "l'auteur").replace(/^u\//i, "");
  const productName = config.product_name?.trim() || "LeadHunter AI";

  const offerContext =
    config.offer_description?.trim() ||
    config.product_description ||
    "outil de prospection B2B automatisé";

  const complementaryDescription =
    config.product_description && config.offer_description?.trim()
      ? `Description complémentaire : ${config.product_description}`
      : "";

  return `Tu rédiges un commentaire Reddit comme un vrai membre de la communauté, pas comme un commercial.

Contexte (pour toi uniquement, ne pas réciter mot pour mot) :
- Offre : ${offerContext}
- Cible : ${config.target}
- Marque : ${productName}
${complementaryDescription ? `- ${complementaryDescription}` : ""}

${resolveGoalInstruction(config)}
${resolveClosingInstruction(config)}
${resolveCtaInstruction(config, lead)}

Post Reddit à commenter :
- Titre : ${title}
- Contenu : ${body || "(pas de contenu)"}
- Subreddit : ${subreddit}
- Auteur : u/${author}

${buildAntiShadowbanBlock(config, lead, productName)}

RÈGLES DE FORMAT :
- N'utilise JAMAIS de tirets ("-") dans ta réponse, ni en début de ligne ni en milieu de phrase comme séparateur.
- Reformule avec des virgules, des points, ou des phrases complètes à la place.
- Pas de markdown, pas de listes à puces, pas de guillemets autour de la réponse.
- Ton conversationnel, imparfait acceptable (oralité légère, comme un humain sur Reddit).

Réponds UNIQUEMENT avec le texte du commentaire, sans préambule.`;
}
