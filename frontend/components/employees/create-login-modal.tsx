"use client";

import { FormEvent, useState } from "react";
import { Field, Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Employee } from "@/types/employee";
import { RegisterPayload, Role } from "@/types/auth";
import { ApiError } from "@/lib/api";

const ROLES: Role[] = ["ADMIN", "HR", "MANAGER", "EMPLOYEE"];

// ADMIN-only action (mirrors POST /auth/register's @PreAuthorize) for giving
// an employee who was added via POST /employees a way to actually log in.
// See: employee-login-gap-issue.md
export function CreateLoginModal({
  employee,
  onSubmit,
  onCancel,
}: {
  employee: Employee;
  onSubmit: (data: RegisterPayload) => Promise<void>;
  onCancel: () => void;
}) {
  const [email, setEmail] = useState(employee.email ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("EMPLOYEE");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function validate(): boolean {
    const next: { email?: string; password?: string } = {};
    if (!email.trim()) next.email = "Required";
    else if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "Enter a valid email";
    if (!password) next.password = "Required";
    else if (password.length < 8) next.password = "Must be at least 8 characters";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      await onSubmit({ employeeId: employee.id, email, password, role });
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <p className="text-sm text-muted">
        {employee.firstName} {employee.lastName} has an HR record but no way to sign in yet.
        This creates their login account.
      </p>

      <Field label="Email" htmlFor="login-email" error={errors.email}>
        <Input
          id="login-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </Field>

      <Field label="Temporary password" htmlFor="login-password" error={errors.password}>
        <Input
          id="login-password"
          type="text"
          autoComplete="off"
          placeholder="At least 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </Field>

      <Field label="Role" htmlFor="login-role">
        <select
          id="login-role"
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
          className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent"
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </Field>

      {submitError && (
        <p className="rounded-md bg-status-terminatedBg px-3 py-2 text-sm text-status-terminated">
          {submitError}
        </p>
      )}

      <div className="mt-2 flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Creating…" : "Create login"}
        </Button>
      </div>
    </form>
  );
}