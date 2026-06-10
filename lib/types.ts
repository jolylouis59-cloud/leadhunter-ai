export type LeadStatus = "new" | "responded" | "ignored";

export type Lead = {
  id: string;
  user_id: string;
  platform: string;
  title: string;
  subreddit: string | null;
  username: string | null;
  intent_score: number;
  status: LeadStatus;
  ai_response: string | null;
  post_url: string | null;
  post_created_at: string;
  created_at: string;
};
