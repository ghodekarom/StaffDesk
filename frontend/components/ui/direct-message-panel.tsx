"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useMessageThread } from "@/lib/hooks/use-message-thread";
import { MessageThreadBody } from "@/components/ui/message-thread-body";

interface DirectMessagePanelProps {
  recipientId: number;
  recipientName: string;
  onClose: () => void;
}

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

export function DirectMessagePanel({ recipientId, recipientName, onClose }: DirectMessagePanelProps) {
  const { employeeId } = useAuth();
  const { messages, loading, error, sending, send, reload } = useMessageThread(recipientId);
  const [draft, setDraft] = useState("");

  async function handleSend() {
    const body = draft;
    setDraft("");
    try {
      await send(body);
    } catch {
      setDraft(body); // give the text back so nothing typed is lost on a failed send
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

        <MessageThreadBody
          messages={messages}
          loading={loading}
          error={error}
          sending={sending}
          currentEmployeeId={employeeId}
          otherFirstName={recipientName.split(" ")[0]}
          draft={draft}
          onDraftChange={setDraft}
          onSend={handleSend}
          onRetry={reload}
        />
      </div>
    </div>
  );
}