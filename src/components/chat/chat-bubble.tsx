import { cn } from "@/lib/utils";
import { ReactNode } from "react";

type ChatBubbleProps = {
  role: "user" | "assistant";
  children: ReactNode;
  className?: string;
};

export function ChatBubble({ role, children, className }: ChatBubbleProps) {
  const isUser = role === "user";
  return (
    <div
      className={cn("w-full flex", isUser ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap",
          isUser
            ? "max-w-[80%] bg-primary text-primary-foreground rounded-br-sm"
            : "w-[80%] bg-muted text-foreground rounded-bl-sm border",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}
