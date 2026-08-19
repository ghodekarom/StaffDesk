"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";

interface ThreadSummary {
  otherEmployeeId: number;
  otherEmployeeName: string;
  lastMessageBody: string;
  lastMessageAt: string;
  lastMessageMine: boolean;
  unreadCount: number;
}

// Same rationale as the thread view: short polling rather than a
// websocket, so a new incoming message's preview appears here without a
// manual refresh, at the cost of a few seconds of lag.
const POLL_MS = 15000;

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function relativeTime(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

export default function MessagesInboxPage() {
  const [threads, setThreads] = useState<ThreadSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const data = await api.get<ThreadSummary[]>("/messages/threads", undefined, { fresh: true });
      setThreads(data ?? []);
      setError(null);
    } catch (err) {
      if (!threads || threads.length === 0) {
        setError(err instanceof ApiError ? err.message : "We couldn't load your messages.");
      }
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, POLL_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <h1 className="font-display text-xl font-bold text-ink mb-5">Messages</h1>

      {error && (!threads || threads.length === 0) ? (
        <ErrorState message={error} onRetry={load} />
      ) : threads === null ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-card border border-line animate-pulse" />
          ))}
        </div>
      ) : threads.length === 0 ? (
        <EmptyState
          icon={<MessageSquare size={32} />}
          title="No conversations yet"
          description="Direct messages you send or receive will show up here."
        />
      ) : (
        <div className="rounded-xl border border-line overflow-hidden divide-y divide-line bg-card">
          {threads.map((t) => (
            <Link
              key={t.otherEmployeeId}
              href={`/messages/${t.otherEmployeeId}`}
              className="flex items-center gap-3 px-4 py-3 hover:bg-canvas transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-accent text-white text-xs font-semibold flex items-center justify-center shrink-0">
                {initials(t.otherEmployeeName)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-sm truncate ${t.unreadCount > 0 ? "font-semibold text-ink" : "font-medium text-ink"}`}>
                    {t.otherEmployeeName}
                  </span>
                  <span className="text-[11px] text-muted shrink-0">{relativeTime(t.lastMessageAt)}</span>
                </div>
                <div className="flex items-center justify-between gap-2 mt-0.5">
                  <span className="text-xs text-muted truncate">
                    {t.lastMessageMine && "You: "}
                    {t.lastMessageBody}
                  </span>
                  {t.unreadCount > 0 && (
                    <span className="shrink-0 min-w-[18px] h-[18px] px-1 rounded-full bg-accent text-white text-[10px] font-medium flex items-center justify-center">
                      {t.unreadCount > 9 ? "9+" : t.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}