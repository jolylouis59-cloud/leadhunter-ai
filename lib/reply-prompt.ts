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
    "Objectif principal : inciter la personne à visiter le site/lien fourni, de façon naturelle.",
  contact_dm:
    "Objectif principal : l'inviter à te contacter en message privé (DM) pour en savoir plus.",
  book_call:
    "Objectif principal : l'inviter à réserver un appel ou une démo.",
  waitlist:
    "Objectif principal : l'inviter à rejoindre la liste d'attente ou la newsletter.",
  other: "",
};

const CLOSING_INSTRUCTIONS: Record<Exclude<ResponseClosingStyle, "other">, string> = {
  soft:
    "Style de closing : doux et discret. Suggestion légère, sans pression. Laisse la porte ouverte sans insister.",
  direct:
    "Style de closing : direct et clair. Appel à l'action explicite mais respectueux, sans être agressif.",
  consultative:
    "Style de closing : consultatif. Pose une question ou propose un échange pour comprendre le besoin avant de suggérer la suite.",
};

const LINK_FREQUENCY_INSTRUCTIONS: Record<ResponseLinkFrequency, string> = {
  always:
    "Fréquence du lien : tu DOIS inclure le lien fourni dans ta réponse (une seule fois, de façon naturelle).",
  if_relevant:
    "Fréquence du lien : n'inclus le lien que si le contexte du post rend sa mention pertinente et non forcée. Sinon, termine sans lien.",
  never:
    "Fréquence du lien : n'inclus AUCUN lien URL dans ta réponse. Concentre-toi sur la valeur et la relation.",
};

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

function resolveLinkInstruction(config: ReplyConfig): string {
  const frequency = config.response_link_frequency ?? "if_relevant";
  const link = config.response_link?.trim();
  const base = LINK_FREQUENCY_INSTRUCTIONS[frequency];

  if (!link || frequency === "never") {
    return base;
  }

  return `${base}\nLien à utiliser si applicable : ${link}`;
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

  const toneAvoidBlock = config.tone_avoid?.trim()
    ? `\nÉvite absolument dans ton ton et tes formulations : ${config.tone_avoid.trim()}`
    : "";

  return `Tu es un expert en prospection Reddit B2B.

Contexte business (offre en une phrase) : ${offerContext}
Cible idéale : ${config.target}
Nom du produit / marque : ${productName}
${config.product_description && config.offer_description?.trim() ? `Description complémentaire : ${config.product_description}` : ""}

${resolveGoalInstruction(config)}
${resolveClosingInstruction(config)}
${resolveLinkInstruction(config)}${toneAvoidBlock}

Post Reddit à commenter :
- Titre : ${title}
- Contenu : ${body || "(pas de contenu)"}
- Subreddit : ${subreddit}
- Auteur : u/${author}

Rédige une réponse courte, naturelle et en français, prête à poster en commentaire Reddit.
Ton amical et utile, pas vendeur agressif.

RÈGLES DE FORMAT :
- N'utilise JAMAIS de tirets ("-") dans ta réponse, ni en début de ligne ni en milieu de phrase comme séparateur.
- Reformule avec des virgules, des points, ou des phrases complètes à la place.
- Pas de markdown, pas de listes à puces, pas de guillemets autour de la réponse.

Réponds UNIQUEMENT avec le texte de la réponse, sans préambule.`;
}
