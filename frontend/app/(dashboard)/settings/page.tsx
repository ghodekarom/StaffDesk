"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import { useToast } from "@/components/ui/toast-notifications";
import { Button } from "@/components/ui/button";
import { Input, Field } from "@/components/ui/input";
import type { Employee, EmployeeRequest } from "@/types/employee";
import type { NotificationPreferences } from "@/types/notification";

type TabKey = "profile" | "security" | "notifications" | "organization";

interface TabDef {
  key: TabKey;
  label: string;
}

const BASE_TABS: TabDef[] = [
  { key: "profile", label: "Profile" },
  { key: "security", label: "Security" },
  { key: "notifications", label: "Notifications" },
];

const ORG_TAB: TabDef = { key: "organization", label: "Organization" };

/* ─── Small local pill, styled like StatusBadge but not tied to EmployeeStatus ─── */
function Pill({ children, tone = "muted" }: { children: React.ReactNode; tone?: "muted" | "accent" }) {
  return (
    <span
      className={
        tone === "accent"
          ? "inline-flex items-center rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent"
          : "inline-flex items-center rounded-full bg-canvas px-2.5 py-0.5 text-xs font-medium text-muted"
      }
    >
      {children}
    </span>
  );
}

function ComingSoonNotice({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-line bg-canvas px-4 py-3 text-sm text-muted">
      {children}
    </div>
  );
}

/* ─────────────────────────────── Profile ─────────────────────────────── */

