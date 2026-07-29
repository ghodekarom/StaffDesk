"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [username, setUsername] = useState("aisha.rahman@staffdesk.io");
  const [password, setPassword] = useState("••••••••••••");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login({ email: username, password });
      const next = searchParams.get("next") ?? "/";
      router.replace(next);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication failed";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Brand Hero Panel */}
      <div className="hidden lg:flex flex-[1.1] bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-14 flex-col justify-between relative overflow-hidden">
        <div className="font-display text-xl font-bold flex items-center gap-2 relative z-10">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse-ring"></span>
          StaffDesk
        </div>

        <div className="relative z-10">
          <h1 className="font-display text-4xl leading-tight font-bold mb-4 max-w-lg">
            Workforce operations, managed in one system.
          </h1>
          <p className="text-slate-300 text-base max-w-md">
            Authenticated attendance logging, departmental rosters, and leave approvals — shift after shift.
          </p>

          <div className="flex gap-8 mt-10">
            <div>
              <div className="font-display text-2xl font-bold">128</div>
              <div className="text-xs text-slate-400">Employees Active</div>
            </div>
            <div>
              <div className="font-display text-2xl font-bold">99.9%</div>
              <div className="text-xs text-slate-400">Roster Uptime</div>
            </div>
            <div>
              <div className="font-display text-2xl font-bold">6</div>
              <div className="text-xs text-slate-400">Departments</div>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-500 relative z-10">
          © 2026 StaffDesk Operations Inc.
        </div>
      </div>

      {/* Login Form Box */}
      <div className="flex-1 flex items-center justify-center p-8 bg-canvas">
        <div className="w-full max-w-sm bg-surface border border-line p-8 rounded-xl shadow-sm">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-1">
            Sign In
          </div>
          <h2 className="font-display text-2xl font-bold text-ink mb-1">
            Welcome Back
          </h2>
          <p className="text-muted text-xs sm:text-sm mb-6">
            Enter your credentials to access your organization workspace.
          </p>

          {error && (
            <div className="mb-4 p-3 text-xs rounded-md bg-roseBg text-roseTxt border border-rosePri/20">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">
                Work Email / Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full h-10 px-3 rounded-lg border border-line bg-input text-ink text-sm outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-10 px-3 rounded-lg border border-line bg-input text-ink text-sm outline-none focus:border-accent"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-10 bg-accent hover:bg-accentHover text-white font-semibold rounded-lg text-sm transition-colors shadow-sm disabled:opacity-50"
            >
              {submitting ? "Signing in..." : "Sign In to Dashboard"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}