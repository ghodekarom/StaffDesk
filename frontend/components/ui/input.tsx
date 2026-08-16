"use client";

import { InputHTMLAttributes, forwardRef, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { motion } from "framer-motion";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => (
    <input
      ref={ref}
      className={clsx(
        "w-full rounded-md border bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted/60",
        error ? "border-status-terminated" : "border-line",
        "focus:border-accent focus:outline-none",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  // Shake the field only on the transition into an error, not while it
  // stays in one — otherwise every re-render with the same error message
  // would replay the animation.
  const prevError = useRef<string | undefined>(undefined);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (error && !prevError.current) {
      setShake(true);
      const t = setTimeout(() => setShake(false), 400);
      prevError.current = error;
      return () => clearTimeout(t);
    }
    prevError.current = error;
  }, [error]);

  return (
    <motion.div
      className="flex flex-col gap-1.5"
      animate={shake ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
    >
      <label htmlFor={htmlFor} className="text-sm font-medium text-ink">
        {label}
      </label>
      {children}
      {error && (
        <motion.span
          initial={{ opacity: 0, y: -2 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          className="text-xs text-status-terminated"
        >
          {error}
        </motion.span>
      )}
    </motion.div>
  );
}