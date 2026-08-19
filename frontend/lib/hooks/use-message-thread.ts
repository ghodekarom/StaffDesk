"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api, ApiError } from "@/lib/api";

export interface DirectMessage {
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

// Polling interval while a thread is open. Deliberately not a websocket —
// a few seconds of lag is acceptable for an HR tool's DMs, and REST +
// polling means no new backend infra (connection lifecycle, reconnects,
// auth-over-socket). If this ever needs to feel like real-time chat, this
// constant is the one place that would change.
const POLL_MS = 8000;

export function useMessageThread(otherEmployeeId: number) {
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  // `load` is only re-created when otherEmployeeId changes (see its deps
  // below), so a plain closure over `messages` would always see the value
  // from the hook's first render — a ref sidesteps that staleness.
  const messageCountRef = useRef(0);

  const load = useCallback(async () => {
    try {
      const data = await api.get<MessagePage>(
        `/messages/thread/${otherEmployeeId}`,
        { size: 50, sort: "createdAt,asc" },
        { fresh: true }
      );
      const content = data?.content ?? [];
      messageCountRef.current = content.length;
      setMessages(content);
      setError(null);
    } catch (err) {
      // Only surface an error banner if we have nothing on screen yet — a
      // poll that temporarily fails shouldn't blank out a conversation
      // someone is actively reading; it'll just quietly retry next tick.
      if (messageCountRef.current === 0) {
        setError(err instanceof ApiError ? err.message : "We couldn't load this conversation.");
      }
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otherEmployeeId]);

  useEffect(() => {
    setLoading(true);
    load();
    const interval = setInterval(load, POLL_MS);
    return () => clearInterval(interval);
  }, [load]);

  const send = useCallback(
    async (body: string) => {
      const trimmed = body.trim();
      if (!trimmed || sending) return;
      setSending(true);
      try {
        await api.post("/messages", { recipientEmployeeId: otherEmployeeId, body: trimmed });
        await load();
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Couldn't send that message. Try again.");
        throw err;
      } finally {
        setSending(false);
      }
    },
    [otherEmployeeId, sending, load]
  );

  return { messages, loading, error, sending, send, reload: load };
}