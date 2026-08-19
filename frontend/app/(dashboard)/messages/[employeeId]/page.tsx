"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useMessageThread } from "@/lib/hooks/use-message-thread";
import { MessageThreadBody } from "@/components/ui/message-thread-body";
import { Employee } from "@/types/employee";

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

export default function MessageThreadPage() {
  const params = useParams<{ employeeId: string }>();
  const otherEmployeeId = Number(params.employeeId);
  const router = useRouter();
  const { employeeId } = useAuth();

  const [otherName, setOtherName] = useState<string | null>(null);
  const [nameError, setNameError] = useState(false);
  const { messages, loading, error, sending, send, reload } = useMessageThread(otherEmployeeId);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (!Number.isFinite(otherEmployeeId)) return;
    api.get<Employee>(`/employees/${otherEmployeeId}`)
      .then((emp) => setOtherName(`${emp.firstName} ${emp.lastName}`))
      .catch(() => {
        // The other person may no longer be an active employee — the
        // conversation and its messages still exist and should still be
        // readable, so this degrades to a generic label rather than
        // blocking the whole page.
        setOtherName("Former employee");
        setNameError(true);
      });
  }, [otherEmployeeId]);

  async function handleSend() {
    const body = draft;
    setDraft("");
    try {
      await send(body);
    } catch {
      setDraft(body);
    }
  }

  if (!Number.isFinite(otherEmployeeId)) {
    router.replace("/messages");
    return null;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] md:h-[calc(100vh-3.5rem)] -m-5 md:-mx-6 md:-mb-8">
      <div className="flex items-center gap-3 px-5 md:px-6 py-4 border-b border-line shrink-0">
        <Link href="/messages" className="text-muted hover:text-ink p-1 -ml-1" aria-label="Back to messages">
          <ArrowLeft size={18} />
        </Link>
        <div className="w-8 h-8 rounded-lg bg-accent text-white text-xs font-semibold flex items-center justify-center shrink-0">
          {otherName ? initials(otherName) : "…"}
        </div>
        <div className="font-display font-bold text-sm text-ink">
          {otherName ?? "Loading…"}
          {nameError && <span className="ml-2 text-[11px] font-normal text-muted">(no longer active)</span>}
        </div>
      </div>

      <MessageThreadBody
        messages={messages}
        loading={loading}
        error={error}
        sending={sending}
        currentEmployeeId={employeeId}
        otherFirstName={(otherName ?? "them").split(" ")[0]}
        draft={draft}
        onDraftChange={setDraft}
        onSend={handleSend}
        onRetry={reload}
      />
    </div>
  );
}