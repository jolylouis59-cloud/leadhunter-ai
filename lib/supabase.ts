import { createClient } from "@supabase/supabase-js";

function getSupabaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  if (raw.startsWith("http")) return raw;
  return `https://${raw}.supabase.co`;
}

const supabaseUrl = getSupabaseUrl();
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabasePublishableKey);
