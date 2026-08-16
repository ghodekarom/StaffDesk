"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";

const EXIT_DURATION = 0.16;

export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const [closing, setClosing] = useState(false);

  // Instead of calling the parent's onClose immediately, play the exit
  // animation first and only unmount once it finishes. Call sites don't
  // need to change anything — they still just stop rendering <Modal /> when
  // this fires, it just now happens ~160ms later.
  const requestClose = useCallback(() => {
    setClosing(true);
    setTimeout(onClose, EXIT_DURATION * 1000);
  }, [onClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && requestClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [requestClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: closing ? 0 : 1 }}
      transition={{ duration: EXIT_DURATION }}
      onClick={requestClose}
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/50 px-3 py-6 sm:px-4 sm:py-10"
    >
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.97 }}
        animate={
          closing
            ? { opacity: 0, y: 8, scale: 0.97 }
            : { opacity: 1, y: 0, scale: 1 }
        }
        transition={{ duration: EXIT_DURATION, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        // max-h + flex column so the body scrolls internally instead of the
        // modal getting clipped by short mobile viewports.
        className="flex max-h-[90dvh] w-full max-w-lg flex-col rounded-lg border border-line bg-surface shadow-xl"
      >
        <div className="flex flex-shrink-0 items-center justify-between border-b border-line px-4 py-3 sm:px-5 sm:py-4">
          <h2 id="modal-title" className="font-display text-lg font-semibold text-ink">
            {title}
          </h2>
          <button
            onClick={requestClose}
            aria-label="Close"
            className="rounded-md p-1 text-muted hover:bg-canvas"
          >
            ✕
          </button>
        </div>
        <div className="overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">{children}</div>
      </motion.div>
    </motion.div>
  );
}