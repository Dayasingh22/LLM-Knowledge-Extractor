/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/supabase", () => ({
  getSupabase: vi.fn(),
}));

import { GET } from "@/app/api/search/route";
import { getSupabase } from "@/lib/supabase";

type RecordCalls = {
  table?: string;
  select?: string;
  order?: { col: string; ascending: boolean };
  eq?: { col: string; val: unknown };
  or?: string;
  limit?: number;
};

function createFakeClient(returnData: unknown[] = []) {
  const calls: RecordCalls = {};

  const query = {
    select(sel: string) {
      calls.select = sel;
      return query;
    },
    order(col: string, opts: { ascending: boolean }) {
      calls.order = { col, ascending: opts.ascending };
      return query;
    },
    eq(col: string, val: unknown) {
      calls.eq = { col, val };
      return query;
    },
    or(cond: string) {
      calls.or = cond;
      return query;
    },
    contains() {
      // not used in current implementation
      return query;
    },
    async limit(n: number) {
      calls.limit = n;
      return { data: returnData, error: null } as const;
    },
  };

  const client = {
    from(table: string) {
      calls.table = table;
      return query;
    },
    _calls: calls,
  } as unknown as {
    from: (table: string) => typeof query;
    _calls: RecordCalls;
  };

  return client;
}

describe("/api/search route", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns 400 when Supabase is not configured", async () => {
    (getSupabase as unknown as ReturnType<typeof vi.fn>).mockReturnValue(null);
    const req = new Request("http://localhost/api/search");
    const res = (await GET(req)) as Response;
    expect(res.status).toBe(400);
    const body = (await res.json()) as any;
    expect(body.error).toBeTruthy();
  });

  it("applies OR match on keyword across keywords array and text", async () => {
    const client = createFakeClient([]);
    (getSupabase as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      client
    );
    const req = new Request("http://localhost/api/search?keyword=react");
    const res = (await GET(req)) as Response;
    expect(res.status).toBe(200);

    const calls = (client as any)._calls as RecordCalls;
    expect(calls.table).toBe("analyses");
    expect(calls.select).toBe("*");
    expect(calls.order?.col).toBe("created_at");
    expect(calls.limit).toBe(50);
    expect(calls.or).toContain("text.ilike.%react%");
    expect(calls.or).toContain("keywords.cs.{react}");
  });

  it("filters by sentiment when provided", async () => {
    const client = createFakeClient([]);
    (getSupabase as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      client
    );
    const req = new Request("http://localhost/api/search?sentiment=positive");
    const res = (await GET(req)) as Response;
    expect(res.status).toBe(200);

    const calls = (client as any)._calls as RecordCalls;
    expect(calls.eq).toEqual({ col: "sentiment", val: "positive" });
    expect(calls.or).toBeUndefined();
  });

  it("supports both keyword and sentiment filters together", async () => {
    const sample = [{ id: "1" }];
    const client = createFakeClient(sample);
    (getSupabase as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      client
    );
    const req = new Request(
      "http://localhost/api/search?keyword=ai&sentiment=neutral"
    );
    const res = (await GET(req)) as Response;
    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(Array.isArray(body.results)).toBe(true);

    const calls = (client as any)._calls as RecordCalls;
    expect(calls.eq).toEqual({ col: "sentiment", val: "neutral" });
    expect(calls.or).toContain("text.ilike.%ai%");
  });
});
