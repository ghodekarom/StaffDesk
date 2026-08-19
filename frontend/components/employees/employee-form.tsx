"use client";

import { FormEvent, useState } from "react";
import { Field, Input } from "@/components/ui/input";
import { Combobox } from "@/components/ui/combobox";
import { Button } from "@/components/ui/button";
import { Employee, EmployeeRequest } from "@/types/employee";
import { Role } from "@/types/auth";
import { ApiError } from "@/lib/api";

type FormErrors = Partial<Record<keyof EmployeeRequest, string>> & {
  loginPassword?: string;
};

const ROLES: Role[] = ["ADMIN", "HR", "MANAGER", "EMPLOYEE"];

export interface EmployeeFormSubmitData {
  employee: EmployeeRequest;
  // Present only when the ADMIN opted in via the inline "Create login"
  // checkbox on the Add employee form. Absent for edits, and absent for
  // non-ADMIN callers since they can't hit POST /auth/register anyway.
  login?: { email: string; password: string; role: Role };
}

export function EmployeeForm({
  initial,
  onSubmit,
  onCancel,
  allowInlineLogin = false,
}: {
  initial?: Employee;
  onSubmit: (data: EmployeeFormSubmitData) => Promise<void>;
  onCancel: () => void;
  // Show the optional "create a login for this employee" section.
  // Only makes sense for ADMIN, and only on create (not edit) -- an
  // existing employee's login state is already handled by the
  // per-row "Create login" action on the Employees table.
  allowInlineLogin?: boolean;
}) {
  const [form, setForm] = useState<EmployeeRequest>({
    employeeCode: initial?.employeeCode ?? "",
    firstName: initial?.firstName ?? "",
    lastName: initial?.lastName ?? "",
    email: initial?.email ?? "",
    phone: initial?.phone ?? "",
    designation: initial?.designation ?? "",
    dateOfJoining: initial?.dateOfJoining ?? "",
    departmentId: initial?.departmentId ?? null,
    managerId: initial?.managerId ?? null,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [createLogin, setCreateLogin] = useState(false);
  const [loginPassword, setLoginPassword] = useState("");
  const [loginRole, setLoginRole] = useState<Role>("EMPLOYEE");

  function update<K extends keyof EmployeeRequest>(key: K, value: EmployeeRequest[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function validate(): boolean {
    const next: FormErrors = {};
    if (!form.employeeCode.trim()) next.employeeCode = "Required";
    if (!form.firstName.trim()) next.firstName = "Required";
    if (!form.lastName.trim()) next.lastName = "Required";
    if (!form.email.trim()) next.email = "Required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Enter a valid email";

    if (createLogin) {
      if (!loginPassword) next.loginPassword = "Required";
      else if (loginPassword.length < 8) next.loginPassword = "Must be at least 8 characters";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      await onSubmit({
        employee: form,
        login: createLogin ? { email: form.email, password: loginPassword, role: loginRole } : undefined,
      });
    } catch (err) {
      if (err instanceof ApiError) {
        setSubmitError(err.message);
      } else {
        setSubmitError("Something went wrong. Try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Employee code" htmlFor="employeeCode" error={errors.employeeCode}>
          <Input
            id="employeeCode"
            value={form.employeeCode}
            onChange={(e) => update("employeeCode", e.target.value)}
          />
        </Field>
        <Field label="Designation" htmlFor="designation">
          <Input
            id="designation"
            value={form.designation ?? ""}
            onChange={(e) => update("designation", e.target.value)}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="First name" htmlFor="firstName" error={errors.firstName}>
          <Input
            id="firstName"
            value={form.firstName}
            onChange={(e) => update("firstName", e.target.value)}
          />
        </Field>
        <Field label="Last name" htmlFor="lastName" error={errors.lastName}>
          <Input
            id="lastName"
            value={form.lastName}
            onChange={(e) => update("lastName", e.target.value)}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Email" htmlFor="email" error={errors.email}>
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
          />
        </Field>
        <Field label="Phone" htmlFor="phone">
          <Input
            id="phone"
            value={form.phone ?? ""}
            onChange={(e) => update("phone", e.target.value)}
          />
        </Field>
      </div>

      <Field label="Date of joining" htmlFor="dateOfJoining">
        <Input
          id="dateOfJoining"
          type="date"
          value={form.dateOfJoining ?? ""}
          onChange={(e) => update("dateOfJoining", e.target.value)}
        />
      </Field>

      {/* Was a raw numeric-id input; now a type-ahead search against the
          real Departments/Employees endpoints. */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Department" htmlFor="departmentId">
          <Combobox
            id="departmentId"
            placeholder="Search departments…"
            value={form.departmentId}
            initialLabel={initial?.departmentName}
            searchPath="/departments"
            mapOption={(dept) => ({ id: dept.id, label: dept.name })}
            onChange={(id) => update("departmentId", id)}
          />
        </Field>
        <Field label="Manager" htmlFor="managerId">
          <Combobox
            id="managerId"
            placeholder="Search employees…"
            value={form.managerId}
            initialLabel={initial?.managerName}
            searchPath="/employees"
            mapOption={(emp) => ({
              id: emp.id,
              label: `${emp.firstName} ${emp.lastName}`,
              sublabel: emp.employeeCode,
            })}
            onChange={(id) => update("managerId", id)}
          />
        </Field>
      </div>

      {allowInlineLogin && (
        <div className="rounded-md border border-line bg-canvas p-3">
          <label className="flex items-center gap-2 text-sm font-medium text-ink cursor-pointer">
            <input
              type="checkbox"
              checked={createLogin}
              onChange={(e) => setCreateLogin(e.target.checked)}
              className="h-4 w-4 rounded border-line accent-accent"
            />
            Create a login for this employee
          </label>

          {createLogin && (
            <div className="mt-3 flex flex-col gap-3">
              <p className="text-xs text-muted">
                Uses the email above. Set a temporary password — ask them to change it after their
                first sign-in.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Temporary password" htmlFor="loginPassword" error={errors.loginPassword}>
                  <Input
                    id="loginPassword"
                    type="text"
                    autoComplete="off"
                    placeholder="At least 8 characters"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                </Field>
                <Field label="Role" htmlFor="loginRole">
                  <select
                    id="loginRole"
                    value={loginRole}
                    onChange={(e) => setLoginRole(e.target.value as Role)}
                    className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            </div>
          )}
        </div>
      )}

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
          {submitting ? "Saving…" : initial ? "Save changes" : "Add employee"}
        </Button>
      </div>
    </form>
  );
}