export const MIN_INTENT_SCORE_TO_INSERT = 30;

export function buildIntentScorePrompt(params: {
  productDescription: string;
  target: string;
  title: string;
  selftext: string;
  subreddit?: string;
}): string {
  const postHeader = params.subreddit
    ? `Post Reddit de r/${params.subreddit} :`
    : "Post Reddit :";

  return `Tu es expert en détection d'intention d'achat B2B pour des outils de PROSPECTION et d'ACQUISITION DE CLIENTS.

Produit que nous vendons : ${params.productDescription}
Cible idéale : ${params.target}

${postHeader}
Titre : ${params.title}
Contenu : ${params.selftext}

Donne un Intent Score de 0 à 100 (100 = cherche activement un outil de prospection/acquisition B2B).

Règles STRICTES :

Score > 70 UNIQUEMENT si le post exprime une recherche active et explicite d'un outil ou d'une solution de prospection B2B / génération de leads.
Exemples valides : "je cherche un outil pour trouver des clients B2B", "quelqu'un connaît une alternative à [outil de prospection] ?", "comment vous faites pour trouver des clients sans cold email ?"

Score < 20 si le post est :
- un partage d'expérience, constat ou débat sans demande de solution (ex: "30% des offres LinkedIn sont fake", statistiques, opinion)
- une auto-promotion : l'auteur VEND ou présente SON PROPRE outil/produit (il n'achète pas)
- une question de carrière, emploi ou détresse personnelle (ex: "je suis dépassé", TSA, burn-out)
- un sujet hors prospection B2B (e-commerce physique, import/export de produits, fournisseurs, tapis, etc.)
- un post "business" général sans lien avec la prospection ou l'acquisition de clients

Score < 15 SYSTÉMATIQUEMENT si l'auteur présente son propre outil/produit avec des formulations comme "j'ai créé", "j'ai développé", "j'ai lancé", "feedback bienvenu", "mon SaaS", "mon outil" — c'est un concurrent ou un builder, PAS un prospect.

Score < 20 si le post ne mentionne aucune recherche explicite de solution pour LA PROSPECTION ou L'ACQUISITION DE CLIENTS B2B précisément (pas juste "business", "startup" ou "entrepreneur" en général).

Score 20-40 : question vague sur le business sans demande d'outil de prospection claire.
Score 40-70 : intérêt modéré pour la prospection mais sans demande explicite d'outil ou de recommandation.

Réponds UNIQUEMENT avec ce JSON sans texte autour :
{"score": 75, "reason": "L'auteur cherche activement un outil de prospection B2B"}`;
}
