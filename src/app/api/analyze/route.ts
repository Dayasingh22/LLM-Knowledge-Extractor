import { z } from "zod";
import { NextResponse } from "next/server";
import { analyzeWithLLM } from "@/lib/llm";
import {
  extractTopKeywords,
  naiveSentiment,
  extractTitleIfPresent,
} from "@/lib/keywords";
import { getSupabase } from "@/lib/supabase";

const AnalyzeSchema = z.object({
  text: z.string().min(1, "text is required").max(100_000),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const { text } = AnalyzeSchema.parse(json);

    const { summary, topics } = await analyzeWithLLM(text);
    const keywords = extractTopKeywords(text, 3);
    const sentiment = naiveSentiment(text);
    const title = extractTitleIfPresent(text);

    const result = { title, topics, sentiment, keywords, summary };

    const client = getSupabase();
    if (client) {
      await client.from("analyses").insert({
        text,
        title,
        summary,
        topics,
        sentiment,
        keywords,
      });
    }

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
