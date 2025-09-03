import { createClient } from "@supabase/supabase-js";

export type AnalysisRecord = {
  id: string;
  created_at: string;
  text: string;
  title: string | null;
  summary: string;
  topics: string[];
  sentiment: "positive" | "neutral" | "negative";
  keywords: string[];
};

export function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false },
  });
}
