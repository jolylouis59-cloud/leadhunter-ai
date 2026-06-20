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
    "Fréquence du lien : inclure le lien fourni dans la réponse (une seule fois, de façon naturelle).",
  if_relevant:
    "Fréquence du lien : inclure le lien uniquement si le contexte du post le rend pertinent.",
  never:
    "Fréquence du lien : n'inclus aucun lien URL dans la réponse.",
};

const LINK_RELEVANCE_PATTERNS = [
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

export function isLinkContextRelevant(lead: ReplyLead): boolean {
  const text = `${lead.post_title ?? lead.title ?? ""} ${lead.post_body ?? ""}`;
  return LINK_RELEVANCE_PATTERNS.some((pattern) => pattern.test(text));
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

function resolveGoalPriority(config: ReplyConfig): string | null {
  const goal = config.response_goal;
  if (!goal) return null;

  if (goal === "other" && config.response_goal_other?.trim()) {
    return `Ta réponse DOIT respecter cet objectif personnalisé : ${config.response_goal_other.trim()}`;
  }

  const priorities: Record<ResponseGoal, string> = {
    visit_site:
      "Ta réponse DOIT inciter explicitement à visiter le site ou le lien fourni. L'appel à visiter doit être clair, pas implicite.",
    contact_dm:
      "Ta réponse DOIT inviter explicitement à te contacter en message privé (DM) pour en savoir plus.",
    book_call:
      "Ta réponse DOIT inviter explicitement à réserver un appel ou une démo.",
    waitlist:
      'Ta réponse DOIT inviter explicitement à rejoindre la liste d\'attente ou la newsletter. Mentionne clairement « liste d\'attente » ou « newsletter ».',
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
    return `Respecte impérativement ce style de closing personnalisé : ${config.response_closing_other.trim()}`;
  }
  if (style === "other") return null;

  const priorities: Record<Exclude<ResponseClosingStyle, "other">, string> = {
    soft:
      "Termine par une suggestion légère et discrète, sans pression. Pas d'appel à l'action agressif.",
    direct:
      "Termine par une proposition claire et une action explicite (lien, essai, inscription). Tu peux poser une question, mais elle doit accompagner l'action, jamais la remplacer. Ne termine JAMAIS uniquement par une question sans proposition concrète.",
    consultative:
      "Termine en proposant un échange ou une question pour comprendre le besoin, tout en suggérant une suite concrète si pertinent.",
  };

  return priorities[style];
}

function resolveLinkInstruction(config: ReplyConfig, lead: ReplyLead): string {
  const frequency = config.response_link_frequency ?? "if_relevant";
  const link = config.response_link?.trim();
  const base = LINK_FREQUENCY_INSTRUCTIONS[frequency];

  if (!link || frequency === "never") {
    return base;
  }

  if (frequency === "if_relevant" && isLinkContextRelevant(lead)) {
    return `${base}\nContexte détecté : comparaison d'outils, recommandation ou recherche d'alternative — le lien est pertinent pour ce post.\nLien à utiliser : ${link}`;
  }

  return `${base}\nLien à utiliser si applicable : ${link}`;
}

function resolveLinkPriority(config: ReplyConfig, lead: ReplyLead): string | null {
  const frequency = config.response_link_frequency ?? "if_relevant";
  const link = config.response_link?.trim();

  if (frequency === "never") {
    return "N'inclus AUCUN lien URL dans ta réponse.";
  }

  if (!link) return null;

  if (frequency === "always") {
    return `Tu DOIS inclure exactement ce lien une fois, de façon naturelle : ${link}`;
  }

  if (isLinkContextRelevant(lead)) {
    return `Le contexte de ce post rend le lien pertinent (comparaison d'outils, recommandation ou recherche d'alternative). Tu DOIS inclure exactement ce lien une fois : ${link}`;
  }

  return "Le contexte de ce post ne rend pas le lien pertinent. N'inclus PAS de lien URL dans ta réponse.";
}

function resolveToneInstruction(config: ReplyConfig): string {
  const style = config.response_closing_style;
  const goal = config.response_goal;

  if (
    style === "direct" ||
    goal === "waitlist" ||
    goal === "visit_site" ||
    goal === "book_call"
  ) {
    return "Rédige une réponse courte, naturelle et en français, prête à poster en commentaire Reddit. Ne sois pas agressif, mais sois clair et direct sur l'action demandée.";
  }

  return "Rédige une réponse courte, naturelle et en français, prête à poster en commentaire Reddit. Ton amical et utile, pas vendeur agressif.";
}

function buildMandatoryPrioritiesBlock(config: ReplyConfig, lead: ReplyLead): string {
  const sections: string[] = ["=== PRIORITÉS OBLIGATOIRES (respecte impérativement) ===", ""];

  let index = 1;

  const goalPriority = resolveGoalPriority(config);
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

  const linkPriority = resolveLinkPriority(config, lead);
  if (linkPriority) {
    sections.push(`${index}. LIEN : ${linkPriority}`);
    sections.push("");
    index++;
  }

  const tonePriority =
    config.response_closing_style === "direct" ||
    config.response_goal === "waitlist" ||
    config.response_goal === "visit_site"
      ? "Ne sois pas agressif, mais sois clair et direct sur l'action demandée ci-dessus (objectif, closing, lien)."
      : "Reste naturel, utile et non agressif — sans compromettre les priorités ci-dessus.";

  sections.push(`${index}. TON : ${tonePriority}`);

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

  const toneAvoidBlock = config.tone_avoid?.trim()
    ? `\nÉvite absolument dans ton ton et tes formulations : ${config.tone_avoid.trim()}`
    : "";

  const complementaryDescription =
    config.product_description && config.offer_description?.trim()
      ? `Description complémentaire : ${config.product_description}`
      : "";

  return `Tu es un expert en prospection Reddit B2B.

Contexte business (offre en une phrase) : ${offerContext}
Cible idéale : ${config.target}
Nom du produit / marque : ${productName}
${complementaryDescription}

${resolveGoalInstruction(config)}
${resolveClosingInstruction(config)}
${resolveLinkInstruction(config, lead)}${toneAvoidBlock}

Post Reddit à commenter :
- Titre : ${title}
- Contenu : ${body || "(pas de contenu)"}
- Subreddit : ${subreddit}
- Auteur : u/${author}

${resolveToneInstruction(config)}

${buildMandatoryPrioritiesBlock(config, lead)}

RÈGLES DE FORMAT :
- N'utilise JAMAIS de tirets ("-") dans ta réponse, ni en début de ligne ni en milieu de phrase comme séparateur.
- Reformule avec des virgules, des points, ou des phrases complètes à la place.
- Pas de markdown, pas de listes à puces, pas de guillemets autour de la réponse.

Réponds UNIQUEMENT avec le texte de la réponse, sans préambule.`;
}
