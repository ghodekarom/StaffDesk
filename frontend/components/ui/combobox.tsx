"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";

interface Option {
  id: number;
  label: string;
  sublabel?: string;
}

interface Props {
  id: string;
  placeholder?: string;
  value: number | null;
  initialLabel?: string | null; // e.g. dept.headEmployeeName, so edit forms show a name, not blank, on open
  searchPath: string; // e.g. "/employees" or "/departments"
  mapOption: (item: any) => Option;
  onChange: (id: number | null) => void;
}

// Debounced type-ahead over a paginated search endpoint. Assumes the
// backend accepts `?search=<query>&size=10` and returns a Page<T> shape
// (`{ content: T[] }`) — matches the same api.get(path, params) pattern
// already used by the Employees/Departments pages. If /employees or
// /departments doesn't have a `search` param yet, that's the one thing
// to add server-side before this works end-to-end.
export function Combobox({ id, placeholder, value, initialLabel, searchPath, mapOption, onChange }: Props) {
  const [query, setQuery] = useState("");
  const [selectedLabel, setSelectedLabel] = useState(initialLabel ?? "");
  const [options, setOptions] = useState<Option[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handle = setTimeout(async () => {
      setLoading(true);
      try {
        const result = await api.get<{ content: any[] }>(searchPath, {
          search: query,
          size: 10,
        });
        setOptions(result.content.map(mapOption));
      } catch {
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(handle);
  }, [query, open, searchPath, mapOption]);

  function select(option: Option | null) {
    onChange(option?.id ?? null);
    setSelectedLabel(option?.label ?? "");
    setQuery("");
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        id={id}
        type="text"
        value={open ? query : selectedLabel}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          if (value !== null) onChange(null); // typing invalidates the prior pick until a new option is chosen
        }}
        placeholder={placeholder}
        autoComplete="off"
        className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted/60 focus:border-accent focus:outline-none"
      />
      {value !== null && !open && (
        <button
          type="button"
          onClick={() => select(null)}
          aria-label="Clear selection"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
        >
          ✕
        </button>
      )}
      {open && (
        <div className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-md border border-line bg-surface shadow-lg">
          {loading && <div className="px-3 py-2 text-sm text-muted">Searching…</div>}
          {!loading && options.length === 0 && (
            <div className="px-3 py-2 text-sm text-muted">No matches.</div>
          )}
          {!loading &&
            options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => select(opt)}
                className="flex w-full flex-col items-start px-3 py-2 text-left text-sm hover:bg-canvas"
              >
                <span className="text-ink">{opt.label}</span>
                {opt.sublabel && <span className="font-mono text-xs text-muted">{opt.sublabel}</span>}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
