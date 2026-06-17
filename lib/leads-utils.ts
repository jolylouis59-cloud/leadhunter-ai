import type { Lead } from "@/lib/types";

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
