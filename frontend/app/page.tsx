"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Users, Clock, CalendarDays, ArrowRight } from "lucide-react";

function LogoIcon({ className, idPrefix = "landing-logo" }: { className?: string; idPrefix?: string }) {
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

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-indigo-500/30">
      
      {/* Navigation */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-slate-950/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LogoIcon className="w-8 h-8" />
            <span className="font-display text-xl font-bold tracking-tight text-white">StaffDesk</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium text-slate-300 hover:text-white transition-colors hidden sm:block">
              Features
            </Link>
            <Link href="/login" className="text-sm font-semibold text-white px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 transition-all">
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-8">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              StaffDesk 2.0 is live
            </span>
            <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight mb-8 leading-[1.1]">
              Workforce operations, <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-400">
                managed in one system.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
              The premium command center for your entire team. Authenticated attendance logging, intelligent departmental rosters, and seamless leave approvals.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/login" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold flex items-center justify-center gap-2 transition-all shadow-[0_0_40px_-10px_rgba(99,102,241,0.5)]">
                Access Workspace <ArrowRight className="w-4 h-4" />
              </Link>
              <button className="w-full sm:w-auto px-8 py-4 rounded-xl bg-surface border border-line text-white font-semibold hover:bg-white/5 transition-all">
                Request Demo
              </button>
            </div>
          </motion.div>

          {/* Abstract Dashboard Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="mt-20 mx-auto max-w-5xl rounded-[32px] border border-white/10 bg-slate-900/50 backdrop-blur-2xl p-4 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10 rounded-[32px] pointer-events-none" />
            <div className="rounded-[20px] overflow-hidden border border-white/5 bg-slate-950 relative aspect-[16/9]">
              <img 
                src="/landing-preview.jpg" 
                alt="StaffDesk Platform Preview" 
                className="w-full h-full object-cover opacity-90 object-top"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Everything you need to scale</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">No clunky interfaces. Just beautiful, fast, and reliable tools to manage your workforce.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-slate-900/40 border border-white/5 p-8 rounded-3xl hover:bg-slate-900/80 transition-colors group"
            >
              <div className="w-12 h-12 rounded-2xl bg-sky-500/10 flex items-center justify-center text-sky-400 mb-6 group-hover:scale-110 transition-transform">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Live Attendance</h3>
              <p className="text-slate-400 leading-relaxed">
                Track shifts in real-time. See who is clocked in, running late, or on break at a glance with our status rings.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-slate-900/40 border border-white/5 p-8 rounded-3xl hover:bg-slate-900/80 transition-colors group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform relative z-10">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 relative z-10">Department Rosters</h3>
              <p className="text-slate-400 leading-relaxed relative z-10">
                Organize your workforce into departments. Quickly pull up the employee inspector to view full profile data.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-slate-900/40 border border-white/5 p-8 rounded-3xl hover:bg-slate-900/80 transition-colors group"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                <CalendarDays className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Leave Approvals</h3>
              <p className="text-slate-400 leading-relaxed">
                Approve or reject time-off requests with a single click. Keep your team's availability perfectly synced.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 mt-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <LogoIcon className="w-6 h-6" idPrefix="footer-logo" />
            <span className="font-display font-semibold text-slate-300 tracking-tight">StaffDesk</span>
          </div>
          <div className="text-sm text-slate-500">
            © 2026 StaffDesk Operations Inc. All rights reserved.
          </div>
          <div className="flex gap-6 text-sm font-medium text-slate-500">
            <a href="#" className="hover:text-slate-300 transition-colors">Privacy</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Terms</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
