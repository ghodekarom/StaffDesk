"use client";

import { useEffect, useRef, useState } from "react";
import { Send, X } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { ErrorState } from "@/components/ui/error-state";

interface DirectMessage {
  id: number;
  senderEmployeeId: number;
  recipientEmployeeId: number;
  body: string;
  read: boolean;
  createdAt: string;
}
interface MessagePage {
  content: DirectMessage[];
}

interface DirectMessagePanelProps {
  recipientId: number;
  recipientName: string;
  onClose: () => void;
}

// Polling interval while a thread is open. This is deliberately not a
// websocket — see the plan discussed for this feature: a few seconds of
// lag is acceptable for an HR tool's DMs, and REST + polling means no new
// backend infra (connection lifecycle, reconnects, auth-over-socket).
// If this ever needs to feel like real-time chat, this is the one place
// that would change.
const POLL_MS = 8000;

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

export function DirectMessagePanel({ recipientId, recipientName, onClose }: DirectMessagePanelProps) {
  const { employeeId } = useAuth();
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function loadThread(fresh: boolean) {
    try {
      const data = await api.get<MessagePage>(
        `/messages/thread/${recipientId}`,
        { size: 50, sort: "createdAt,asc" },
        { fresh }
      );
      setMessages(data?.content ?? []);
      setError(null);
    } catch (err) {
      // Only the first load surfaces an error banner — a poll that
      // temporarily fails shouldn't blank out a conversation someone is
      // actively reading; it'll just quietly retry on the next tick.
      if (fresh === false || messages.length === 0) {
        setError(err instanceof ApiError ? err.message : "We couldn't load this conversation.");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadThread(true);
    const interval = setInterval(() => loadThread(true), POLL_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipientId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function handleSend() {
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    try {
      await api.post("/messages", { recipientEmployeeId: recipientId, body });
      setDraft("");
      await loadThread(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't send that message. Try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[60] flex justify-end" onClick={onClose}>
      <div
        className="w-[420px] max-w-full bg-surface/95 backdrop-blur-2xl border-l border-line h-full shadow-2xl animate-[slideDrawer_0.25s_cubic-bezier(0.16,1,0.3,1)] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-line shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-accent text-white text-xs font-semibold flex items-center justify-center shrink-0">
              {initials(recipientName)}
            </div>
            <div className="font-display font-bold text-sm text-ink">{recipientName}</div>
          </div>
          <button onClick={onClose} className="text-muted hover:text-ink p-1 leading-none">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="text-xs text-muted text-center mt-8">Loading conversation…</div>
          ) : error && messages.length === 0 ? (
            <ErrorState message={error} onRetry={() => loadThread(true)} />
          ) : messages.length === 0 ? (
            <div className="text-xs text-muted text-center mt-8">
              No messages yet — say hello to {recipientName.split(" ")[0]}.
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {messages.map((m) => {
                const mine = m.senderEmployeeId === employeeId;
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
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Write a message…"
            rows={1}
            className="flex-1 resize-none rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-lineHover max-h-28"
          />
          <button
            onClick={handleSend}
            disabled={!draft.trim() || sending}
            className="h-9 w-9 shrink-0 rounded-lg bg-accent hover:bg-accentHover disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors"
            aria-label="Send message"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}