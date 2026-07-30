"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { motion, AnimatePresence } from "framer-motion";

/* ─── Logo ──────────────────────────────────────────────────────────────── */
function LogoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22 10.5C22 14.0899 19.0899 17 15.5 17H10V10.5C10 6.91015 12.9101 4 16.5 4H22V10.5Z" fill="url(#login-g1)"/>
      <path d="M10 21.5C10 17.9101 12.9101 15 16.5 15H22V21.5C22 25.0899 19.0899 28 15.5 28H10V21.5Z" fill="url(#login-g2)"/>
      <defs>
        <linearGradient id="login-g1" x1="10" y1="4" x2="22" y2="17" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2DD4BF" />
          <stop offset="1" stopColor="#3B82F6" />
        </linearGradient>
        <linearGradient id="login-g2" x1="10" y1="15" x2="22" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3B82F6" />
          <stop offset="1" stopColor="#A855F7" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ─── Rotating testimonials ──────────────────────────────────────────────── */
const TESTIMONIALS = [
  { quote: "StaffDesk transformed how we manage our shifts. Roster uptime is through the roof.", author: "Sarah J., Head of Operations" },
  { quote: "Leave approvals used to take days. Now it takes seconds. Absolutely game-changing.", author: "Michael T., HR Director" },
  { quote: "The best workforce management tool we've ever used. So intuitive and fast.", author: "Elena R., Department Manager" },
];

/* ─── Main form ──────────────────────────────────────────────────────────── */
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActiveTestimonial((p) => (p + 1) % TESTIMONIALS.length), 6000);
    return () => clearInterval(id);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login({ email: username, password });
      const next = searchParams.get("next") ?? "/employees";
      router.replace(next);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070A11] text-slate-300 font-sans relative overflow-x-clip flex">

      {/* ── Ambient background blobs (same as landing) ── */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#4F46E5] opacity-20 blur-[150px] rounded-full pointer-events-none" />
      <div className="fixed top-[20%] right-[-10%] w-[40%] h-[40%] bg-[#06B6D4] opacity-15 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[20%] w-[60%] h-[40%] bg-[#7C3AED] opacity-15 blur-[150px] rounded-full pointer-events-none" />

      {/* ── Hexagon pattern ── */}
      <svg className="fixed inset-0 w-full h-full opacity-[0.04] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="hexagons-login" width="60" height="52" patternUnits="userSpaceOnUse" patternTransform="scale(1.5)">
            <path d="M30 0 L60 17.32 L60 51.96 L30 69.28 L0 51.96 L0 17.32 Z" fill="none" stroke="#60A5FA" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hexagons-login)" />
      </svg>

      {/* ── Back arrow ── */}
      <div className="fixed top-6 left-6 z-50">
        <Link
          href="/"
          className="group flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium"
        >
          <span className="w-8 h-8 rounded-full border border-white/10 bg-white/5 backdrop-blur flex items-center justify-center group-hover:bg-white/10 group-hover:border-white/20 transition-all">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M5 12l7-7M5 12l7 7" />
            </svg>
          </span>
        </Link>
      </div>

      {/* ── Split layout ── */}
      <div className="flex w-full relative z-10">

        {/* Left panel — brand + testimonial */}
        <div className="hidden lg:flex flex-[1.05] flex-col justify-between p-14 relative overflow-hidden">
          {/* Inner panel glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#4F46E5]/10 via-transparent to-[#06B6D4]/5 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3 relative z-10"
          >
            <LogoIcon className="w-9 h-9 drop-shadow-[0_0_12px_rgba(45,212,191,0.4)]" />
            <span className="font-bold text-2xl text-white tracking-tight">StaffDesk</span>
          </motion.div>

          {/* Centre content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative z-10"
          >
            <h1 className="text-[40px] font-bold leading-tight text-white mb-4 max-w-md">
              Workforce operations,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C084FC] via-[#818CF8] to-[#22D3EE]">
                managed in one system.
              </span>
            </h1>

            {/* Testimonial carousel */}
            <div className="h-28 mb-10 max-w-md">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTestimonial}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-3"
                >
                  <p className="text-slate-400 text-[15px] italic leading-relaxed">
                    &ldquo;{TESTIMONIALS[activeTestimonial].quote}&rdquo;
                  </p>
                  <p className="text-[#2DD4BF] font-semibold text-sm">
                    — {TESTIMONIALS[activeTestimonial].author}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Dot indicators */}
            <div className="flex gap-2 mb-12">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    i === activeTestimonial ? "w-6 bg-[#2DD4BF]" : "w-2 bg-white/20 hover:bg-white/40"
                  }`}
                />
              ))}
            </div>

            {/* Stats */}
            <div className="flex gap-10 border-t border-white/10 pt-8">
              <div>
                <div className="text-3xl font-bold text-white mb-1">128</div>
                <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Employees Active</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-1">99.9%</div>
                <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Roster Uptime</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-1">4.9★</div>
                <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Avg Rating</div>
              </div>
            </div>
          </motion.div>

          <p className="text-xs text-slate-600 relative z-10 font-medium">© 2026 StaffDesk Operations Inc.</p>
        </div>

        {/* Right panel — login form */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-10 min-h-screen">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-md"
          >
            {/* Card glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[#4F46E5]/20 via-[#06B6D4]/10 to-[#7C3AED]/20 rounded-[28px] blur-2xl opacity-60 pointer-events-none" />

            <div className="relative bg-[#0D1324]/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-10 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_30px_80px_rgba(0,0,0,0.6)]">

              {/* Mobile logo */}
              <div className="flex lg:hidden items-center gap-2.5 mb-8">
                <LogoIcon className="w-7 h-7" />
                <span className="font-bold text-lg text-white tracking-tight">StaffDesk</span>
              </div>

              <div className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#2DD4BF] mb-2">
                Sign In
              </div>
              <h2 className="text-[28px] font-bold text-white mb-2 leading-tight">
                Welcome back
              </h2>
              <p className="text-slate-400 text-[14px] mb-8">
                Enter your credentials to access your workspace.
              </p>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-3.5 text-sm rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-start gap-2.5">
                      <svg className="w-4 h-4 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
                      </svg>
                      {error}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div>
                  <label className="block text-[12px] font-semibold text-slate-300 mb-2">
                    Work Email / Username
                  </label>
                  <input
                    id="login-email"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="you@company.com"
                    required
                    autoComplete="username"
                    className="w-full h-11 px-4 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-500 text-sm outline-none focus:border-[#2DD4BF]/50 focus:ring-2 focus:ring-[#2DD4BF]/15 transition-all"
                  />
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[12px] font-semibold text-slate-300">
                      Password
                    </label>
                    <a href="#" className="text-[12px] font-medium text-[#38BDF8] hover:text-[#7DD3FC] transition-colors">
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative">
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      autoComplete="current-password"
                      className="w-full h-11 px-4 pr-11 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-500 text-sm outline-none focus:border-[#2DD4BF]/50 focus:ring-2 focus:ring-[#2DD4BF]/15 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                      tabIndex={-1}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  id="login-submit"
                  type="submit"
                  disabled={submitting}
                  className="group relative w-full h-11 rounded-xl font-semibold text-[15px] text-white transition-all overflow-hidden disabled:opacity-60 mt-2"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#9333EA] to-[#06B6D4]" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#A855F7] to-[#22D3EE] opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute -inset-1 bg-gradient-to-r from-[#9333EA] to-[#06B6D4] blur-xl opacity-30 group-hover:opacity-60 transition-opacity" />
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {submitting ? (
                      <>
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Signing in…
                      </>
                    ) : (
                      "Sign In to Dashboard"
                    )}
                  </span>
                </button>
              </form>

              {/* Divider */}
              <div className="my-8 flex items-center gap-4">
                <div className="flex-1 h-px bg-white/8" />
                <span className="text-[12px] text-slate-500 font-medium">Or continue with</span>
                <div className="flex-1 h-px bg-white/8" />
              </div>

              {/* SSO buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="h-10 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-sm font-medium text-slate-300 transition-all"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.88 16.78 15.68 17.58V20.34H19.24C21.32 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4"/>
                    <path d="M12 23C14.97 23 17.46 22.02 19.24 20.34L15.68 17.58C14.72 18.22 13.47 18.63 12 18.63C9.15 18.63 6.74 16.71 5.88 14.13H2.2V16.98C4.01 20.57 7.71 23 12 23Z" fill="#34A853"/>
                    <path d="M5.88 14.13C5.66 13.47 5.53 12.75 5.53 12C5.53 11.25 5.66 10.53 5.88 9.87V7.02H2.2C1.45 8.51 1.03 10.19 1.03 12C1.03 13.81 1.45 15.49 2.2 16.98L5.88 14.13Z" fill="#FBBC05"/>
                    <path d="M12 5.38C13.62 5.38 15.07 5.94 16.22 7.03L19.32 3.93C17.46 2.2 14.97 1.18 12 1.18C7.71 1.18 4.01 3.61 2.2 7.2L5.88 10.05C6.74 7.47 9.15 5.38 12 5.38Z" fill="#EA4335"/>
                  </svg>
                  Google
                </button>
                <button
                  type="button"
                  className="h-10 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-sm font-medium text-slate-300 transition-all"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M11.4 24H0V12.6H11.4V24ZM24 24H12.6V12.6H24V24ZM11.4 11.4H0V0H11.4V11.4ZM24 11.4H12.6V0H24V11.4Z" fill="#00A4EF"/>
                  </svg>
                  Microsoft
                </button>
              </div>

            </div>
          </motion.div>
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