function ProfileSection({ employeeId }: { employeeId: number }) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    designation: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .get<Employee>(`/employees/${employeeId}`)
      .then((data) => {
        if (cancelled) return;
        setEmployee(data);
        setForm({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone ?? "",
          designation: data.designation ?? "",
        });
      })
      .catch(() => {
        if (!cancelled) showToast("Couldn't load your profile", "error");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId]);

  const handleChange = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.firstName.trim()) next.firstName = "First name is required";
    if (!form.lastName.trim()) next.lastName = "Last name is required";
    if (!form.email.trim()) next.email = "Email is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee) return;
    if (!validate()) return;

    setSaving(true);
    try {
      // EmployeeRequestDto requires the full record. Fields the person
      // doesn't edit here (employeeCode, department, manager, hire date)
      // are carried over unchanged from what we fetched.
      const payload: EmployeeRequest = {
        employeeCode: employee.employeeCode,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        designation: form.designation.trim() || null,
        dateOfJoining: employee.dateOfJoining,
        departmentId: employee.departmentId,
        managerId: employee.managerId,
      };
      const updated = await api.put<Employee>(`/employees/${employeeId}`, payload);
      setEmployee(updated);
      showToast("Profile updated", "success");
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Couldn't save your profile";
      showToast(message, "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-muted">Loading your profile…</p>;
  }

  if (!employee) {
    return <p className="text-sm text-muted">We couldn&apos;t load your profile. Try refreshing the page.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-xl flex-col gap-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="First name" htmlFor="settings-first-name" error={errors.firstName}>
          <Input
            id="settings-first-name"
            value={form.firstName}
            onChange={handleChange("firstName")}
            error={errors.firstName}
          />
        </Field>
        <Field label="Last name" htmlFor="settings-last-name" error={errors.lastName}>
          <Input
            id="settings-last-name"
            value={form.lastName}
            onChange={handleChange("lastName")}
            error={errors.lastName}
          />
        </Field>
      </div>

      <Field label="Work email" htmlFor="settings-email" error={errors.email}>
        <Input
          id="settings-email"
          type="email"
          value={form.email}
          onChange={handleChange("email")}
          error={errors.email}
        />
      </Field>

      <Field label="Phone" htmlFor="settings-phone">
        <Input id="settings-phone" value={form.phone} onChange={handleChange("phone")} />
      </Field>

      <Field label="Designation" htmlFor="settings-designation">
        <Input id="settings-designation" value={form.designation} onChange={handleChange("designation")} />
      </Field>

      {/* Read-only context — not editable here, kept visible so people know
          who to contact if these need to change. */}
      <div className="grid grid-cols-1 gap-5 border-t border-line pt-5 sm:grid-cols-2">
        <div>
          <span className="text-xs font-medium uppercase tracking-wide text-muted">Employee code</span>
          <p className="mt-1 text-sm text-ink">{employee.employeeCode}</p>
        </div>
        <div>
          <span className="text-xs font-medium uppercase tracking-wide text-muted">Department</span>
          <p className="mt-1 text-sm text-ink">{employee.departmentName ?? "—"}</p>
        </div>
        <div>
          <span className="text-xs font-medium uppercase tracking-wide text-muted">Manager</span>
          <p className="mt-1 text-sm text-ink">{employee.managerName ?? "—"}</p>
        </div>
        <div>
          <span className="text-xs font-medium uppercase tracking-wide text-muted">Date of joining</span>
          <p className="mt-1 text-sm text-ink">{employee.dateOfJoining ?? "—"}</p>
        </div>
      </div>

      <div>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}

/* ─────────────────────────────── Security ────────────────────────────── */

function SecuritySection() {
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.currentPassword) next.currentPassword = "Current password is required";
    if (!form.newPassword) {
      next.newPassword = "New password is required";
    } else if (form.newPassword.length < 8) {
      // Mirrors the backend's @Size(min = 8) on ChangePasswordRequest — checked here
      // too so the person doesn't have to make a round trip to find out.
      next.newPassword = "Password must be at least 8 characters";
    }
    if (form.confirmPassword !== form.newPassword) next.confirmPassword = "Passwords don't match";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      await api.post("/auth/change-password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      showToast("Password updated", "success");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setErrors({});
    } catch (err) {
      // The backend's 400 "Current password is incorrect" (wrong current password)
      // and the shared 400 (password too short) both come through as ApiError with
      // a usable message already — no need to special-case the status here.
      const message = err instanceof ApiError ? err.message : "Couldn't update your password";
      showToast(message, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex max-w-xl flex-col gap-5">
      <Field label="Current password" htmlFor="settings-current-password" error={errors.currentPassword}>
        <Input
          id="settings-current-password"
          type="password"
          autoComplete="current-password"
          value={form.currentPassword}
          onChange={handleChange("currentPassword")}
          error={errors.currentPassword}
        />
      </Field>
      <Field label="New password" htmlFor="settings-new-password" error={errors.newPassword}>
        <Input
          id="settings-new-password"
          type="password"
          autoComplete="new-password"
          value={form.newPassword}
          onChange={handleChange("newPassword")}
          error={errors.newPassword}
        />
      </Field>
      <Field label="Confirm new password" htmlFor="settings-confirm-password" error={errors.confirmPassword}>
        <Input
          id="settings-confirm-password"
          type="password"
          autoComplete="new-password"
          value={form.confirmPassword}
          onChange={handleChange("confirmPassword")}
          error={errors.confirmPassword}
        />
      </Field>
      <div>
        <Button type="submit" disabled={saving}>
          {saving ? "Updating…" : "Update password"}
        </Button>
      </div>
    </form>
  );
}

/* ─────────────────────────────── Notifications ───────────────────────── */

type PreferenceKey = keyof NotificationPreferences;

const PREFERENCE_ROWS: { key: PreferenceKey; label: string }[] = [
  { key: "newLeaveRequestEnabled", label: "New leave request awaiting your approval" },
  { key: "leaveDecisionEnabled", label: "Leave request approved or declined" },
  { key: "attendanceReminderEnabled", label: "Attendance reminders" },
];

function NotificationsSection() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  // Tracks which single toggle is mid-save, so only that row shows a
  // disabled/pending state instead of locking the whole list on every click.
  const [savingKey, setSavingKey] = useState<PreferenceKey | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .get<NotificationPreferences>("/notifications/preferences")
      .then((data) => {
        if (!cancelled) setPrefs(data);
      })
      .catch(() => {
        if (!cancelled) showToast("Couldn't load notification preferences", "error");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggle = async (key: PreferenceKey) => {
    if (!prefs || savingKey) return;

    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    setSavingKey(key);
    try {
      const saved = await api.put<NotificationPreferences>("/notifications/preferences", next);
      setPrefs(saved);
    } catch (err) {
      setPrefs(prefs); // revert
      const message = err instanceof ApiError ? err.message : "Couldn't save that preference";
      showToast(message, "error");
    } finally {
      setSavingKey(null);
    }
  };

  if (loading) {
    return <p className="text-sm text-muted">Loading your notification preferences…</p>;
  }

  if (!prefs) {
    return <p className="text-sm text-muted">We couldn&apos;t load your notification preferences. Try refreshing the page.</p>;
  }

  return (
    <div className="flex max-w-xl flex-col gap-5">
      <p className="text-sm text-muted">
        Choose which events send you an in-app notification.
      </p>

      <div className="flex flex-col divide-y divide-line rounded-md border border-line">
        {PREFERENCE_ROWS.map((row) => (
          <label
            key={row.key}
            className="flex items-center justify-between gap-4 px-4 py-3 text-sm text-ink"
          >
            {row.label}
            <input
              type="checkbox"
              checked={prefs[row.key]}
              disabled={savingKey === row.key}
              onChange={() => handleToggle(row.key)}
              className="h-4 w-4 rounded border-line accent-accent disabled:opacity-50"
            />
          </label>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────── Organization ────────────────────────── */

function OrganizationSection() {
  return (
    <div className="flex max-w-xl flex-col gap-4">
      <Pill tone="accent">Coming soon</Pill>
      <ComingSoonNotice>
        Organization-wide settings — leave policies, attendance rules, and company profile —
        aren&apos;t built yet. Department management already works today from the Departments page.
      </ComingSoonNotice>
    </div>
  );
}

/* ─────────────────────────────────── Page ────────────────────────────── */

export default function SettingsPage() {
  const { employeeId, role } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>("profile");

  const canSeeOrgTab = role === "ADMIN" || role === "HR";
  const tabs = canSeeOrgTab ? [...BASE_TABS, ORG_TAB] : BASE_TABS;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-ink">Settings</h1>
        <p className="mt-1 text-sm text-muted">Manage your profile and account preferences.</p>
      </div>

      <div className="flex gap-1 border-b border-line">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={
              activeTab === tab.key
                ? "border-b-2 border-accent px-3 py-2 text-sm font-medium text-ink"
                : "border-b-2 border-transparent px-3 py-2 text-sm font-medium text-muted hover:text-ink"
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div>
        {activeTab === "profile" &&
          (employeeId != null ? (
            <ProfileSection employeeId={employeeId} />
          ) : (
            <p className="text-sm text-muted">We couldn&apos;t determine your employee record.</p>
          ))}
        {activeTab === "security" && <SecuritySection />}
        {activeTab === "notifications" && <NotificationsSection />}
        {activeTab === "organization" && canSeeOrgTab && <OrganizationSection />}
      </div>
    </div>
  );
}