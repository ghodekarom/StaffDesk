"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex flex-col items-center justify-center p-8 sm:p-12 text-center"
    >
      {icon && (
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-canvas border border-line shadow-sm text-muted">
          {icon}
        </div>
      )}
      <h3 className="mb-2 font-display text-lg font-bold text-ink">{title}</h3>
      <p className="mb-6 max-w-sm text-sm text-muted">{description}</p>
      {action && <div>{action}</div>}
    </motion.div>
  );
}
