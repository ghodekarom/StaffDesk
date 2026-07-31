"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

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

  return (
    <div
      className="fixed inset-0 bg-slate-900/45 backdrop-blur-sm z-[60] flex items-start justify-center pt-20 px-4"
      onClick={onClose}
    >
      <div
        className="w-[500px] max-w-[90vw] bg-surface border border-line rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          type="text"
          placeholder="Type a command or search view..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full h-12 px-4 border-b border-line bg-transparent text-sm text-ink outline-none"
          autoFocus
        />
        <div className="p-2 max-h-64 overflow-y-auto space-y-1">
          <div
            className="p-2.5 rounded-md text-xs sm:text-sm cursor-pointer flex justify-between items-center text-muted hover:bg-canvas hover:text-ink"
            onClick={() => navigate("/")}
          >
            <span>Go to Overview Dashboard</span>
            <kbd className="text-[10px] border border-line px-1.5 py-0.5 rounded">Nav</kbd>
          </div>
          <div
            className="p-2.5 rounded-md text-xs sm:text-sm cursor-pointer flex justify-between items-center text-muted hover:bg-canvas hover:text-ink"
            onClick={() => navigate("/employees")}
          >
            <span>Open Employee Directory</span>
            <kbd className="text-[10px] border border-line px-1.5 py-0.5 rounded">Nav</kbd>
          </div>
          <div
            className="p-2.5 rounded-md text-xs sm:text-sm cursor-pointer flex justify-between items-center text-muted hover:bg-canvas hover:text-ink"
            onClick={() => navigate("/departments")}
          >
            <span>Open Departments Hierarchy</span>
            <kbd className="text-[10px] border border-line px-1.5 py-0.5 rounded">Nav</kbd>
          </div>
          <div
            className="p-2.5 rounded-md text-xs sm:text-sm cursor-pointer flex justify-between items-center text-muted hover:bg-canvas hover:text-ink"
            onClick={() => navigate("/attendance")}
          >
            <span>Open Attendance Tracker</span>
            <kbd className="text-[10px] border border-line px-1.5 py-0.5 rounded">Nav</kbd>
          </div>
          <div
            className="p-2.5 rounded-md text-xs sm:text-sm cursor-pointer flex justify-between items-center text-muted hover:bg-canvas hover:text-ink"
            onClick={() => navigate("/leave")}
          >
            <span>Open Leave Requests</span>
            <kbd className="text-[10px] border border-line px-1.5 py-0.5 rounded">Nav</kbd>
          </div>
        </div>
      </div>
    </div>
  );
}

function Router() {
  return useRouter();
}