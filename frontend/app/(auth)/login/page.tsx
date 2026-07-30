"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { motion, AnimatePresence } from "framer-motion";

function LogoIcon({ className, idPrefix = "login-logo" }: { className?: string; idPrefix?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22 10.5C22 14.0899 19.0899 17 15.5 17H10V10.5C10 6.91015 12.9101 4 16.5 4H22V10.5Z" fill={`url(#${idPrefix}-grad-1)`}/>
      <path d="M10 21.5C10 17.9101 12.9101 15 16.5 15H22V21.5C22 25.0899 19.0899 28 15.5 28H10V21.5Z" fill={`url(#${idPrefix}-grad-2)`}/>
      <defs>
        <linearGradient id={`${idPrefix}-grad-1`} x1="10" y1="4" x2="22" y2="17" gradientUnits="userSpaceOnUse">
          <stop stopColor="#38bdf8" />
          <stop offset="1" stopColor="#818cf8" />
        </linearGradient>
        <linearGradient id={`${idPrefix}-grad-2`} x1="10" y1="15" x2="22" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#818cf8" />
          <stop offset="1" stopColor="#c084fc" />
        </linearGradient>
      </defs>
    </svg>
  );
}

const TESTIMONIALS = [
  {
    quote: "StaffDesk transformed how we manage our shifts. Roster uptime is through the roof.",
    author: "Sarah J., Head of Operations"
  },
  {
    quote: "Leave approvals used to take days. Now it takes seconds. Absolutely game-changing.",
    author: "Michael T., HR Director"
  },
  {
    quote: "The best workforce management tool we've ever used. So intuitive and fast.",
    author: "Elena R., Department Manager"
  }
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [username, setUsername] = useState("aisha.rahman@staffdesk.io");
  const [password, setPassword] = useState("••••••••••••");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

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
    <div className="flex min-h-screen bg-canvas">
      {/* Brand Hero Panel */}
      <div className="hidden lg:flex flex-[1.1] bg-slate-950 text-white p-14 flex-col justify-between relative overflow-hidden">
        {/* Animated Background Elements */}
        <motion.div
          animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none"
        />
        <motion.div
          animate={{ x: [0, -40, 0], y: [0, -50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 -right-32 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[120px] pointer-events-none"
        />

        <div className="font-display text-2xl font-bold flex items-center gap-3 relative z-10">
          <LogoIcon className="w-8 h-8" />
          StaffDesk
        </div>

        <div className="relative z-10 mt-12">
          <h1 className="font-display text-4xl leading-tight font-bold mb-6 max-w-lg">
            Workforce operations, managed in one system.
          </h1>
          
          <div className="h-32 mb-10 max-w-md">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
                className="space-y-4"
              >
                <p className="text-slate-300 text-lg italic leading-relaxed">
                  "{TESTIMONIALS[activeTestimonial].quote}"
                </p>
                <p className="text-emerald-400 font-semibold text-sm">
                  — {TESTIMONIALS[activeTestimonial].author}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex gap-10 border-t border-white/10 pt-8">
            <div>
              <div className="font-display text-3xl font-bold mb-1">128</div>
              <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Employees Active</div>
            </div>
            <div>
              <div className="font-display text-3xl font-bold mb-1">99.9%</div>
              <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Roster Uptime</div>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-500 relative z-10 font-medium">
          © 2026 StaffDesk Operations Inc.
        </div>
      </div>

      {/* Login Form Box */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        {/* Subtle background pattern for right side */}
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md relative z-10"
        >
          {/* Subtle glow behind the card */}
          <div className="absolute -inset-1 bg-gradient-to-r from-sky-500/20 to-indigo-500/20 rounded-[24px] blur-xl opacity-50 dark:opacity-20 pointer-events-none"></div>
          
          <div className="bg-surface/70 backdrop-blur-xl border border-line/50 p-10 rounded-2xl shadow-xl relative">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-2">
              Sign In
            </div>
            <h2 className="font-display text-3xl font-bold text-ink mb-2">
              Welcome Back
            </h2>
            <p className="text-muted text-sm mb-8">
              Enter your credentials to access your organization workspace.
            </p>

            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mb-6 p-3 text-sm rounded-lg bg-roseBg text-roseTxt border border-rosePri/20"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-ink mb-2">
                  Work Email / Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full h-11 px-4 rounded-xl border border-line bg-input/50 backdrop-blur-sm text-ink text-sm outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-ink">
                    Password
                  </label>
                  <a href="#" className="text-xs font-medium text-accent hover:text-accentHover transition-colors">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full h-11 px-4 rounded-xl border border-line bg-input/50 backdrop-blur-sm text-ink text-sm outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full h-11 bg-accent hover:bg-accentHover text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-accent/20 disabled:opacity-70 flex items-center justify-center gap-2 mt-2"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  "Sign In to Dashboard"
                )}
              </button>
            </form>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-line"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-surface/70 px-4 text-muted">Or continue with</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <button
                  type="button"
                  className="w-full h-10 flex items-center justify-center gap-2 bg-input/50 hover:bg-input border border-line rounded-xl text-sm font-medium text-ink transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.88 16.78 15.68 17.58V20.34H19.24C21.32 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4"/>
                    <path d="M12 23C14.97 23 17.46 22.02 19.24 20.34L15.68 17.58C14.72 18.22 13.47 18.63 12 18.63C9.15002 18.63 6.74002 16.71 5.88002 14.13H2.20001V16.98C4.01001 20.57 7.71002 23 12 23Z" fill="#34A853"/>
                    <path d="M5.88001 14.13C5.66001 13.47 5.53001 12.75 5.53001 12C5.53001 11.25 5.66001 10.53 5.88001 9.87V7.02H2.20001C1.45001 8.51 1.03001 10.19 1.03001 12C1.03001 13.81 1.45001 15.49 2.20001 16.98L5.88001 14.13Z" fill="#FBBC05"/>
                    <path d="M12 5.38C13.62 5.38 15.07 5.94 16.22 7.03L19.32 3.93C17.46 2.2 14.97 1.18 12 1.18C7.71 1.18 4.01 3.61 2.2 7.2L5.88 10.05C6.74 7.47 9.15 5.38 12 5.38Z" fill="#EA4335"/>
                  </svg>
                  Google
                </button>
                <button
                  type="button"
                  className="w-full h-10 flex items-center justify-center gap-2 bg-input/50 hover:bg-input border border-line rounded-xl text-sm font-medium text-ink transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11.4 24H0V12.6H11.4V24ZM24 24H12.6V12.6H24V24ZM11.4 11.4H0V0H11.4V11.4ZM24 11.4H12.6V0H24V11.4Z" fill="#00A4EF"/>
                  </svg>
                  Microsoft
                </button>
              </div>
            </div>
          </div>
        </motion.div>
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