"use client";
import { useEffect, useState } from "react";

export function TypingEffect({
  text,
  speed = 16,
}: {
  text: string;
  speed?: number;
}) {
  const [shown, setShown] = useState("");

  useEffect(() => {
    setShown("");
    let i = 0;
    const id = setInterval(() => {
      i = i + 1;
      setShown(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);

  return <span className="whitespace-pre-wrap">{shown}</span>;
}
