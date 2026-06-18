import type { Lead } from "@/lib/types";

export function normalizePostUrl(url: string | null | undefined): string {
  if (!url) return "";
  return url
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\/www\./, "https://")
    .replace(/\/+$/, "");
}

export function normalizeLeadTitle(lead: Lead): string {
  return (lead.post_title ?? lead.title ?? "").toLowerCase().trim();
}

export function dedupeLeads(leads: Lead[]): Lead[] {
  const seenUrls = new Set<string>();
  const seenTitles = new Set<string>();
  const result: Lead[] = [];

  const sorted = [...leads].sort((a, b) => b.intent_score - a.intent_score);

  for (const lead of sorted) {
    const url = normalizePostUrl(lead.post_url);
    const title = normalizeLeadTitle(lead);

    if (url && seenUrls.has(url)) continue;
    if (title && seenTitles.has(title)) continue;

    if (url) seenUrls.add(url);
    if (title) seenTitles.add(title);
    result.push(lead);
  }

  return result;
}

export function getLeadDate(lead: Lead): Date | null {
  const raw = lead.post_created_at || lead.created_at;
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatLeadDate(lead: Lead): string {
  const date = getLeadDate(lead);
  if (!date) return "";
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function getLeadTimestamp(lead: Lead): number {
  return getLeadDate(lead)?.getTime() ?? 0;
}

export function getLeadCreatedTimestamp(lead: Lead): number {
  if (!lead.created_at) return 0;
  const date = new Date(lead.created_at);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}
