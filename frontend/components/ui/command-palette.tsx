"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

const NAV_COMMANDS = [
  { path: "/overview", label: "Go to Overview" },
  { path: "/employees", label: "Open Employees" },
  { path: "/departments", label: "Open Departments" },
  { path: "/attendance", label: "Open Attendance" },
  { path: "/leave", label: "Open Leave" },
  { path: "/settings", label: "Open Settings" },
];

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const filtered = NAV_COMMANDS.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase())
  );

  // Reset the keyboard-selected row whenever the filtered list changes so
  // the highlight never points past the end of a shorter result set.
  useEffect(() => {
    setActiveIndex(0);
  }, [query, isOpen]);

  const navigate = (path: string) => {
    router.push(path);
    onClose();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && filtered[activeIndex]) {
        e.preventDefault();
        navigate(filtered[activeIndex].path);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, onClose, filtered, activeIndex]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-start justify-center pt-20 px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="w-[500px] max-w-[90vw] bg-[#1b1b29] border border-[#26263a] rounded-xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="text"
              placeholder="Type a command or search view..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-12 px-4 border-b border-[#26263a] bg-transparent text-sm text-[#e6e6ef] outline-none placeholder:text-[#9d9cae]"
              autoFocus
            />
            <div className="relative p-2 max-h-64 overflow-y-auto space-y-1">
              {filtered.map((cmd, i) => (
                <div
                  key={cmd.path}
                  onMouseEnter={() => setActiveIndex(i)}
                  onClick={() => navigate(cmd.path)}
                  className="relative p-2.5 rounded-md text-xs sm:text-sm cursor-pointer flex justify-between items-center"
                >
                  {activeIndex === i && (
                    <motion.div
                      layoutId="cmd-highlight"
                      className="absolute inset-0 rounded-md bg-[#26263a]/50"
                      transition={{ type: "spring", stiffness: 500, damping: 40 }}
                    />
                  )}
                  <span className={`relative z-10 ${activeIndex === i ? "text-[#e6e6ef]" : "text-[#9d9cae]"}`}>
                    {cmd.label}
                  </span>
                  <kbd className="relative z-10 text-[10px] border border-[#26263a] px-1.5 py-0.5 rounded">Nav</kbd>
                </div>
              ))}
              {filtered.length === 0 && (
                <p className="px-3 py-4 text-sm text-[#9d9cae]">No matching commands</p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}