const STOPWORDS = new Set([
  "the",
  "be",
  "to",
  "of",
  "and",
  "a",
  "in",
  "that",
  "have",
  "i",
  "it",
  "for",
  "not",
  "on",
  "with",
  "he",
  "as",
  "you",
  "do",
  "at",
  "this",
  "but",
  "his",
  "by",
  "from",
  "they",
  "we",
  "say",
  "her",
  "she",
  "or",
  "an",
  "will",
  "my",
  "one",
  "all",
  "would",
  "there",
  "their",
  "what",
  "so",
  "up",
  "out",
  "if",
  "about",
  "who",
  "get",
  "which",
  "go",
  "me",
  "when",
  "make",
  "can",
  "like",
  "no",
  "just",
  "him",
  "know",
  "take",
  "people",
  "into",
  "year",
  "your",
  "good",
  "some",
  "could",
  "them",
  "see",
  "other",
  "than",
  "then",
  "now",
  "look",
  "only",
  "come",
  "its",
  "over",
  "think",
  "also",
  "back",
  "after",
  "use",
  "two",
  "how",
  "our",
  "work",
  "first",
  "well",
  "way",
  "even",
  "new",
  "want",
  "because",
  "any",
  "these",
  "give",
  "day",
  "most",
  "us",
  "is",
  "are",
  "was",
  "were",
  "been",
  "being",
  "had",
  "has",
  "did",
  "does",
  "doing",
  "very",
  "more",
  "many",
  "much",
  "such",
  "per",
  "via",
  "vs",
  "vs.",
  "across",
  "within",
  "between",
]);

function normalizeToken(token: string): string {
  return token
    .toLowerCase()
    .replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, "")
    .replace(/['’`]/g, "");
}

export function extractTopKeywords(
  text: string,
  maxKeywords: number = 3
): string[] {
  if (!text || typeof text !== "string") return [];

  const tokens = text
    .split(/\s+/)
    .map(normalizeToken)
    .filter((t) => t.length > 2 && !STOPWORDS.has(t) && /[a-z]/.test(t));

  const frequency = new Map<string, number>();
  for (const token of tokens) {
    frequency.set(token, (frequency.get(token) || 0) + 1);
  }

  const sorted = Array.from(frequency.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, maxKeywords)
    .map(([word]) => word);

  return sorted;
}

export type Sentiment = "positive" | "neutral" | "negative";

export function naiveSentiment(text: string): Sentiment {
  const positiveWords = [
    "good",
    "great",
    "excellent",
    "positive",
    "happy",
    "success",
    "benefit",
    "win",
    "improve",
    "growth",
  ];
  const negativeWords = [
    "bad",
    "poor",
    "terrible",
    "negative",
    "sad",
    "fail",
    "loss",
    "decline",
    "risk",
    "problem",
    "issue",
  ];

  const lower = text.toLowerCase();
  let score = 0;
  for (const w of positiveWords) if (lower.includes(w)) score += 1;
  for (const w of negativeWords) if (lower.includes(w)) score -= 1;

  if (score > 0) return "positive";
  if (score < 0) return "negative";
  return "neutral";
}

export function extractTitleIfPresent(text: string): string | null {
  const line = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .find((l) => l.length > 0 && l.length <= 120);
  return line || null;
}
