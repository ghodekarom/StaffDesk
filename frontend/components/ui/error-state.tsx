"use client";

import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

// Mirrors EmptyState's layout and motion so a failed fetch reads as a
// distinct, recognizable state rather than a generic red box — and so it's
// never visually confusable with "no records yet" (see the /attendance
// endpoint bug this was built to guard against).
export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex flex-col items-center justify-center p-8 sm:p-12 text-center"
    >
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-canvas border border-rosePri/20 shadow-sm text-rosePri">
        <AlertTriangle size={32} />
      </div>
      <h3 className="mb-2 font-display text-lg font-bold text-ink">Couldn&apos;t load this</h3>
      <p className="mb-6 max-w-sm text-sm text-muted">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-xs font-medium text-accent hover:underline"
        >
          Retry
        </button>
      )}
    </motion.div>
  );
}