"use client";
import { useEffect, useRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ChatBubble } from "@/components/chat/chat-bubble";
import { TypingDots } from "@/components/chat/typing-dots";
import { TypingEffect } from "@/components/chat/typing-effect";
import { Send, Search, X } from "lucide-react";
import type { AnalysisRecord } from "@/lib/supabase";

type AnalyzeResponse = {
  title: string | null;
  topics: string[];
  sentiment: "positive" | "neutral" | "negative";
  keywords: string[];
  summary: string;
};

type Message =
  | { id: string; role: "user"; content: string }
  | {
      id: string;
      role: "assistant";
      loading?: boolean;
      result?: AnalyzeResponse;
    };

export default function Home() {
  const [text, setText] = useState("");

  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<AnalysisRecord[]>([]);

  function scrollToBottom() {
    const el = viewportRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  useEffect(() => {
    const viewport = viewportRef.current;
    const content = contentRef.current;
    if (!viewport || !content) return;

    const observer = new ResizeObserver(() => {
      const distanceFromBottom =
        viewport.scrollHeight - (viewport.scrollTop + viewport.clientHeight);
      if (distanceFromBottom < 80) {
        scrollToBottom();
      }
    });

    observer.observe(content);
    return () => observer.disconnect();
  }, []);

  async function handleSend() {
    const content = text.trim();
    if (!content) return;
    setError(null);
    setText("");
    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content };
    const loadingMsg: Message = {
      id: crypto.randomUUID(),
      role: "assistant",
      loading: true,
    };
    setMessages((m) => [...m, userMsg, loadingMsg]);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: content }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");

      const finalMsg: Message = {
        id: loadingMsg.id,
        role: "assistant",
        result: data,
      };
      setMessages((m) => m.map((x) => (x.id === loadingMsg.id ? finalMsg : x)));
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unexpected error";
      setError(message);
      setMessages((m) => m.filter((x) => x.id !== loadingMsg.id));
    }
  }

  return (
    <div className="flex h-screen">
      <main className="flex min-w-0 flex-1 flex-col">
        <div className="h-14 border-b px-4 flex items-center justify-between">
          <div className="font-medium">AI Chat · LLM Knowledge Extractor</div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="w-4 h-4 mr-2" />
              Search with keyword
            </Button>
          </div>
        </div>
        <div ref={viewportRef} className="flex-1 overflow-y-auto bg-background">
          <div className="mx-auto max-w-3xl p-4">
            {messages.length === 0 && (
              <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
                Paste text below and press Send to analyze.
              </div>
            )}
            <div className="space-y-3" ref={contentRef}>
              {messages.map((m) => (
                <div key={m.id} className="w-full">
                  {m.role === "user" ? (
                    <ChatBubble role="user">{m.content}</ChatBubble>
                  ) : m.loading ? (
                    <ChatBubble role="assistant">
                      <TypingDots />
                    </ChatBubble>
                  ) : m.result ? (
                    <div className="space-y-2">
                      <ChatBubble role="assistant">
                        <div className="space-y-1">
                          <div className="font-semibold">Summary</div>
                          <div className="text-sm leading-relaxed">
                            <TypingEffect text={m.result.summary} />
                          </div>
                        </div>
                      </ChatBubble>
                      <ChatBubble role="assistant">
                        <div className="text-xs">
                          <pre className="whitespace-pre-wrap">
                            {`{
  "title": ${JSON.stringify(m.result.title)},
  "topics": ${JSON.stringify(m.result.topics)},
  "sentiment": ${JSON.stringify(m.result.sentiment)},
  "keywords": ${JSON.stringify(m.result.keywords)}
}`}
                          </pre>
                        </div>
                      </ChatBubble>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
        {error && <div className="px-4 pb-2 text-sm text-red-600">{error}</div>}
        <div className="border-t p-4">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-end gap-2">
              <Textarea
                placeholder="Paste an article, blog post, or update..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[56px] flex-1 resize-none max-h-[40vh] overflow-y-auto"
                rows={3}
              />
              <Button
                onClick={handleSend}
                disabled={text.trim().length === 0}
                aria-label="Send"
              >
                <Send className="w-4 h-4 mr-2" />
                Send
              </Button>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              This app analyzes text to extract topics, keywords, sentiment and
              provides a summary using AI.
            </div>
          </div>
        </div>
      </main>
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsSearchOpen(false)}
          />
          <div className="relative z-10 w-full max-w-lg rounded-lg border bg-card shadow-lg">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="font-medium">Search</div>
              <button
                className="rounded-md p-1 hover:bg-muted"
                onClick={() => setIsSearchOpen(false)}
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div className="space-y-1">
                <Label htmlFor="keyword" className="text-sm">
                  Keyword
                </Label>
                <Input
                  id="keyword"
                  placeholder="Enter a keyword to search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSearchTerm("");
                    setSearchResults([]);
                    setSearchError(null);
                  }}
                >
                  Clear
                </Button>
                <Button
                  onClick={async () => {
                    const term = searchTerm.trim();
                    if (!term) return;
                    setSearchLoading(true);
                    setSearchError(null);
                    try {
                      const qs = new URLSearchParams({ keyword: term });
                      const res = await fetch(`/api/search?${qs.toString()}`);
                      const data = await res.json();
                      if (!res.ok)
                        throw new Error(data.error || "Search failed");
                      setSearchResults(data.results as AnalysisRecord[]);
                    } catch (err: unknown) {
                      setSearchError(
                        err instanceof Error ? err.message : "Unexpected error"
                      );
                    } finally {
                      setSearchLoading(false);
                    }
                  }}
                  disabled={searchLoading || searchTerm.trim().length === 0}
                >
                  {searchLoading ? (
                    <>
                      <span className="mr-2">…</span>
                      Searching
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Search
                    </>
                  )}
                </Button>
              </div>
              {searchError && (
                <div className="text-sm text-red-600">{searchError}</div>
              )}
              <div className="max-h-80 overflow-y-auto divide-y">
                {searchResults.length === 0 && !searchLoading ? (
                  <div className="text-sm text-muted-foreground">
                    No results
                  </div>
                ) : (
                  searchResults.map((r) => (
                    <div key={r.id} className="py-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-sm truncate">
                          {r.title || "Untitled"}
                        </div>
                        <span className="text-xs rounded bg-muted px-2 py-0.5">
                          {r.sentiment}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground line-clamp-2">
                        {r.summary}
                      </div>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {r.keywords?.map((k) => (
                          <span
                            key={k}
                            className="text-xs rounded-full bg-secondary px-2 py-0.5"
                          >
                            {k}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
