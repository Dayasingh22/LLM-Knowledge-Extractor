import OpenAI from "openai";

export type LLMResult = {
  summary: string;
  topics: string[];
};

const modelName = process.env.OPENAI_MODEL || "gpt-4o-mini";

function getClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  try {
    return new OpenAI({ apiKey });
  } catch {
    return null;
  }
}

export async function analyzeWithLLM(inputText: string): Promise<LLMResult> {
  const client = getClient();
  if (!client) {
    return {
      summary: mockSummarize(inputText),
      topics: mockTopics(inputText),
    };
  }

  const system =
    "You extract insights from long texts. Return short, crisp outputs.";
  const user = `Text to analyze:\n\n${inputText}`;

  const response = await client.chat.completions.create({
    model: modelName,
    messages: [
      { role: "system", content: system },
      {
        role: "user",
        content:
          "Provide: 1) a 1-2 sentence summary; 2) three short topics as a JSON array only.\n" +
          user,
      },
    ],
    temperature: 0.2,
  });

  const content = response.choices?.[0]?.message?.content || "";
  const topics = tryParseTopics(content) || mockTopics(inputText);
  const summary = tryExtractSummary(content) || mockSummarize(inputText);
  return { summary, topics };
}

function tryParseTopics(text: string): string[] | null {
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) return null;
  try {
    const parsed = JSON.parse(match[0]);
    if (Array.isArray(parsed)) {
      return parsed.map((t) => String(t)).slice(0, 3);
    }
  } catch {}
  return null;
}

function tryExtractSummary(text: string): string | null {
  const firstLine = text
    .split(/\n/)
    .map((l) => l.trim())
    .find((l) => l.length > 0);
  return firstLine || null;
}

function mockSummarize(input: string): string {
  const trimmed = input.trim().replace(/\s+/g, " ");
  if (trimmed.length <= 160) return trimmed;
  return trimmed.slice(0, 157) + "...";
}

function mockTopics(input: string): string[] {
  const words = input.toLowerCase().match(/[a-z]{4,}/g) || [];
  const uniq = Array.from(new Set(words)).slice(0, 3);
  return uniq.length ? uniq : ["general", "update", "text"];
}
