import type { Lead } from "@/lib/types";

export function isTestLead(lead: Lead): boolean {
  const author = lead.author ?? lead.username ?? "";
  if (/^test_user\d*$/i.test(author)) return true;
  if (lead.post_url?.includes("reddit.com/test")) return true;
  return false;
}

export function filterRealLeads(leads: Lead[]): Lead[] {
  return leads.filter((l) => !isTestLead(l));
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
