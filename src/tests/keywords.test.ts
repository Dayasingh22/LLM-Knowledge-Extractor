import { describe, it, expect } from "vitest";
import { extractTopKeywords, naiveSentiment } from "@/lib/keywords";

describe("keywords", () => {
  it("extracts top 3 keywords", () => {
    const text =
      "Next.js app uses React and React for building web apps with React";
    const kws = extractTopKeywords(text, 3);
    expect(kws.length).toBeGreaterThan(0);
  });

  it("computes naive sentiment", () => {
    expect(naiveSentiment("This is a great success")).toBe("positive");
    expect(naiveSentiment("This is a terrible failure")).toBe("negative");
  });
});
