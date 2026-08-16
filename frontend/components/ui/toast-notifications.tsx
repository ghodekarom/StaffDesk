"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

type ToastType = "info" | "success" | "error";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
});

export const useToast = () => useContext(ToastContext);

const TOAST_DURATION = 3000;

const TYPE_STYLES: Record<
  ToastType,
  { border: string; icon: React.ReactNode; iconColor: string; bar: string }
> = {
  success: {
    border: "border-l-status-active",
    icon: <CheckCircle2 size={16} />,
    iconColor: "text-status-active",
    bar: "bg-status-active",
  },
  error: {
    border: "border-l-status-terminated",
    icon: <XCircle size={16} />,
    iconColor: "text-status-terminated",
    bar: "bg-status-terminated",
  },
  info: {
    border: "border-l-accent",
    icon: <Info size={16} />,
    iconColor: "text-accent",
    bar: "bg-accent",
  },
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const style = TYPE_STYLES[toast.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 40, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.95, transition: { duration: 0.15 } }}
      transition={{ type: "spring", stiffness: 420, damping: 32 }}
      className={`pointer-events-auto relative overflow-hidden rounded-lg border-l-[3px] bg-surface px-4 py-3 text-xs font-medium text-ink shadow-xl sm:text-sm ${style.border}`}
    >
      <div className="flex items-center gap-2.5 pr-5">
        <span className={style.iconColor}>{style.icon}</span>
        <span>{toast.message}</span>
        <button
          onClick={() => onDismiss(toast.id)}
          aria-label="Dismiss"
          className="absolute right-2 top-2 rounded p-0.5 text-muted hover:text-ink"
        >
          <X size={12} />
        </button>
      </div>
      <motion.div
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: TOAST_DURATION / 1000, ease: "linear" }}
        className={`absolute bottom-0 left-0 h-[2px] ${style.bar}`}
      />
    </motion.div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = "success") => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, TOAST_DURATION);
    },
    []
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[100] flex max-w-[90vw] flex-col gap-2">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}