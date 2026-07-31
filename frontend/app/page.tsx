"use client";

import Link from "next/link";
import { ChevronDown, Clock, Search, LayoutDashboard, Users, Calendar, DollarSign, FileText, Settings, ChevronRight, Activity, LineChart as LineChartIcon, Menu } from "lucide-react";
import { motion, useScroll, useTransform, useInView, useMotionValue, useSpring } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import {
  TRUSTED_LOGOS,
  FEATURES,
  HOW_IT_WORKS,
  TESTIMONIALS,
  FOOTER_COLUMNS,
  FOOTER_TAGLINE,
  DASHBOARD_STATS,
  FINAL_CTA,
} from "@/lib/landing-content";

const FEATURE_ICON_MAP = { clock: Clock, activity: Activity, chart: LineChartIcon } as const;
const ACCENT_CLASSES = {
  indigo: {
    borderGrad: "from-indigo-500/30 to-transparent hover:from-indigo-400/60",
    glowBg: "bg-indigo-500/5 group-hover:bg-indigo-500/10",
    iconBox: "border-indigo-500/30 bg-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.15)] group-hover:shadow-[0_0_25px_rgba(99,102,241,0.3)]",
    iconColor: "text-indigo-400",
  },
  cyan: {
    borderGrad: "from-cyan-500/30 to-transparent hover:from-cyan-400/60",
    glowBg: "bg-cyan-500/5 group-hover:bg-cyan-500/10",
    iconBox: "border-cyan-500/30 bg-cyan-500/10 shadow-[0_0_15px_rgba(6,182,212,0.15)] group-hover:shadow-[0_0_25px_rgba(6,182,212,0.3)]",
    iconColor: "text-cyan-400",
  },
  purple: {
    borderGrad: "from-purple-500/30 to-transparent hover:from-purple-400/60",
    glowBg: "bg-purple-500/5 group-hover:bg-purple-500/10",
    iconBox: "border-purple-500/30 bg-purple-500/10 shadow-[0_0_15px_rgba(168,85,247,0.15)] group-hover:shadow-[0_0_25px_rgba(168,85,247,0.3)]",
    iconColor: "text-purple-400",
  },
} as const;

// Animated count-up number, triggers once when scrolled into view.
function CountUp({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { duration: 1200, bounce: 0 } as any);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (inView) motionVal.set(value);
  }, [inView, value, motionVal]);

  useEffect(() => {
    const unsub = spring.on("change", (v) => setDisplay(Math.round(v)));
    return () => unsub();
  }, [spring]);

  return (
    <span ref={ref} className={className}>
      {display.toLocaleString()}
    </span>
  );
}

