"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const navigate = (path: string) => {
    router.push(path);
    onClose();
  };

  const filtered = NAV_COMMANDS.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-start justify-center pt-20 px-4"
      onClick={onClose}
    >
      <div
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
        <div className="p-2 max-h-64 overflow-y-auto space-y-1">
          {filtered.map((cmd) => (
            <div
              key={cmd.path}
              className="p-2.5 rounded-md text-xs sm:text-sm cursor-pointer flex justify-between items-center text-[#9d9cae] hover:bg-[#26263a]/50 hover:text-[#e6e6ef]"
              onClick={() => navigate(cmd.path)}
            >
              <span>{cmd.label}</span>
              <kbd className="text-[10px] border border-[#26263a] px-1.5 py-0.5 rounded">Nav</kbd>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="px-3 py-4 text-sm text-[#9d9cae]">No matching commands</p>
          )}
        </div>
      </div>
    </div>
  );
}
