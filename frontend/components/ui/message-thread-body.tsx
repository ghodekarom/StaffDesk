"use client";

import { useEffect, useRef } from "react";
import { Send } from "lucide-react";
import { ErrorState } from "@/components/ui/error-state";
import { DirectMessage } from "@/lib/hooks/use-message-thread";

interface MessageThreadBodyProps {
  messages: DirectMessage[];
  loading: boolean;
  error: string | null;
  sending: boolean;
  currentEmployeeId: number | null;
  otherFirstName: string;
  draft: string;
  onDraftChange: (value: string) => void;
  onSend: () => void;
  onRetry: () => void;
}

export function MessageThreadBody({
  messages, loading, error, sending, currentEmployeeId, otherFirstName,
  draft, onDraftChange, onSend, onRetry,
}: MessageThreadBodyProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  return (
    <>
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {loading ? (
          <div className="text-xs text-muted text-center mt-8">Loading conversation…</div>
        ) : error && messages.length === 0 ? (
          <ErrorState message={error} onRetry={onRetry} />
        ) : messages.length === 0 ? (
          <div className="text-xs text-muted text-center mt-8">
            No messages yet — say hello to {otherFirstName}.
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {messages.map((m) => {
              const mine = m.senderEmployeeId === currentEmployeeId;
              return (
                <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${
                      mine ? "bg-accent text-white rounded-br-sm" : "bg-canvas text-ink rounded-bl-sm"
                    }`}
                  >
                    <div className="whitespace-pre-wrap break-words">{m.body}</div>
                    <div className={`text-[10px] mt-1 ${mine ? "text-white/70" : "text-muted"}`}>
                      {new Date(m.createdAt).toLocaleTimeString("en-IN", {
                        hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata",
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {error && messages.length > 0 && (
        <div className="px-6 py-2 text-xs text-rosePri">{error}</div>
      )}

      <div className="p-4 border-t border-line shrink-0 flex items-end gap-2">
        <textarea
          value={draft}
          onChange={(e) => onDraftChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          placeholder="Write a message…"
          rows={1}
          className="flex-1 resize-none rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-lineHover max-h-28"
        />
        <button
          onClick={onSend}
          disabled={!draft.trim() || sending}
          className="h-9 w-9 shrink-0 rounded-lg bg-accent hover:bg-accentHover disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors"
          aria-label="Send message"
        >
          <Send size={16} />
        </button>
      </div>
    </>
  );
}