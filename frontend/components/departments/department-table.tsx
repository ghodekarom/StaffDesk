"use client";

import { useEffect, useRef, useState } from "react";
import { Department } from "@/types/department";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import {
  Headphones,
  Code2,
  Wallet,
  Users,
  Cpu,
  Scale,
  Megaphone,
  Settings2,
  ShoppingCart,
  Package,
  ShieldCheck,
  FlaskConical,
  TrendingUp,
  Building2,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";

interface Props {
  departments: Department[];
  onEdit: (department: Department) => void;
  onDelete: (department: Department) => void;
}

// Icon + color are chosen from what the department actually is (by keyword
// match on its name), not from the row's id — so the same department always
// shows the same, unique icon instead of shuffling or colliding with others.
// Badge background is intentionally transparent for every department; only
// the icon color differs, so cards stay visually distinct without tinted
// tiles. Order matters: more specific matches (e.g. "Information Technology",
// "Research & Development") are listed before broader ones (e.g. "engineer")
// that could otherwise also match their words.
const DEPARTMENT_STYLES: { match: RegExp; icon: typeof Building2; text: string }[] = [
  { match: /support|customer/i, icon: Headphones, text: "text-sky-500" },
  { match: /information technology|\bit\b/i, icon: Cpu, text: "text-violet-500" },
  { match: /research\s*&?\s*development|\br&?d\b/i, icon: FlaskConical, text: "text-purple-500" },
  { match: /engineer/i, icon: Code2, text: "text-indigo-500" },
  { match: /financ|account/i, icon: Wallet, text: "text-amber-500" },
  { match: /human resource|^hr$|\bhr\b/i, icon: Users, text: "text-emerald-500" },
  { match: /legal/i, icon: Scale, text: "text-rose-500" },
  { match: /marketing/i, icon: Megaphone, text: "text-teal-500" },
  { match: /operations?/i, icon: Settings2, text: "text-orange-500" },
  { match: /procurement/i, icon: ShoppingCart, text: "text-cyan-500" },
  { match: /product/i, icon: Package, text: "text-fuchsia-500" },
  { match: /quality assurance|\bqa\b/i, icon: ShieldCheck, text: "text-lime-500" },
  { match: /sales/i, icon: TrendingUp, text: "text-pink-500" },
];

const FALLBACK_STYLE = { icon: Building2, text: "text-slate-500" };

function getDepartmentStyle(name: string) {
  return DEPARTMENT_STYLES.find((entry) => entry.match.test(name)) ?? FALLBACK_STYLE;
}

function DepartmentActionsMenu({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={ref} className="absolute top-3 right-3 sm:hidden">
      <button
        type="button"
        aria-label="Department actions"
        onClick={() => setOpen((v) => !v)}
        className="w-7 h-7 flex items-center justify-center rounded-md text-muted hover:bg-line/50"
      >
        <MoreVertical size={16} />
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-32 rounded-lg border border-line bg-card shadow-md z-10 overflow-hidden">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onEdit();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-ink hover:bg-canvas"
          >
            <Pencil size={13} /> Edit
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-roseTxt hover:bg-roseBg/60"
          >
            <Trash2 size={13} /> Delete
          </button>
        </div>
      )}
    </div>
  );
}

export function DepartmentTable({ departments, onEdit, onDelete }: Props) {
  if (departments.length === 0) {
    return (
      <div className="rounded-lg border border-line bg-surface py-16 text-center text-sm text-muted">
        No departments yet.
      </div>
    );
  }

  return (
    <motion.div
      className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4"
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
    >
      <AnimatePresence mode="popLayout">
        {departments.map((dept) => {
          const style = getDepartmentStyle(dept.name);
          const Icon = style.icon;
          const employeeCountLabel = dept.employeeCount === 1 ? "1 employee" : `${dept.employeeCount} employees`;

          return (
            <motion.div
              key={dept.id}
              layout
              variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
              transition={{ duration: 0.2 }}
              className="group relative bg-card border border-line rounded-2xl p-4 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 flex flex-col items-center text-center gap-2 sm:flex-row sm:items-center sm:text-left sm:gap-4"
            >
              {/* Mobile-only actions menu */}
              <DepartmentActionsMenu onEdit={() => onEdit(dept)} onDelete={() => onDelete(dept)} />

              {/* Badge Icon — transparent background, icon color carries the identity */}
              <div className="w-11 h-11 sm:w-12 sm:h-12 shrink-0 rounded-xl bg-transparent border border-line flex items-center justify-center transition-transform group-hover:scale-105">
                <Icon size={20} className={style.text} strokeWidth={2} />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 w-full">
                <h3 className="text-sm font-bold text-ink mb-0.5 truncate group-hover:text-accent transition-colors">
                  {dept.name}
                </h3>
                <p className="text-xs text-muted font-medium mb-1 truncate">
                  {employeeCountLabel}
                </p>
                <div className="text-[11px] text-muted truncate flex items-center gap-1 justify-center sm:justify-start">
                  <span>Head:</span>
                  <span className="font-semibold text-ink">
                    {dept.headEmployeeName ? dept.headEmployeeName : <span className="italic font-normal">Unassigned</span>}
                  </span>
                </div>
              </div>

              {/* Desktop actions */}
              <div className="hidden sm:flex flex-col gap-1 shrink-0">
                <Button
                  variant="ghost"
                  className="px-2 py-1 h-7 text-[10px] bg-canvas hover:bg-line/50 font-semibold"
                  onClick={() => onEdit(dept)}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  className="px-2 py-1 h-7 text-[10px] bg-roseBg text-roseTxt hover:bg-roseBg/80 font-semibold"
                  onClick={() => onDelete(dept)}
                >
                  Delete
                </Button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
}