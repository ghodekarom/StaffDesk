"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCheck } from "lucide-react";
import { api } from "@/lib/api";
import { Notification, NotificationPage } from "@/types/notification";

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  /** Called after a read/read-all action succeeds, so the parent can refresh its badge count. */
  onCountChanged: () => void;
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function NotificationPanel({ isOpen, onClose, onCountChanged }: NotificationPanelProps) {
  const router = useRouter();
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    setLoading(true);
    setError(false);

    api
      .get<NotificationPage>("/notifications", { size: 10 }, { fresh: true })
      .then((data) => {
        if (!cancelled) setItems(data?.content ?? []);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  const handleSelect = async (n: Notification) => {
    if (!n.read) {
      setItems((prev) => prev.map((i) => (i.id === n.id ? { ...i, read: true } : i)));
      try {
        await api.patch(`/notifications/${n.id}/read`);
        onCountChanged();
      } catch {
        // Revert optimistic update on failure
        setItems((prev) => prev.map((i) => (i.id === n.id ? { ...i, read: false } : i)));
      }
    }
    onClose();
    if (n.link) router.push(n.link);
  };

  const handleMarkAllRead = async () => {
    const previous = items;
    setItems((prev) => prev.map((i) => ({ ...i, read: true })));
    try {
      await api.post("/notifications/read-all");
      onCountChanged();
    } catch {
      setItems(previous);
    }
  };

  const hasUnread = items.some((i) => !i.read);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Click-away layer */}
          <div className="fixed inset-0 z-[45]" onClick={onClose} />

          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute top-10 right-0 z-[46] w-80 max-w-[calc(100vw-2rem)] max-h-[26rem] flex flex-col bg-[#1b1b29] border border-[#26263a] rounded-xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#26263a] shrink-0">
              <span className="text-[13px] font-medium text-[#e6e6ef]">Notifications</span>
              {hasUnread && (
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-1 text-[11px] text-[#9d9cae] hover:text-[#c9c2ff] transition-colors"
                >
                  <CheckCheck size={13} />
                  Mark all read
                </button>
              )}
            </div>

            <div className="overflow-y-auto flex-1">
              {loading && (
                <div className="px-4 py-8 text-center text-[12px] text-[#9d9cae]">Loading…</div>
              )}

              {!loading && error && (
                <div className="px-4 py-8 text-center text-[12px] text-[#f0a3a3]">
                  Couldn&apos;t load notifications. Try again shortly.
                </div>
              )}

              {!loading && !error && items.length === 0 && (
                <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                  <Bell size={20} className="text-[#4a4a5e]" />
                  <span className="text-[12px] text-[#9d9cae]">You&apos;re all caught up</span>
                </div>
              )}

              {!loading &&
                !error &&
                items.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => handleSelect(n)}
                    className="w-full text-left px-4 py-3 border-b border-[#26263a] last:border-b-0 hover:bg-white/[0.03] transition-colors flex gap-2.5"
                  >
                    <span
                      className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${
                        n.read ? "bg-transparent" : "bg-[#8b7ffb]"
                      }`}
                    />
                    <div className="min-w-0">
                      <div className="text-[12.5px] font-medium text-[#e6e6ef] truncate">
                        {n.title}
                      </div>
                      <div className="text-[12px] text-[#9d9cae] line-clamp-2 mt-0.5">
                        {n.message}
                      </div>
                      <div className="text-[11px] text-[#6b6a7e] mt-1">{timeAgo(n.createdAt)}</div>
                    </div>
                  </button>
                ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}