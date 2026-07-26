"use client";

import { useState, FormEvent } from "react";
import { Department, DepartmentRequest } from "@/types/department";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";

interface Props {
  initial?: Department;
  onSubmit: (data: DepartmentRequest) => Promise<void>;
  onCancel: () => void;
}

export function DepartmentForm({ initial, onSubmit, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [headEmployeeId, setHeadEmployeeId] = useState<number | null>(
    initial?.headEmployeeId ?? null
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        headEmployeeId,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save department.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <div className="rounded-md bg-status-terminatedBg px-3 py-2 text-sm text-status-terminated">
          {error}
        </div>
      )}

      <div className="space-y-1">
        <label htmlFor="dept-name" className="text-sm font-medium text-ink">
          Department name
        </label>
        <input
          id="dept-name"
          type="text"
          required
          maxLength={100}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="dept-head" className="text-sm font-medium text-ink">
          Head employee (optional)
        </label>
        <Combobox
          id="dept-head"
          placeholder="Search employees by name…"
          value={headEmployeeId}
          initialLabel={initial?.headEmployeeName}
          searchPath="/employees"
          mapOption={(emp) => ({
            id: emp.id,
            label: `${emp.firstName} ${emp.lastName}`,
            sublabel: emp.employeeCode,
          })}
          onChange={setHeadEmployeeId}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : "Save"}
        </Button>
      </div>
    </form>
  );
}
