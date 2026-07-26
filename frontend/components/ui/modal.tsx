"use client";

import { useEffect } from "react";

export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/50 px-3 py-6 sm:px-4 sm:py-10">
      <div
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
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 text-muted hover:bg-canvas"
          >
            ✕
          </button>
        </div>
        <div className="overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">{children}</div>
      </div>
    </div>
  );
}