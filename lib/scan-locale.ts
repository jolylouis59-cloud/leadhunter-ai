export const KNOWN_FRANCOPHONE_SUBREDDITS = new Set([
  "frenchstartup",
  "entrepreneur_fr",
  "entrepreneuriat",
  "startupsfr",
  "france",
  "quebec",
  "frenchtech",
  "sideproject_fr",
  "freelance_fr",
  "vosfinances",
  "conseilboulot",
  "webmarketing",
  "nocode",
  "consulting",
  "coaching",
]);

/** Anglicismes / termes métier neutres — ne signalent pas un profil anglophone. */
const NEUTRAL_KEYWORD_TOKENS = [
  "saas",
  "b2b",
  "growth",
  "startup",
  "marketing",
  "lead",
  "leads",
  "client",
  "clients",
] as const;

export const LANGUAGE_MISMATCH_MAX_SCORE = 15;

const MULTILINGUAL_ENGLISH_RATIO = 0.25;

export function isFrancophoneSubreddit(subreddit: string): boolean {
  const name = subreddit.replace(/^r\//i, "").trim().toLowerCase();
  if (!name) return false;
  if (KNOWN_FRANCOPHONE_SUBREDDITS.has(name)) return true;
  if (/french/i.test(name)) return true;
  if (/francophone|francais|français/i.test(name)) return true;
  if (/quebec|belgique|suisse|montreal|montréal|paris|lyon|bruxelles/i.test(name)) return true;
  if (/(^|_)fr($|_)/i.test(name) || /_fr$/i.test(name)) return true;
  if (/entrepreneur/i.test(name) && /fr|franc|quebec|francophone/i.test(name)) return true;
  if (/finances?|boulot|emploi|travail|salaire/i.test(name)) return true;
  if (/conseil/i.test(name)) return true;
  if (/marketing|freelance|solopreneur/i.test(name) && /fr|franc|quebec/i.test(name)) return true;
  return false;
}

export function isNeutralOnlyKeyword(keyword: string): boolean {
  const k = keyword.trim().toLowerCase();
  if (!k) return true;

  let remainder = ` ${k} `;
  for (const token of NEUTRAL_KEYWORD_TOKENS) {
    remainder = remainder.replace(new RegExp(`\\b${token}\\b`, "gi"), " ");
  }

  remainder = remainder.replace(/[^a-zàâäéèêëïîôùûüÿçœæ0-9]+/gi, " ").trim();
  return remainder.length === 0;
}

export function isFrenchKeyword(keyword: string): boolean {
  const k = keyword.trim();
  if (!k) return false;
  if (/[àâäéèêëïîôùûüÿçœæ]/i.test(k)) return true;
  if (/\(fr\)|\[fr\]/i.test(k)) return true;
  if (/\b(trouver|trouve|chercher|cherche|recherche|rechercher)\b/i.test(k)) return true;
  if (/\b(des?\s+)?(leads?|prospects?|clients?)\b/i.test(k)) return true;
  if (/\b(prospection|logiciel|automatisation|commercialisation|acquisition)\b/i.test(k)) return true;
  if (/\b(comment|pourquoi|quel|quelle|quels|quelles|besoin|sans|avec|mon|mes|ton|tes)\b/i.test(k)) return true;
  if (/\b(outil|logiciel|alternative|agence|freelance|solopreneur)\b/i.test(k)) return true;
  return false;
}

export function isEnglishKeyword(keyword: string): boolean {
  const k = keyword.trim().toLowerCase();
  if (!k) return false;
  if (isNeutralOnlyKeyword(keyword)) return false;
  if (/[àâäéèêëïîôùûüÿçœæ]/.test(k)) return false;
  if (isFrenchKeyword(keyword)) return false;

  const englishPatterns = [
    /\b(find|finding|looking|searching|need|want|seeking)\b/,
    /\b(customers?|prospects?)\b/,
    /\b(tool|tools|software|app|platform|stack)\b/,
    /\b(cold email|outreach|prospecting|prospect)\b/,
    /\b(how to|what|which|best|recommend|suggestion)\b/,
    /\b(the|for|with|without|your|my|our|any)\b/,
    /\b(sales|agency|founder)\b/,
  ];

  return englishPatterns.some((pattern) => pattern.test(k));
}

export type KeywordLanguageProfile = {
  hasFrench: boolean;
  hasEnglish: boolean;
  isMultilingual: boolean;
  targetLanguage: "fr" | "en" | null;
};

export function analyzeKeywordLanguages(keywords: string[]): KeywordLanguageProfile {
  const cleaned = keywords.map((k) => k.trim()).filter(Boolean);
  if (cleaned.length === 0) {
    return { hasFrench: false, hasEnglish: false, isMultilingual: false, targetLanguage: null };
  }

  let frenchCount = 0;
  let englishCount = 0;

  for (const keyword of cleaned) {
    if (isNeutralOnlyKeyword(keyword)) continue;

    if (isFrenchKeyword(keyword)) {
      frenchCount++;
    } else if (isEnglishKeyword(keyword)) {
      englishCount++;
    }
  }

  const meaningfulCount = frenchCount + englishCount;
  const hasFrench = frenchCount > 0;
  const hasEnglish = englishCount > 0;
  const isMultilingual =
    hasFrench &&
    hasEnglish &&
    meaningfulCount > 0 &&
    englishCount / meaningfulCount >= MULTILINGUAL_ENGLISH_RATIO;

  let targetLanguage: "fr" | "en" | null = null;
  if (!isMultilingual) {
    if (hasFrench) targetLanguage = "fr";
    else if (hasEnglish) targetLanguage = "en";
  }

  return { hasFrench, hasEnglish, isMultilingual, targetLanguage };
}

function countPatternMatches(text: string, pattern: RegExp): number {
  const matches = text.match(pattern);
  return matches?.length ?? 0;
}

export function isPostPredominantlyEnglish(title: string, body: string): boolean {
  const text = `${title} ${body}`.replace(/\s+/g, " ").trim();
  if (!text) return false;

  const frenchPatterns = [
    /\b(je|tu|nous|vous|ils|elles|le|la|les|un|une|des|du|de|pour|par|avec|sans|dans|sur|est|sont|pas|plus|très|bien|comment|pourquoi|quel|quelle|quels|quelles|mon|ma|mes|ton|ta|tes|notre|votre|leur|ce|cette|ces|qui|que|quoi|où|aujourd'hui|français|francais|cherche|chercher|trouve|trouver|besoin|prospection|clients?|leads?)\b/gi,
  ];
  const englishPatterns = [
    /\b(i|you|we|they|the|a|an|and|or|but|for|with|without|from|to|in|on|at|is|are|was|were|have|has|had|do|does|did|my|your|our|their|this|that|these|those|what|which|who|how|why|when|where|anyone|someone|something|looking|need|want|should|would|could|can't|don't|doesn't|i'm|we're|you're)\b/gi,
  ];

  let frenchScore = countPatternMatches(text, frenchPatterns[0]);
  let englishScore = countPatternMatches(text, englishPatterns[0]);

  if (/[àâäéèêëïîôùûüÿçœæ]/i.test(text)) frenchScore += 3;

  return englishScore >= 2 && englishScore > frenchScore;
}

export function isPostPredominantlyFrench(title: string, body: string): boolean {
  const text = `${title} ${body}`.replace(/\s+/g, " ").trim();
  if (!text) return false;

  const frenchPatterns = [
    /\b(je|tu|nous|vous|ils|elles|le|la|les|un|une|des|du|de|pour|par|avec|sans|dans|sur|est|sont|pas|plus|très|bien|comment|pourquoi|quel|quelle|quels|quelles|mon|ma|mes|ton|ta|tes|notre|votre|leur|ce|cette|ces|qui|que|quoi|où|aujourd'hui|français|francais|cherche|chercher|trouve|trouver|besoin|prospection|clients?|leads?)\b/gi,
  ];
  const englishPatterns = [
    /\b(i|you|we|they|the|a|an|and|or|but|for|with|without|from|to|in|on|at|is|are|was|were|have|has|had|do|does|did|my|your|our|their|this|that|these|those|what|which|who|how|why|when|where|anyone|someone|something|looking|need|want|should|would|could|can't|don't|doesn't|i'm|we're|you're)\b/gi,
  ];

  let frenchScore = countPatternMatches(text, frenchPatterns[0]);
  let englishScore = countPatternMatches(text, englishPatterns[0]);

  if (/[àâäéèêëïîôùûüÿçœæ]/i.test(text)) frenchScore += 3;

  return frenchScore >= 2 && frenchScore > englishScore;
}

export function applyLanguageScoreCap(
  score: number,
  keywords: string[],
  title: string,
  selftext: string
): { score: number; capped: boolean; reason?: string } {
  const profile = analyzeKeywordLanguages(keywords);

  if (profile.targetLanguage === "fr" && isPostPredominantlyEnglish(title, selftext)) {
    if (score > LANGUAGE_MISMATCH_MAX_SCORE) {
      return {
        score: LANGUAGE_MISMATCH_MAX_SCORE,
        capped: true,
        reason: "Post majoritairement anglais — plafond langue (profil FR)",
      };
    }
  }

  if (profile.targetLanguage === "en" && isPostPredominantlyFrench(title, selftext)) {
    if (score > LANGUAGE_MISMATCH_MAX_SCORE) {
      return {
        score: LANGUAGE_MISMATCH_MAX_SCORE,
        capped: true,
        reason: "Post majoritairement français — plafond langue (profil EN)",
      };
    }
  }

  return { score, capped: false };
}

export type ScanCombination = { subreddit: string; keyword: string };

function shuffleInPlace<T>(arr: T[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

export function isFrancophoneTargeted(c: ScanCombination): boolean {
  return isFrancophoneSubreddit(c.subreddit) || isFrenchKeyword(c.keyword);
}

export function pickScanCombinations(
  subreddits: string[],
  keywords: string[],
  max: number
): ScanCombination[] {
  const all: ScanCombination[] = keywords.flatMap((keyword) =>
    subreddits.map((subreddit) => ({ subreddit, keyword }))
  );

  if (all.length <= max) return all;

  const francophone = all.filter(isFrancophoneTargeted);
  const others = all.filter((c) => !isFrancophoneTargeted(c));
  shuffleInPlace(francophone);
  shuffleInPlace(others);

  const picked = [...francophone, ...others].slice(0, max);
  shuffleInPlace(picked);
  return picked;
}
