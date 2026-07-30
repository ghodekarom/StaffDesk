"use client";

import Link from "next/link";
import { ChevronDown, Clock, Search, LayoutDashboard, Users, Calendar, DollarSign, FileText, Settings, ChevronRight, Activity, LineChart as LineChartIcon, Menu } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useState, useEffect } from "react";

function HexagonPattern() {
  return (
    <svg className="absolute inset-0 w-[200%] h-[200%] opacity-[0.04] pointer-events-none -translate-x-1/4 -translate-y-1/4" xmlns="http://www.w3.org/2000/svg">
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
  const y1 = useTransform(scrollY, [0, 1000], [0, 200]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -200]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#070A11] text-slate-300 font-sans relative overflow-x-hidden selection:bg-cyan-500/30">
      
      {/* Background Ambience */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#4F46E5] opacity-20 blur-[150px] rounded-full pointer-events-none mix-blend-screen animate-pulse-slow" />
      <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-[#06B6D4] opacity-15 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[40%] bg-[#7C3AED] opacity-15 blur-[150px] rounded-full pointer-events-none mix-blend-screen" />
      
      <HexagonPattern />

      {/* Main Container */}
      <div className="max-w-[1400px] mx-auto min-h-screen flex flex-col relative z-10">
        
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
            <Link href="#" className="text-[13px] font-medium text-slate-300 hover:text-white hover:bg-white/5 px-4 py-2 rounded-full transition-all">Pricing</Link>
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
        <main className="flex-1 flex flex-col lg:flex-row items-center justify-between px-6 lg:px-12 pt-8 pb-32 gap-16 relative">
          
          {/* Left Text */}
          <div className="flex-1 max-w-2xl relative z-20">
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-[52px] sm:text-[64px] lg:text-[72px] font-bold leading-[1.05] tracking-tight mb-8"
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C084FC] via-[#60A5FA] to-[#22D3EE] drop-shadow-lg">
                Workforce operations,
              </span>
              <br />
              <span className="text-white">managed in one system</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="text-[18px] sm:text-[20px] text-[#94A3B8] leading-relaxed mb-12 max-w-[540px]"
            >
              Optimize scheduling, track time, manage payroll, and streamline HR processes in a unified platform for modern teams.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              className="flex flex-wrap items-center gap-8"
            >
              <Link href="/login" className="group relative px-8 py-4 rounded-full font-semibold flex items-center gap-2 transition-all overflow-hidden text-white">
                <div className="absolute inset-0 bg-gradient-to-r from-[#9333EA] to-[#06B6D4] transition-all group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#A855F7] to-[#22D3EE] opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute -inset-1 bg-gradient-to-r from-[#9333EA] to-[#06B6D4] blur-xl opacity-40 group-hover:opacity-70 transition-opacity" />
                <span className="relative z-10 flex items-center gap-2 text-[17px] tracking-wide">
                  Request Demo <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              <Link href="#" className="text-[#38BDF8] font-medium text-[17px] hover:text-[#7DD3FC] hover:underline underline-offset-4 transition-all">
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
            className="flex-[1.3] relative w-full lg:min-w-[700px] xl:min-w-[850px]"
          >
            {/* The Dashboard UI Window */}
            <div className="bg-[#0B1120] border border-white/10 rounded-2xl shadow-[0_30px_100px_rgba(0,0,0,0.8),_0_0_80px_rgba(56,189,248,0.15)] relative z-10 overflow-hidden flex flex-col group">
              
              {/* Window Header */}
              <div className="h-14 bg-[#111827] border-b border-white/5 flex items-center justify-between px-5 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-cyan-500/5" />
                <div className="flex items-center gap-3 relative z-10">
                  <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 10.5C22 14.0899 19.0899 17 15.5 17H10V10.5C10 6.91015 12.9101 4 16.5 4H22V10.5Z" fill="#2DD4BF"/>
                    <path d="M10 21.5C10 17.9101 12.9101 15 16.5 15H22V21.5C22 25.0899 19.0899 28 15.5 28H10V21.5Z" fill="#A855F7"/>
                  </svg>
                  <span className="text-[13px] font-bold text-white tracking-wide">StaffDesk</span>
                  <div className="w-px h-4 bg-white/10 mx-2" />
                  <span className="text-[12px] font-medium text-slate-300">Dashboard</span>
                </div>
                <div className="flex items-center gap-3 relative z-10">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1F2937] rounded-md border border-white/5">
                    <Search className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[11px] text-slate-500 w-16">Search...</span>
                  </div>
                  <div className="flex items-center gap-1.5 ml-2">
                    <div className="w-6 h-6 rounded-full bg-[#EAB308] border-2 border-[#111827] flex items-center justify-center text-[9px] font-bold text-white shadow-sm -mr-2 relative z-20">A</div>
                    <div className="w-6 h-6 rounded-full bg-[#EC4899] border-2 border-[#111827] flex items-center justify-center text-[9px] font-bold text-white shadow-sm relative z-10">J</div>
                  </div>
                </div>
              </div>
              
              {/* Window Body */}
              <div className="flex-1 flex bg-[#0B1120]">
                {/* Sidebar */}
                <div className="w-48 border-r border-white/5 p-4 flex flex-col gap-1.5 bg-[#0D1324]">
                  <div className="flex items-center gap-3 text-[12px] text-white bg-gradient-to-r from-indigo-500/20 to-transparent border-l-2 border-indigo-500 px-3 py-2 rounded-r-md">
                    <LayoutDashboard className="w-4 h-4 text-indigo-400" /> Dashboard
                  </div>
                  <div className="flex items-center justify-between text-[12px] text-slate-400 px-3 py-2 hover:bg-white/5 rounded-md cursor-pointer transition-colors">
                    <div className="flex items-center gap-3"><Users className="w-4 h-4" /> Team</div>
                  </div>
                  <div className="flex items-center justify-between text-[12px] text-slate-400 px-3 py-2 hover:bg-white/5 rounded-md cursor-pointer transition-colors">
                    <div className="flex items-center gap-3"><Calendar className="w-4 h-4" /> Schedule</div>
                  </div>
                  <div className="flex items-center gap-3 text-[12px] text-slate-400 px-3 py-2 hover:bg-white/5 rounded-md cursor-pointer transition-colors">
                    <Clock className="w-4 h-4" /> Time
                  </div>
                  <div className="flex items-center gap-3 text-[12px] text-slate-400 px-3 py-2 hover:bg-white/5 rounded-md cursor-pointer transition-colors">
                    <DollarSign className="w-4 h-4" /> Payroll
                  </div>
                  <div className="flex items-center gap-3 text-[12px] text-slate-400 px-3 py-2 hover:bg-white/5 rounded-md cursor-pointer transition-colors">
                    <FileText className="w-4 h-4" /> Reports
                  </div>
                  <div className="mt-auto flex items-center gap-3 text-[12px] text-slate-400 px-3 py-2 hover:bg-white/5 rounded-md cursor-pointer transition-colors">
                    <Settings className="w-4 h-4" /> Settings
                  </div>
                </div>
                
                {/* Main Content Area */}
                <div className="flex-1 p-6 flex flex-col gap-6">
                  {/* Top Row: Big Chart + Stats */}
                  <div className="flex gap-6 h-56">
                    {/* Main Chart */}
                    <div className="flex-[2] bg-[#141A29] rounded-xl border border-white/5 p-5 relative overflow-hidden flex flex-col group/chart">
                      <div className="flex justify-between items-center mb-6">
                        <span className="text-[14px] font-semibold text-white">Team Activity</span>
                        <div className="flex items-center gap-2 bg-[#1E293B] px-3 py-1.5 rounded-lg border border-white/5 cursor-pointer">
                          <span className="text-[11px] text-slate-300">Jan 24</span>
                          <ChevronDown className="w-3 h-3 text-slate-500" />
                        </div>
                      </div>
                      
                      {/* Grid Lines */}
                      <div className="absolute inset-0 top-16 bottom-6 left-5 right-5 flex flex-col justify-between pointer-events-none">
                        {[1,2,3,4,5].map(i => <div key={i} className="w-full border-t border-white/5" />)}
                      </div>
                      <div className="absolute left-1 top-14 bottom-6 flex flex-col justify-between text-[9px] text-slate-500 h-full">
                        <span>250</span><span>200</span><span>150</span><span>100</span><span>50</span>
                      </div>
                      <div className="absolute bottom-1 left-8 right-5 flex justify-between text-[9px] text-slate-500">
                        <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
                      </div>

                      {/* Fake SVG Chart Lines matching the prompt precisely */}
                      <div className="absolute inset-0 top-14 bottom-8 left-8 right-5">
                        <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                          {/* Purple Wave */}
                          <path d="M0,80 C15,60 25,40 40,60 C55,80 65,20 80,40 C90,55 100,30 100,30" fill="none" stroke="#A855F7" strokeWidth="2.5" vectorEffect="non-scaling-stroke" className="group-hover/chart:stroke-[3px] transition-all" />
                          <path d="M0,80 C15,60 25,40 40,60 C55,80 65,20 80,40 C90,55 100,30 100,30 L100,100 L0,100 Z" fill="url(#purple-fade)" opacity="0.15" />
                          
                          {/* Cyan Wave */}
                          <path d="M0,90 C20,95 30,70 50,85 C65,95 80,50 100,60" fill="none" stroke="#2DD4BF" strokeWidth="2.5" vectorEffect="non-scaling-stroke" className="group-hover/chart:stroke-[3px] transition-all" />
                          
                          <defs>
                            <linearGradient id="purple-fade" x1="0" y1="0" x2="0" y2="1">
                              <stop stopColor="#A855F7" />
                              <stop offset="1" stopColor="transparent" />
                            </linearGradient>
                          </defs>

                          {/* Data point tooltip mockup */}
                          <circle cx="65" cy="20" r="3" fill="#A855F7" className="animate-pulse" />
                          <circle cx="65" cy="20" r="6" fill="transparent" stroke="#A855F7" opacity="0.5" />
                        </svg>
                        
                        {/* Tooltip */}
                        <div className="absolute top-[5%] left-[55%] bg-[#1E293B] border border-indigo-500/30 rounded px-2 py-1 flex items-center gap-1.5 shadow-lg">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#A855F7]" />
                          <span className="text-[10px] text-white font-mono">130</span>
                          <span className="text-[9px] text-emerald-400">+12%</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Stats Column */}
                    <div className="flex-[1] flex flex-col gap-4">
                      <div className="flex-1 bg-[#141A29] rounded-xl border border-white/5 p-5 flex flex-col justify-between relative overflow-hidden group/stat1">
                        <div className="absolute -right-4 -top-4 w-16 h-16 bg-purple-500/10 rounded-full blur-xl group-hover/stat1:bg-purple-500/20 transition-colors" />
                        <div className="text-[12px] font-medium text-slate-400">Active Employees</div>
                        <div className="text-[28px] font-bold text-white leading-none">184</div>
                        <div className="flex items-center justify-between mt-2">
                           <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mr-3">
                             <div className="w-[85%] h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full" />
                           </div>
                           <span className="text-[10px] text-emerald-400 whitespace-nowrap">+4 this week</span>
                        </div>
                      </div>
                      <div className="flex-1 bg-[#141A29] rounded-xl border border-white/5 p-5 flex flex-col justify-between relative overflow-hidden group/stat2">
                        <div className="absolute -right-4 -top-4 w-16 h-16 bg-cyan-500/10 rounded-full blur-xl group-hover/stat2:bg-cyan-500/20 transition-colors" />
                        <div className="text-[12px] font-medium text-slate-400">Total Hours</div>
                        <div className="text-[28px] font-bold text-white leading-none">3,210</div>
                        <div className="flex items-center justify-between mt-2">
                           <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mr-3">
                             <div className="w-[65%] h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" />
                           </div>
                           <span className="text-[10px] text-rose-400 whitespace-nowrap">-2% vs last</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Bottom Row: Lists & Progress */}
                  <div className="flex gap-6 flex-1">
                    <div className="flex-[2] bg-[#141A29] rounded-xl border border-white/5 p-5">
                       <div className="flex justify-between items-center mb-5">
                        <span className="text-[14px] font-semibold text-white">Team Activity</span>
                        <span className="text-[11px] font-medium text-[#38BDF8] cursor-pointer hover:underline">View all &gt;</span>
                      </div>
                      <div className="space-y-4">
                        {[
                          { name: 'Axer Montana', role: '32 Hrs/wk', progress: 89, color: 'from-[#6366F1] to-[#A855F7]', avatar: 'AM' },
                          { name: 'Jamon Retine', role: '12 Hrs/wk', progress: 73, color: 'from-[#06B6D4] to-[#3B82F6]', avatar: 'JR' },
                          { name: 'Sioa Desmar', role: '15 Hrs/wk', progress: 50, color: 'from-[#8B5CF6] to-[#D946EF]', avatar: 'SD' },
                        ].map((row, i) => (
                          <div key={i} className="flex items-center justify-between group/row">
                            <div className="flex items-center gap-3">
                              <div className="w-7 h-7 rounded-full bg-[#1E293B] border border-white/10 flex items-center justify-center text-[10px] font-bold text-slate-300">
                                {row.avatar}
                              </div>
                              <div>
                                <div className="text-[12px] font-semibold text-slate-200 group-hover/row:text-white transition-colors">{row.name}</div>
                                <div className="text-[10px] text-slate-500">{row.role}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 w-40">
                              <div className="flex-1 h-1.5 bg-[#0B1120] rounded-full overflow-hidden border border-white/5">
                                <div className={`h-full bg-gradient-to-r ${row.color} rounded-full`} style={{ width: `${row.progress}%` }}></div>
                              </div>
                              <span className="text-[10px] font-mono text-slate-400 w-8 text-right">{row.progress}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex-1 bg-[#141A29] rounded-xl border border-white/5 p-5">
                       <div className="text-[14px] font-semibold text-white mb-5">Analytics</div>
                       <div className="space-y-5">
                         <div>
                           <div className="flex justify-between items-end mb-1.5">
                             <span className="text-[11px] text-slate-400">Performance</span>
                             <span className="text-[13px] text-white font-bold">184</span>
                           </div>
                           <div className="w-full h-1.5 bg-[#0B1120] rounded-full overflow-hidden border border-white/5">
                             <div className="w-[85%] h-full bg-[#3B82F6] rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                           </div>
                         </div>
                         <div>
                           <div className="flex justify-between items-end mb-1.5">
                             <span className="text-[11px] text-slate-400">Total Hours</span>
                             <span className="text-[13px] text-white font-bold">52K</span>
                           </div>
                           <div className="w-full h-1.5 bg-[#0B1120] rounded-full overflow-hidden border border-white/5">
                             <div className="w-[65%] h-full bg-[#2DD4BF] rounded-full shadow-[0_0_10px_rgba(45,212,191,0.5)]"></div>
                           </div>
                         </div>
                         <div>
                           <div className="flex justify-between items-end mb-1.5">
                             <span className="text-[11px] text-slate-400">Efficiency</span>
                             <span className="text-[13px] text-white font-bold">82%</span>
                           </div>
                           <div className="w-full h-1.5 bg-[#0B1120] rounded-full overflow-hidden border border-white/5">
                             <div className="w-[82%] h-full bg-[#A855F7] rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div>
                           </div>
                         </div>
                       </div>
                    </div>
                  </div>
                  
                </div>
              </div>
            </div>
          </motion.div>
        </main>

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
            {/* Feature 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="group rounded-2xl p-[1px] bg-gradient-to-b from-indigo-500/30 to-transparent hover:from-indigo-400/60 transition-all duration-500"
            >
              <div className="h-full bg-gradient-to-b from-[#121A2F] to-[#0A0F18] rounded-[15px] p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors" />
                <div className="flex items-center gap-4 mb-6 relative z-10">
                  <div className="w-12 h-12 rounded-xl border border-indigo-500/30 flex items-center justify-center bg-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.15)] group-hover:shadow-[0_0_25px_rgba(99,102,241,0.3)] transition-all">
                    <Clock className="w-5 h-5 text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-200">Automated Scheduling</h3>
                </div>
                <div className="space-y-3 relative z-10">
                  <h4 className="text-[15px] font-semibold text-slate-300">Smart shift planning & rotas</h4>
                  <p className="text-[14px] text-slate-500 leading-relaxed">
                    Easily create schedules, manage shifts, and reduce conflicts.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Feature 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="group rounded-2xl p-[1px] bg-gradient-to-b from-cyan-500/30 to-transparent hover:from-cyan-400/60 transition-all duration-500"
            >
              <div className="h-full bg-gradient-to-b from-[#121A2F] to-[#0A0F18] rounded-[15px] p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-colors" />
                <div className="flex items-center gap-4 mb-6 relative z-10">
                  <div className="w-12 h-12 rounded-xl border border-cyan-500/30 flex items-center justify-center bg-cyan-500/10 shadow-[0_0_15px_rgba(6,182,212,0.15)] group-hover:shadow-[0_0_25px_rgba(6,182,212,0.3)] transition-all">
                    <Activity className="w-5 h-5 text-cyan-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-200">Time & Attendance</h3>
                </div>
                <div className="space-y-3 relative z-10">
                  <h4 className="text-[15px] font-semibold text-slate-300">Real-time tracking & reporting</h4>
                  <p className="text-[14px] text-slate-500 leading-relaxed">
                    Monitor attendance, clock-ins/outs, and generate accurate reports.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Feature 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="group rounded-2xl p-[1px] bg-gradient-to-b from-purple-500/30 to-transparent hover:from-purple-400/60 transition-all duration-500"
            >
              <div className="h-full bg-gradient-to-b from-[#121A2F] to-[#0A0F18] rounded-[15px] p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-colors" />
                <div className="flex items-center gap-4 mb-6 relative z-10">
                  <div className="w-12 h-12 rounded-xl border border-purple-500/30 flex items-center justify-center bg-purple-500/10 shadow-[0_0_15px_rgba(168,85,247,0.15)] group-hover:shadow-[0_0_25px_rgba(168,85,247,0.3)] transition-all">
                    <LineChartIcon className="w-5 h-5 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-200">Payroll Management</h3>
                </div>
                <div className="space-y-3 relative z-10">
                  <h4 className="text-[15px] font-semibold text-slate-300">Seamless payroll processing</h4>
                  <p className="text-[14px] text-slate-500 leading-relaxed">
                    Automate payroll calculations, handle tax filings, and ensure compliance.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

      </div>
    </div>
  );
}
