import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const keyword = url.searchParams.get("keyword");
  const sentiment = url.searchParams.get("sentiment");

  const client = getSupabase();
  if (!client) {
    return NextResponse.json(
      { error: "Supabase not configured" },
      { status: 400 }
    );
  }

  let query = client
    .from("analyses")
    .select("*")
    .order("created_at", { ascending: false });

  if (sentiment) {
    query = query.eq("sentiment", sentiment);
  }
  if (keyword) {
    const k = keyword.toLowerCase().trim();
    const arrayLiteral = `{${k}}`;
    query = query.or(`keywords.cs.${arrayLiteral},text.ilike.%${k}%`);
  }

  const { data, error } = await query.limit(50);
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ results: data });
}
