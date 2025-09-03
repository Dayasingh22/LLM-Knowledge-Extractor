import React from "react";

export function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="w-2 h-2 rounded-full bg-current opacity-60 animate-bounce [animation-delay:-0.2s]"></span>
      <span className="w-2 h-2 rounded-full bg-current opacity-60 animate-bounce [animation-delay:-0.1s]"></span>
      <span className="w-2 h-2 rounded-full bg-current opacity-60 animate-bounce"></span>
    </span>
  );
}
