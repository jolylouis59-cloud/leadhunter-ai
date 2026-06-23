export const KNOWN_FRANCOPHONE_SUBREDDITS = new Set([
  "frenchstartup",
  "entrepreneur_fr",
  "entrepreneurs",
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
  "sideproject",
  "business",
]);

export function isFrancophoneSubreddit(subreddit: string): boolean {
  const name = subreddit.replace(/^r\//i, "").trim().toLowerCase();
  if (!name) return false;
  if (KNOWN_FRANCOPHONE_SUBREDDITS.has(name)) return true;
  if (/french/i.test(name)) return true;
  if (/francophone|francais|français/i.test(name)) return true;
  if (/quebec|belgique|suisse|montreal|montréal|paris|lyon|bruxelles/i.test(name)) return true;
  if (/(^|_)fr($|_)/i.test(name) || /_fr$/i.test(name)) return true;
  if (/entrepreneur/i.test(name) && !/entrepreneurride/i.test(name)) return true;
  if (/finances?|boulot|emploi|travail|salaire/i.test(name)) return true;
  if (/conseil/i.test(name)) return true;
  if (/marketing|freelance|solopreneur/i.test(name) && /fr|franc|quebec/i.test(name)) return true;
  return false;
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
  if (/[àâäéèêëïîôùûüÿçœæ]/.test(k)) return false;
  if (isFrenchKeyword(keyword)) return false;

  const englishPatterns = [
    /\b(find|finding|looking|searching|need|want|seeking)\b/,
    /\b(leads?|clients?|customers?|prospects?)\b/,
    /\b(tool|tools|software|saas|app|platform|stack)\b/,
    /\b(b2b|cold email|outreach|prospecting|prospect)\b/,
    /\b(how to|what|which|best|alternative|recommend|suggestion)\b/,
    /\b(the|for|with|without|your|my|our|any)\b/,
    /\b(growth|sales|marketing|agency|founder|startup)\b/,
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
    const fr = isFrenchKeyword(keyword);
    const en = isEnglishKeyword(keyword);
    if (fr) frenchCount++;
    if (en) englishCount++;
  }

  const hasFrench = frenchCount > 0;
  const hasEnglish = englishCount > 0;
  const isMultilingual = hasFrench && hasEnglish;

  let targetLanguage: "fr" | "en" | null = null;
  if (!isMultilingual) {
    if (hasFrench) targetLanguage = "fr";
    else if (hasEnglish) targetLanguage = "en";
  }

  return { hasFrench, hasEnglish, isMultilingual, targetLanguage };
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