function HexagonPattern() {
  return (
    <svg className="fixed inset-0 w-full h-full opacity-[0.04] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="hexagons-pattern" width="60" height="52" patternUnits="userSpaceOnUse" patternTransform="scale(1.5)">
          <path d="M30 0 L60 17.32 L60 51.96 L30 69.28 L0 51.96 L0 17.32 Z" fill="none" stroke="#60A5FA" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#hexagons-pattern)" />
    </svg>
  );
}

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 600], [0, 40]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="bg-[#070A11] text-slate-300 font-sans relative overflow-x-clip selection:bg-cyan-500/30">

      {/* Background Ambience */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#4F46E5] opacity-20 blur-[150px] rounded-full pointer-events-none mix-blend-screen animate-pulse-slow" />
      <div className="fixed top-[20%] right-[-10%] w-[40%] h-[40%] bg-[#06B6D4] opacity-15 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />
      <div className="fixed bottom-[-10%] left-[20%] w-[60%] h-[40%] bg-[#7C3AED] opacity-15 blur-[150px] rounded-full pointer-events-none mix-blend-screen" />

      <HexagonPattern />

      {/* Main Container */}
      <div className="max-w-[1400px] mx-auto flex flex-col relative z-10">

        {/* Navigation */}
        <header className="flex items-center justify-between px-6 lg:px-12 py-8 relative z-50">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3"
          >
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_0_15px_rgba(45,212,191,0.5)]">
              <path d="M22 10.5C22 14.0899 19.0899 17 15.5 17H10V10.5C10 6.91015 12.9101 4 16.5 4H22V10.5Z" fill="url(#logo-nav-1)"/>
              <path d="M10 21.5C10 17.9101 12.9101 15 16.5 15H22V21.5C22 25.0899 19.0899 28 15.5 28H10V21.5Z" fill="url(#logo-nav-2)"/>
              <defs>
                <linearGradient id="logo-nav-1" x1="10" y1="4" x2="22" y2="17" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#2DD4BF" />
                  <stop offset="1" stopColor="#3B82F6" />
                </linearGradient>
                <linearGradient id="logo-nav-2" x1="10" y1="15" x2="22" y2="28" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#3B82F6" />
                  <stop offset="1" stopColor="#A855F7" />
                </linearGradient>
              </defs>
            </svg>
            <span className="font-display text-2xl font-bold tracking-tight text-white">StaffDesk</span>
          </motion.div>

          <motion.nav
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="hidden lg:flex items-center gap-1 bg-[#101726]/60 backdrop-blur-xl px-2 py-1.5 rounded-full border border-white/5 shadow-2xl"
          >
            <button className="flex items-center gap-1.5 text-[13px] font-medium text-slate-300 hover:text-white hover:bg-white/5 px-4 py-2 rounded-full transition-all">
              Features <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>
            <Link href="#" className="text-[13px] font-medium text-slate-300 hover:text-white hover:bg-white/5 px-4 py-2 rounded-full transition-all">Integrations</Link>
            <button className="flex items-center gap-1.5 text-[13px] font-medium text-slate-300 hover:text-white hover:bg-white/5 px-4 py-2 rounded-full transition-all">
              Company <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>
          </motion.nav>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="hidden md:flex items-center gap-6"
          >
            <Link href="/login" className="text-[15px] font-medium text-slate-300 hover:text-white transition-colors">
              Login
            </Link>
            <Link href="/login" className="text-[14px] font-semibold text-[#2DD4BF] px-6 py-2.5 rounded-lg border border-[#2DD4BF]/40 bg-[#2DD4BF]/10 hover:bg-[#2DD4BF]/20 hover:shadow-[0_0_20px_rgba(45,212,191,0.3)] transition-all">
              Get Started
            </Link>
          </motion.div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden text-white p-2">
            <Menu />
          </button>
        </header>

        {/* Hero Section */}
        <section className="flex flex-col lg:flex-row items-center justify-between px-6 lg:px-12 pt-10 pb-20 gap-10 relative">

          {/* Left Text */}
          <div className="flex-[0.9] max-w-xl relative z-20">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="font-bold leading-[1.08] tracking-tight mb-5"
            >
              <span className="block text-[42px] sm:text-[52px] lg:text-[58px] text-transparent bg-clip-text bg-gradient-to-r from-[#C084FC] via-[#818CF8] to-[#22D3EE]">
                Workforce operations,
              </span>
              <span className="block text-[42px] sm:text-[52px] lg:text-[58px] text-white">
                managed in one system
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="text-[16px] text-[#94A3B8] leading-relaxed mb-10 max-w-md"
            >
              Optimize scheduling, track time, manage payroll, and streamline HR processes in a unified platform for modern teams.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              className="flex flex-wrap items-center gap-6"
            >
              <Link href="/login" className="group relative px-7 py-3.5 rounded-full font-semibold flex items-center gap-2 transition-all overflow-hidden text-white">
                <div className="absolute inset-0 bg-gradient-to-r from-[#9333EA] to-[#06B6D4]" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#A855F7] to-[#22D3EE] opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute -inset-1 bg-gradient-to-r from-[#9333EA] to-[#06B6D4] blur-xl opacity-40 group-hover:opacity-70 transition-opacity" />
                <span className="relative z-10 flex items-center gap-2 text-[15px] font-semibold tracking-wide">
                  Request Demo <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              <Link href="#" className="text-[#38BDF8] font-medium text-[15px] hover:text-[#7DD3FC] hover:underline underline-offset-4 transition-all">
                Learn More
              </Link>
            </motion.div>
          </div>

          {/* Right Dashboard Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: 40 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ y: y1 }}
            className="flex-[1.2] relative w-full"
          >
            {/* Glow halo behind window */}
            <div className="absolute -inset-4 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-cyan-500/10 rounded-3xl blur-2xl pointer-events-none" />
            {/* The Dashboard UI Window */}
            <div className="bg-[#0B0F19] border border-cyan-500/20 rounded-[24px] shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_30px_80px_rgba(0,0,0,0.8),0_0_50px_rgba(6,182,212,0.15)] relative z-10 overflow-hidden flex flex-col group">

              {/* Window Body */}
              <div className="flex bg-[#0B0F19] p-2 sm:p-4 gap-4">

                {/* Sidebar */}
                <div className="w-48 flex flex-col gap-6 bg-[#0E1322] rounded-2xl p-4 border border-white/5 shrink-0">
                  {/* Brand Logo */}
                  <div className="flex items-center gap-2.5 px-2 pt-1">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#38BDF8] via-[#818CF8] to-[#C084FC] p-0.5 flex items-center justify-center shadow-[0_0_15px_rgba(56,189,248,0.3)]">
                      <div className="w-full h-full bg-[#0E1322] rounded-[10px] flex items-center justify-center">
                        <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
                          <path d="M22 10.5C22 14.0899 19.0899 17 15.5 17H10V10.5C10 6.91015 12.9101 4 16.5 4H22V10.5Z" fill="#38BDF8"/>
                          <path d="M10 21.5C10 17.9101 12.9101 15 16.5 15H22V21.5C22 25.0899 19.0899 28 15.5 28H10V21.5Z" fill="#C084FC"/>
                        </svg>
                      </div>
                    </div>
                    <span className="font-display text-lg font-bold text-white tracking-tight">StaffDesk</span>
                  </div>

                  {/* Navigation Links */}
                  <div className="flex flex-col gap-1.5 mt-2">
                    {/* Active: Dashboard */}
                    <div className="flex items-center gap-3 text-[13px] font-semibold text-white bg-[#1E2738] px-3.5 py-2.5 rounded-xl border border-white/10 shadow-sm">
                      <LayoutDashboard className="w-4 h-4 text-cyan-400" />
                      Dashboard
                    </div>
                    <div className="flex items-center gap-3 text-[13px] font-medium text-slate-400 px-3.5 py-2.5 hover:bg-white/5 hover:text-slate-200 rounded-xl transition-colors cursor-pointer">
                      <Users className="w-4 h-4" />
                      Team
                    </div>
                    <div className="flex items-center gap-3 text-[13px] font-medium text-slate-400 px-3.5 py-2.5 hover:bg-white/5 hover:text-slate-200 rounded-xl transition-colors cursor-pointer">
                      <Calendar className="w-4 h-4" />
                      Schedule
                    </div>
                    <div className="flex items-center gap-3 text-[13px] font-medium text-slate-400 px-3.5 py-2.5 hover:bg-white/5 hover:text-slate-200 rounded-xl transition-colors cursor-pointer">
                      <Clock className="w-4 h-4" />
                      Time
                    </div>
                    <div className="flex items-center gap-3 text-[13px] font-medium text-slate-400 px-3.5 py-2.5 hover:bg-white/5 hover:text-slate-200 rounded-xl transition-colors cursor-pointer">
                      <DollarSign className="w-4 h-4" />
                      Payroll
                    </div>
                    <div className="flex items-center gap-3 text-[13px] font-medium text-slate-400 px-3.5 py-2.5 hover:bg-white/5 hover:text-slate-200 rounded-xl transition-colors cursor-pointer">
                      <FileText className="w-4 h-4" />
                      Reports
                    </div>
                  </div>

                  {/* Bottom Settings */}
                  <div className="mt-auto pt-4 border-t border-white/5">
                    <div className="flex items-center gap-3 text-[13px] font-medium text-slate-400 px-3.5 py-2.5 hover:bg-white/5 hover:text-slate-200 rounded-xl transition-colors cursor-pointer">
                      <Settings className="w-4 h-4" />
                      Settings
                    </div>
                  </div>
                </div>

                {/* Right / Main Dashboard Body */}
                <div className="flex-1 flex flex-col gap-4 min-w-0">

                  {/* Top Bar Header */}
                  <div className="flex items-center justify-between px-2 pt-1 pb-1">
                    <h2 className="text-xl font-bold text-white tracking-tight">Dashboard</h2>

                    <div className="flex items-center gap-3">
                      {/* Bookmark Icon */}
                      <button className="w-8 h-8 rounded-full bg-[#151C2C] border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                        <FileText className="w-4 h-4" />
                      </button>

                      {/* Bell with indicator dot */}
                      <button className="w-8 h-8 rounded-full bg-[#151C2C] border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors relative">
                        <Activity className="w-4 h-4" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#0B0F19]" />
                      </button>

                      {/* User Profile Avatar */}
                      <div className="flex items-center gap-1.5 cursor-pointer">
                        <div className="w-8 h-8 rounded-full border border-cyan-400/40 p-0.5 bg-gradient-to-tr from-cyan-500 to-purple-500">
                          <div className="w-full h-full rounded-full bg-indigo-600 flex items-center justify-center text-[11px] font-bold text-white">
                            JS
                          </div>
                        </div>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    </div>
                  </div>

                  {/* Dashboard Grid - 2 Rows */}
                  <div className="flex flex-col gap-4">

                    {/* TOP ROW: Left Main Chart (2 cols) + Right 2 Cards (1 col) */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                      {/* Top Left: Main Wave Chart (2 cols width) */}
                      <div className="lg:col-span-2 bg-[#121826] border border-white/5 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between group/chart">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4 relative z-10">
                          <span className="text-[15px] font-bold text-white">Team Activity</span>
                          <div className="flex items-center gap-1.5 bg-[#1B2334] px-3 py-1.5 rounded-xl border border-white/10 text-[11px] font-medium text-slate-300 cursor-pointer">
                            <span>Monthly</span>
                            <ChevronDown className="w-3 h-3 text-slate-400" />
                          </div>
                        </div>

                        {/* Interactive Wave Chart SVG */}
                        <div className="relative h-44 w-full">
                          {/* Y-Axis Grid Lines */}
                          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] text-slate-500 font-mono">
                            <div className="flex items-center gap-3"><span className="w-6 text-right">200</span><div className="flex-1 border-b border-white/[0.06]" /></div>
                            <div className="flex items-center gap-3"><span className="w-6 text-right">150</span><div className="flex-1 border-b border-white/[0.06]" /></div>
                            <div className="flex items-center gap-3"><span className="w-6 text-right">100</span><div className="flex-1 border-b border-white/[0.06]" /></div>
                            <div className="flex items-center gap-3"><span className="w-6 text-right">50</span><div className="flex-1 border-b border-white/[0.06]" /></div>
                            <div className="flex items-center gap-3"><span className="w-6 text-right">0</span><div className="flex-1 border-b border-white/[0.06]" /></div>
                          </div>

                          {/* SVG Waves */}
                          <div className="absolute inset-0 left-9 top-1 bottom-4">
                            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 500 160">
                              <defs>
                                <linearGradient id="purple-glow" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#C084FC" stopOpacity="0.4" />
                                  <stop offset="100%" stopColor="#C084FC" stopOpacity="0.0" />
                                </linearGradient>
                                <linearGradient id="cyan-glow" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.35" />
                                  <stop offset="100%" stopColor="#22D3EE" stopOpacity="0.0" />
                                </linearGradient>
                              </defs>

                              {/* Purple Upper Wave */}
                              <path
                                d="M 0 130 C 50 110 80 80 130 90 C 180 100 220 50 280 60 C 340 70 390 10 440 20 C 470 28 490 10 500 5 L 500 160 L 0 160 Z"
                                fill="url(#purple-glow)"
                              />
                              <path
                                d="M 0 130 C 50 110 80 80 130 90 C 180 100 220 50 280 60 C 340 70 390 10 440 20 C 470 28 490 10 500 5"
                                fill="none"
                                stroke="#C084FC"
                                strokeWidth="3"
                                strokeLinecap="round"
                              />

                              {/* Cyan Lower Wave */}
                              <path
                                d="M 0 100 C 40 70 90 60 140 90 C 190 120 240 70 290 80 C 350 90 400 60 450 70 C 480 76 495 50 500 45 L 500 160 L 0 160 Z"
                                fill="url(#cyan-glow)"
                              />
                              <path
                                d="M 0 100 C 40 70 90 60 140 90 C 190 120 240 70 290 80 C 350 90 400 60 450 70 C 480 76 495 50 500 45"
                                fill="none"
                                stroke="#22D3EE"
                                strokeWidth="3"
                                strokeLinecap="round"
                              />

                              {/* Vertical Guide Line on Thu (around x=280) */}
                              <line x1="280" y1="0" x2="280" y2="160" stroke="#FFFFFF" strokeOpacity="0.15" strokeDasharray="4 4" strokeWidth="1.5" />

                              {/* Dots on vertical line */}
                              <circle cx="280" cy="60" r="4.5" fill="#C084FC" stroke="#FFFFFF" strokeWidth="2" />
                              <circle cx="280" cy="80" r="4.5" fill="#22D3EE" stroke="#FFFFFF" strokeWidth="2" />
                            </svg>

                            {/* Floating Tooltip Box */}
                            <div className="absolute top-[18%] left-[50%] -translate-x-1/2 bg-[#1C2537] border border-white/10 rounded-xl px-3 py-1.5 shadow-2xl flex items-center gap-2 pointer-events-none z-20">
                              <div className="w-2 h-2 rounded-full bg-[#C084FC]" />
                              <CountUp value={DASHBOARD_STATS.activityValue} className="text-[11px] font-bold text-white font-mono" />
                              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">20%</span>
                            </div>
                          </div>

                          {/* X-Axis Labels */}
                          <div className="absolute bottom-0 left-9 right-0 flex justify-between text-[10px] text-slate-500 font-medium pt-1">
                            <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                          </div>
                        </div>
                      </div>

                      {/* Top Right Column: 2 Cards Stacked */}
                      <div className="flex flex-col gap-4">

                        {/* Card 1: Team Activity + Avatars */}
                        <div className="bg-[#121826] border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                          <span className="text-[14px] font-bold text-white">Team Activity</span>
                          <div className="flex items-center gap-3">
                            {/* Stack of overlapping avatars */}
                            <div className="flex items-center -space-x-2">
                              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 p-0.5 border border-[#121826]">
                                <div className="w-full h-full rounded-full bg-indigo-600 flex items-center justify-center text-[9px] font-bold text-white">A</div>
                              </div>
                              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-400 to-[#C084FC] p-0.5 border border-[#121826]">
                                <div className="w-full h-full rounded-full bg-purple-600 flex items-center justify-center text-[9px] font-bold text-white">M</div>
                              </div>
                              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 p-0.5 border border-[#121826]">
                                <div className="w-full h-full rounded-full bg-teal-600 flex items-center justify-center text-[9px] font-bold text-white">S</div>
                              </div>
                              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-pink-400 to-rose-500 p-0.5 border border-[#121826]">
                                <div className="w-full h-full rounded-full bg-pink-600 flex items-center justify-center text-[9px] font-bold text-white">R</div>
                              </div>
                            </div>
                            <span className="text-[12px] font-semibold text-cyan-400 flex items-center cursor-pointer hover:underline">
                              Team &gt;
                            </span>
                          </div>
                        </div>

                        {/* Card 2: Active Employees & Total Hours (Rings) */}
                        <div className="bg-[#121826] border border-white/5 rounded-2xl p-4 flex flex-col gap-4">
                          {/* Top Item */}
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-[11px] font-medium text-slate-400">Active Employees</div>
                              <CountUp value={DASHBOARD_STATS.activeEmployees} className="block text-2xl font-bold text-white mt-0.5" />
                            </div>
                            {/* Purple Donut Ring Icon */}
                            <div className="w-10 h-10 relative flex items-center justify-center">
                              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#1E293B" strokeWidth="4" />
                                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#C084FC" strokeWidth="4" strokeDasharray="75, 100" strokeLinecap="round" />
                              </svg>
                              <Users className="w-4 h-4 text-purple-400 absolute" />
                            </div>
                          </div>

                          <div className="w-full h-px bg-white/5" />

                          {/* Bottom Item */}
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-[11px] font-medium text-slate-400">Total Hours</div>
                              <CountUp value={DASHBOARD_STATS.totalHours} className="block text-2xl font-bold text-white mt-0.5" />
                            </div>
                            {/* Cyan Donut Ring Icon */}
                            <div className="w-10 h-10 relative flex items-center justify-center">
                              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#1E293B" strokeWidth="4" />
                                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#22D3EE" strokeWidth="4" strokeDasharray="85, 100" strokeLinecap="round" />
                              </svg>
                              <Clock className="w-4 h-4 text-cyan-400 absolute" />
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* BOTTOM ROW: Left Progress List (2 cols) + Right Analytics (1 col) */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                      {/* Bottom Left: Team Activity Employee List */}
                      <div className="lg:col-span-2 bg-[#121826] border border-white/5 rounded-2xl p-5 flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-[14px] font-bold text-white">Team Activity</span>
                          <span className="text-[12px] font-semibold text-cyan-400 cursor-pointer hover:underline">View all &gt;</span>
                        </div>

                        <div className="space-y-3.5">
                          {DASHBOARD_STATS.teamRows.map((row) => (
                            <div key={row.initials} className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3 w-36 shrink-0">
                                <div className={`w-8 h-8 rounded-full ${row.color} flex items-center justify-center text-xs font-bold text-white border border-white/10 shrink-0`}>
                                  {row.initials}
                                </div>
                                <div className="min-w-0">
                                  <div className="text-[12px] font-bold text-white truncate">{row.name}</div>
                                  <div className="text-[10px] text-slate-500 truncate">{row.employees} Employees</div>
                                </div>
                              </div>
                              <div className="flex-1 flex items-center gap-3">
                                <div className="flex-1 h-2 bg-[#1A2234] rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${row.bar.startsWith("from-") ? `bg-gradient-to-r ${row.bar}` : row.bar}`}
                                    style={{ width: `${row.pct}%` }}
                                  />
                                </div>
                                <span className="text-[11px] font-bold text-slate-300 font-mono w-8 text-right">{row.pct}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Bottom Right: Analytics */}
                      <div className="bg-[#121826] border border-white/5 rounded-2xl p-5 flex flex-col justify-between">
                        <div className="text-[14px] font-bold text-white mb-3">Analytics</div>

                        <div className="space-y-3">
                          {/* Item 1 */}
                          <div>
                            <div className="flex justify-between text-[11px] font-medium text-slate-400 mb-1">
                              <span>Performance</span>
                              <span className="text-white font-bold">184</span>
                            </div>
                            <div className="h-2 bg-[#1A2234] rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full" style={{ width: '85%' }} />
                            </div>
                          </div>

                          {/* Item 2: Gauge Ring with 92% */}
                          <div className="flex items-center justify-between bg-[#182030] p-2.5 rounded-xl border border-white/5">
                            <div className="text-[11px] font-medium text-slate-400">Total Hours</div>
                            <div className="w-12 h-12 relative flex items-center justify-center">
                              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#0D1322" strokeWidth="4" />
                                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#22D3EE" strokeWidth="4" strokeDasharray="92, 100" strokeLinecap="round" />
                              </svg>
                              <span className="text-[10px] font-bold text-white font-mono absolute">92%</span>
                            </div>
                          </div>

                          {/* Item 3 */}
                          <div>
                            <div className="flex justify-between text-[11px] font-medium text-slate-400 mb-1">
                              <span>Performance</span>
                              <span className="text-white font-bold">92%</span>
                            </div>
                            <div className="h-2 bg-[#1A2234] rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full" style={{ width: '92%' }} />
                            </div>
                          </div>
                        </div>

                      </div>

                    </div>

                  </div>

                </div>

              </div>
            </div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="px-6 lg:px-12 pb-32 pt-10 relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-[32px] font-bold text-slate-200 mb-10"
          >
            Features
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            {FEATURES.map((feature, i) => {
              const Icon = FEATURE_ICON_MAP[feature.icon];
              const accent = ACCENT_CLASSES[feature.accent];
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.6, delay: i * 0.15 }}
                  className={`group rounded-2xl p-[1px] bg-gradient-to-b transition-all duration-500 ${accent.borderGrad}`}
                >
                  <div className="h-full bg-gradient-to-b from-[#121A2F] to-[#0A0F18] rounded-[15px] p-8 relative overflow-hidden">
                    <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl transition-colors ${accent.glowBg}`} />
                    <div className="flex items-center gap-4 mb-6 relative z-10">
                      <div className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-all ${accent.iconBox}`}>
                        <Icon className={`w-5 h-5 ${accent.iconColor}`} />
                      </div>
                      <h3 className="text-xl font-bold text-slate-200">{feature.title}</h3>
                    </div>
                    <div className="space-y-3 relative z-10">
                      <h4 className="text-[15px] font-semibold text-slate-300">{feature.subtitle}</h4>
                      <p className="text-[14px] text-slate-500 leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* ─── Trusted By ─────────────────────────────────────────────────────── */}
        <section className="px-6 lg:px-12 pb-24 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            className="text-center mb-14"
          >
            <p className="text-[13px] uppercase tracking-[0.2em] text-slate-500 font-semibold mb-10">Trusted by modern teams at</p>
            <div className="flex flex-wrap items-center justify-center gap-10 lg:gap-16">
              {TRUSTED_LOGOS.map((brand, i) => (
                <motion.span
                  key={brand}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-[18px] font-bold text-slate-600 hover:text-slate-400 transition-colors tracking-tight cursor-default select-none"
                >
                  {brand}
                </motion.span>
              ))}
            </div>
          </motion.div>

          {/* Separator glow line */}
          <div className="relative h-px my-4">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
          </div>
        </section>

        {/* ─── How It Works ────────────────────────────────────────────────────── */}
        <section className="px-6 lg:px-12 pb-32 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            className="text-center mb-20"
          >
            <span className="inline-block px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[12px] font-semibold uppercase tracking-wider mb-5">
              How It Works
            </span>
            <h2 className="text-[40px] font-bold text-white mb-5">Up and running in minutes</h2>
            <p className="text-slate-400 text-[17px] max-w-xl mx-auto">No lengthy onboarding. No consultants. Just connect, configure, and go.</p>
          </motion.div>

          <div className="relative">
            {/* Connecting line */}
            <div className="absolute top-8 left-[16.67%] right-[16.67%] h-px bg-gradient-to-r from-indigo-500/20 via-cyan-500/30 to-purple-500/20 hidden lg:block" />

            <div className="grid lg:grid-cols-3 gap-10">
              {HOW_IT_WORKS.map((item, i) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.6, delay: i * 0.15 }}
                  className="flex flex-col items-center text-center"
                >
                  <div className={`w-16 h-16 rounded-2xl border ${item.border} ${item.bg} ${item.glow} flex items-center justify-center mb-6 text-[22px] font-bold ${item.text}`}>
                    {item.step}
                  </div>
                  <h3 className="text-[20px] font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-slate-400 text-[15px] leading-relaxed max-w-xs">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Testimonials ─────────────────────────────────────────────────────── */}
        <section className="px-6 lg:px-12 pb-32 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-[40px] font-bold text-white mb-4">Loved by HR teams everywhere</h2>
            <p className="text-slate-400 text-[17px]">See what our customers are saying.</p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className={`rounded-2xl p-[1px] bg-gradient-to-b ${t.gradient} ${t.border} border hover:scale-[1.02] transition-transform duration-300`}
              >
                <div className="h-full bg-[#0D1324] rounded-[15px] p-8 flex flex-col gap-6">
                  {/* Stars */}
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, j) => (
                      <svg key={j} className="w-4 h-4 text-amber-400 fill-amber-400" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    ))}
                  </div>
                  <p className="text-slate-300 text-[15px] leading-relaxed flex-1">"{t.quote}"</p>
                  <div className="flex items-center gap-3 pt-2 border-t border-white/5">
                    <div className={`w-10 h-10 rounded-full ${t.avatarBg} flex items-center justify-center text-[12px] font-bold text-white`}>
                      {t.initials}
                    </div>
                    <div>
                      <div className="text-[14px] font-semibold text-white">{t.name}</div>
                      <div className="text-[12px] text-slate-500">{t.role}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ─── Final CTA ────────────────────────────────────────────────────────── */}
        <section className="px-6 lg:px-12 pb-32 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
            className="relative rounded-3xl overflow-hidden border border-white/10 p-16 text-center"
          >
            {/* BG glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-[#0D1324] to-purple-900/40" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
            {/* Inline hex pattern — avoids creating a second fixed-position SVG */}
            <div className="absolute inset-0 opacity-[0.04] pointer-events-none overflow-hidden">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="hexagons-cta" width="60" height="52" patternUnits="userSpaceOnUse" patternTransform="scale(1.5)">
                    <path d="M30 0 L60 17.32 L60 51.96 L30 69.28 L0 51.96 L0 17.32 Z" fill="none" stroke="#60A5FA" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#hexagons-cta)" />
              </svg>
            </div>

            <div className="relative z-10">
              <h2 className="text-[44px] lg:text-[52px] font-bold text-white mb-6 leading-tight">
                {FINAL_CTA.titleWhite} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C084FC] via-[#60A5FA] to-[#22D3EE]">
                  {FINAL_CTA.titleGradient}
                </span>
              </h2>
              <p className="text-slate-400 text-[18px] mb-10 max-w-lg mx-auto">
                {FINAL_CTA.subtitle}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
                <Link href={FINAL_CTA.primaryCta.href} className="px-10 py-4 rounded-full bg-gradient-to-r from-[#9333EA] to-[#06B6D4] text-white font-semibold text-[17px] flex items-center gap-2 shadow-[0_0_40px_rgba(147,51,234,0.4)] hover:shadow-[0_0_60px_rgba(147,51,234,0.6)] transition-all">
                  {FINAL_CTA.primaryCta.label} <ChevronRight className="w-5 h-5" />
                </Link>
                <Link href={FINAL_CTA.secondaryCta.href} className="px-10 py-4 rounded-full border border-white/10 text-white font-semibold text-[17px] hover:bg-white/5 transition-all">
                  {FINAL_CTA.secondaryCta.label}
                </Link>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ─── Footer ───────────────────────────────────────────────────────────── */}
        <footer className="border-t border-white/5 px-6 lg:px-12 py-16 relative z-10">
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-10 mb-14">
            {/* Brand */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-5">
                <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                  <path d="M22 10.5C22 14.0899 19.0899 17 15.5 17H10V10.5C10 6.91015 12.9101 4 16.5 4H22V10.5Z" fill="url(#logo-footer-1)"/>
                  <path d="M10 21.5C10 17.9101 12.9101 15 16.5 15H22V21.5C22 25.0899 19.0899 28 15.5 28H10V21.5Z" fill="url(#logo-footer-2)"/>
                  <defs>
                    <linearGradient id="logo-footer-1" x1="10" y1="4" x2="22" y2="17" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#2DD4BF"/><stop offset="1" stopColor="#3B82F6"/>
                    </linearGradient>
                    <linearGradient id="logo-footer-2" x1="10" y1="15" x2="22" y2="28" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#3B82F6"/><stop offset="1" stopColor="#A855F7"/>
                    </linearGradient>
                  </defs>
                </svg>
                <span className="text-xl font-bold text-white tracking-tight">StaffDesk</span>
              </div>
              <p className="text-slate-500 text-[14px] leading-relaxed max-w-xs">
                {FOOTER_TAGLINE}
              </p>
            </div>

            {/* Links */}
            {FOOTER_COLUMNS.map((col) => (
              <div key={col.heading}>
                <div className="text-[12px] font-semibold uppercase tracking-widest text-slate-500 mb-5">{col.heading}</div>
                <ul className="space-y-3">
                  {col.links.map((l) => (
                    <li key={l}>
                      <a href="#" className="text-[14px] text-slate-400 hover:text-white transition-colors">{l}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-slate-600 text-[13px]">© 2026 StaffDesk Operations Inc. All rights reserved.</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-500 text-[13px]">All systems operational</span>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}