import { forwardRef } from "react";
import clsx from "clsx";
import { motion, HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "secondary" | "danger" | "ghost";

// Extend framer-motion's own button prop type (rather than React's
// ButtonHTMLAttributes) so onClick/disabled/className/children etc. all
// resolve to the single, motion-compatible definition instead of clashing
// with React's — motion.button accepts the full set of standard HTML button
// attributes already.
interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: Variant;
  /** Shows a spinner in place of the label and disables the button. */
  loading?: boolean;
  /** Optional label to show while `loading` is true; falls back to `children`. */
  loadingText?: React.ReactNode;
  children?: React.ReactNode;
}

const variants: Record<Variant, string> = {
  primary: "bg-accent text-white hover:bg-accentHover disabled:opacity-50",
  secondary:
    "bg-surface text-ink border border-line hover:bg-canvas disabled:opacity-50",
  danger: "bg-status-terminated text-white hover:opacity-90 disabled:opacity-50",
  ghost: "bg-transparent text-muted hover:bg-canvas disabled:opacity-50",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", loading = false, loadingText, disabled, children, ...props },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <motion.button
        ref={ref}
        whileTap={isDisabled ? undefined : { scale: 0.96 }}
        transition={{ duration: 0.12 }}
        disabled={isDisabled}
        className={clsx(
          "inline-flex items-center justify-center gap-2 rounded-md px-3.5 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed",
          variants[variant],
          className
        )}
        {...props}
      >
        {loading && <Loader2 size={14} className="animate-spin" />}
        {loading ? loadingText ?? children : children}
      </motion.button>
    );
  }
);
Button.displayName = "Button";