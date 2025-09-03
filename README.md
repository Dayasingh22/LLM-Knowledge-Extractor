## Overview

AI Chat · LLM Knowledge Extractor built with Next.js App Router. Paste text to analyze; the app summarizes, extracts topics and keywords, infers naive sentiment, and can optionally store records in Supabase. A header action opens a search dialog to filter stored analyses by keyword (in `keywords` or `text`) and sentiment.

## Prerequisites

- Node.js 18+ and npm
- Optional: Supabase project (for persistence)
- Optional: OpenAI API key (for real LLM; otherwise a mock is used)

## Environment Variables

Create a `.env.local` with:

```bash
OPENAI_API_KEY=your_openai_key
OPENAI_MODEL=gpt-4o-mini

NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Install

```bash
npm install
```

## Run (development)

```bash
npm run dev
# http://localhost:3000
```

## Build and Start (production)

```bash
npm run build
npm run start
```

## Lint

```bash
npm run lint
```

## Tests

Vitest is used for unit tests.

```bash
npx vitest run

npx vitest
```

## API Endpoints

- `POST /api/analyze`

  - Body: `{ text: string, store?: boolean }`
  - Returns: `{ title, topics, sentiment, keywords, summary }`
  - The analysis is inserted into the `analyses` table.

- `GET /api/search?keyword=foo&sentiment=positive`
  - Filters by `sentiment` (optional)
  - OR-matches `keyword` across `keywords` array and `text` (case-insensitive)
  - Returns: `{ results: AnalysisRecord[] }`

## Design Choices

The app uses the Next.js App Router with route handlers to keep API logic colocated under `src/app/api`, simplifying deployment and local development. UI components are minimal, reusing simple primitives (`Button`, `Input`, `Textarea`) with shadcn ui components and a small custom modal to avoid adding a heavy dialog dependency. Persistence is isolated behind a tiny Supabase helper so local dev still works without credentials while enabling easy cloud storage when present. The LLM integration degrades gracefully by returning deterministic mock outputs if `OPENAI_API_KEY` is absent, ensuring the UI remains testable. Tests focus on server logic with Vitest and mocks to keep them fast and independent of external services.

## Trade-offs and Future Work

- Naive sentiment and keyword extraction are intentionally simple; a more robust NLP pipeline could improve accuracy.
- Search currently supports keyword and sentiment; adding pagination and more filters (e.g., date range) would help at scale.
- The modal is custom and light; adopting a11y-focused dialog (e.g., Radix) would improve accessibility.
- Tests mock Supabase and OpenAI; adding integration and E2E tests (Playwright) would increase confidence.
- No authentication/authorization included.
- Not showing the previous chats if page refreshes
