const EMAIL_RE = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/;
const PHONE_RE =
  /\b(?:\+?\d{1,3}[\s.-]?)?\(?\d{2,4}\)?[\s.-]?\d{2,4}[\s.-]?\d{2,4}[\s.-]?\d{0,4}\b/;
const FULL_NAME_RE = /\b[A-ZÀ-Ÿ][a-zà-ÿ]{1,}\s+[A-ZÀ-Ÿ][a-zà-ÿ]{1,}\b/;

export function containsPii(text: string): boolean {
  return EMAIL_RE.test(text) || PHONE_RE.test(text) || FULL_NAME_RE.test(text);
}

export function truncateTitle(text: string, maxLen = 40): string {
  const cleaned = text.trim();
  if (cleaned.length <= maxLen) return cleaned;

  const slice = cleaned.slice(0, maxLen);
  const lastSpace = slice.lastIndexOf(" ");
  if (lastSpace > maxLen * 0.55) {
    return slice.slice(0, lastSpace).trim() + "…";
  }
  return slice.trim() + "…";
}

export function sanitizeLeadTitle(raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null;
  if (containsPii(raw)) return null;
  return truncateTitle(raw);
}
