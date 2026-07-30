"use client";

import Link from "next/link";
import { ChevronDown, Clock, Search, LayoutDashboard, Users, Calendar, DollarSign, FileText, Settings, ChevronRight, Activity, LineChart as LineChartIcon } from "lucide-react";
import { motion } from "framer-motion";

function HexagonPattern() {
  return (
    <svg className="absolute inset-0 w-full h-full opacity-[0.03] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="hexagons" width="50" height="43.4" patternUnits="userSpaceOnUse" patternTransform="scale(2)">
          <path d="M25 0 L50 14.4 L50 43.4 L25 57.8 L0 43.4 L0 14.4 Z" fill="none" stroke="currentColor" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#hexagons)" />
    </svg>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#070B14] text-slate-300 font-sans relative overflow-hidden selection:bg-cyan-500/30">
      <HexagonPattern />

      {/* Main Container mimicking the rounded frame in the mockup */}
      <div className="max-w-[1400px] mx-auto min-h-screen flex flex-col relative z-10">
        
        {/* Navigation */}
        <header className="flex items-center justify-between px-6 lg:px-12 py-8">
          <div className="flex items-center gap-3">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 10.5C22 14.0899 19.0899 17 15.5 17H10V10.5C10 6.91015 12.9101 4 16.5 4H22V10.5Z" fill="url(#logo-grad-1)"/>
              <path d="M10 21.5C10 17.9101 12.9101 15 16.5 15H22V21.5C22 25.0899 19.0899 28 15.5 28H10V21.5Z" fill="url(#logo-grad-2)"/>
              <defs>
                <linearGradient id="logo-grad-1" x1="10" y1="4" x2="22" y2="17" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#2DD4BF" />
                  <stop offset="1" stopColor="#818CF8" />
                </linearGradient>
                <linearGradient id="logo-grad-2" x1="10" y1="15" x2="22" y2="28" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#818CF8" />
                  <stop offset="1" stopColor="#A855F7" />
                </linearGradient>
              </defs>
            </svg>
            <span className="font-display text-xl font-bold tracking-tight text-white">StaffDesk</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 bg-[#131B2A]/40 backdrop-blur-md px-6 py-2.5 rounded-full border border-white/5">
            <button className="flex items-center gap-1.5 text-sm font-medium hover:text-white transition-colors">
              Features <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>
            <Link href="#" className="text-sm font-medium hover:text-white transition-colors">Pricing</Link>
            <Link href="#" className="text-sm font-medium hover:text-white transition-colors">Integrations</Link>
            <button className="flex items-center gap-1.5 text-sm font-medium hover:text-white transition-colors">
              Company <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>
          </nav>

          <div className="flex items-center gap-6">
            <Link href="/login" className="text-sm font-medium hover:text-white transition-colors">
              Login
            </Link>
            <Link href="/login" className="text-sm font-semibold text-cyan-400 px-5 py-2.5 rounded-lg border border-cyan-500/30 bg-[#0F172A]/50 hover:bg-[#0F172A] transition-all">
              Get Started
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <main className="flex-1 flex flex-col lg:flex-row items-center justify-between px-6 lg:px-12 pt-12 pb-24 gap-12">
          
          {/* Left Text */}
          <div className="flex-1 max-w-xl">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-[44px] lg:text-[56px] font-bold leading-[1.1] tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-400 to-cyan-400 mb-6"
            >
              Workforce operations, managed in one system
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg text-slate-400 leading-relaxed mb-10 max-w-lg"
            >
              Optimize scheduling, track time, manage payroll, and streamline HR processes in a unified platform for modern teams.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex items-center gap-8"
            >
              <Link href="/login" className="px-8 py-3.5 rounded-full bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold flex items-center gap-2 transition-all shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:shadow-[0_0_40px_rgba(168,85,247,0.5)]">
                Request Demo <ChevronRight className="w-4 h-4" />
              </Link>
              <Link href="#" className="text-cyan-400 font-medium hover:text-cyan-300 transition-colors">
                Learn More
              </Link>
            </motion.div>
          </div>

          {/* Right Dashboard Mockup CSS */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex-[1.2] relative w-full"
          >
            {/* Soft background glows */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />
            
            {/* The Dashboard UI Window */}
            <div className="bg-[#121623] border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative z-10 aspect-[16/10] flex flex-col">
              {/* Window Header */}
              <div className="h-12 border-b border-white/5 flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                  <svg width="18" height="18" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 10.5C22 14.0899 19.0899 17 15.5 17H10V10.5C10 6.91015 12.9101 4 16.5 4H22V10.5Z" fill="#2DD4BF"/>
                    <path d="M10 21.5C10 17.9101 12.9101 15 16.5 15H22V21.5C22 25.0899 19.0899 28 15.5 28H10V21.5Z" fill="#A855F7"/>
                  </svg>
                  <span className="text-xs font-semibold text-white tracking-wide">StaffDesk</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-md border border-white/5">
                    <Search className="w-3 h-3 text-slate-400" />
                    <span className="text-[10px] text-slate-500">Dashboard</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center text-[8px] font-bold text-white">AR</div>
                    <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-[8px] font-bold text-white">JS</div>
                  </div>
                </div>
              </div>
              
              {/* Window Body */}
              <div className="flex-1 flex">
                {/* Sidebar */}
                <div className="w-40 border-r border-white/5 p-4 flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-[10px] text-white bg-white/5 px-2 py-1.5 rounded-md">
                    <LayoutDashboard className="w-3.5 h-3.5 text-indigo-400" /> Dashboard
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 px-2 py-1.5 hover:bg-white/5 rounded-md">
                    <Users className="w-3.5 h-3.5" /> Team
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 px-2 py-1.5 hover:bg-white/5 rounded-md">
                    <Calendar className="w-3.5 h-3.5" /> Schedule
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 px-2 py-1.5 hover:bg-white/5 rounded-md">
                    <Clock className="w-3.5 h-3.5" /> Time
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 px-2 py-1.5 hover:bg-white/5 rounded-md">
                    <DollarSign className="w-3.5 h-3.5" /> Payroll
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 px-2 py-1.5 hover:bg-white/5 rounded-md">
                    <FileText className="w-3.5 h-3.5" /> Reports
                  </div>
                  <div className="mt-auto flex items-center gap-2 text-[10px] text-slate-500 px-2 py-1.5">
                    <Settings className="w-3.5 h-3.5" /> Settings
                  </div>
                </div>
                
                {/* Main Content */}
                <div className="flex-1 p-5 flex flex-col gap-5">
                  {/* Top Chart Area */}
                  <div className="flex gap-5">
                    <div className="flex-[2] bg-[#1A1F30] rounded-xl border border-white/5 p-4 relative overflow-hidden">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-[11px] font-semibold text-white">Team Activity</span>
                        <div className="flex gap-2">
                          <span className="text-[9px] text-slate-400 px-2 py-1 bg-white/5 rounded border border-white/5">Jan 24</span>
                        </div>
                      </div>
                      {/* Fake Chart Lines */}
                      <div className="absolute bottom-4 left-4 right-4 h-24">
                        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                          <path d="M0,80 Q10,20 25,50 T50,30 T75,60 T100,10" fill="none" stroke="#A855F7" strokeWidth="3" vectorEffect="non-scaling-stroke" />
                          <path d="M0,90 Q15,60 30,80 T60,40 T80,70 T100,30" fill="none" stroke="#2DD4BF" strokeWidth="3" vectorEffect="non-scaling-stroke" />
                          <path d="M0,90 Q15,60 30,80 T60,40 T80,70 T100,30 L100,100 L0,100 Z" fill="url(#chart-grad)" opacity="0.2" vectorEffect="non-scaling-stroke" />
                          <defs>
                            <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                              <stop stopColor="#2DD4BF" />
                              <stop offset="1" stopColor="transparent" />
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col gap-3">
                      <div className="flex-1 bg-[#1A1F30] rounded-xl border border-white/5 p-4 flex flex-col justify-center">
                        <div className="text-[10px] text-slate-400 mb-1">Active Employees</div>
                        <div className="text-xl font-bold text-white">184</div>
                        <div className="mt-2 w-8 h-8 rounded-full border-2 border-cyan-400 border-r-transparent border-t-transparent rotate-45"></div>
                      </div>
                      <div className="flex-1 bg-[#1A1F30] rounded-xl border border-white/5 p-4 flex flex-col justify-center">
                        <div className="text-[10px] text-slate-400 mb-1">Total Hours</div>
                        <div className="text-xl font-bold text-white">3,210</div>
                        <div className="mt-2 w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                          <div className="w-[75%] h-full bg-purple-500 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Bottom Area */}
                  <div className="flex gap-5">
                    <div className="flex-[2] bg-[#1A1F30] rounded-xl border border-white/5 p-4">
                       <div className="flex justify-between items-center mb-4">
                        <span className="text-[11px] font-semibold text-white">Team Activity</span>
                        <span className="text-[9px] text-indigo-400">View all &gt;</span>
                      </div>
                      <div className="space-y-3">
                        {[
                          { name: 'Alex Montana', role: '32 Hrs/wk', progress: 85, color: 'bg-indigo-500' },
                          { name: 'Jamon Retine', role: '12 Hrs/wk', progress: 73, color: 'bg-cyan-500' },
                          { name: 'Sioa Desmar', role: '15 Hrs/wk', progress: 50, color: 'bg-purple-500' },
                        ].map((row, i) => (
                          <div key={i} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-full bg-slate-700"></div>
                              <div>
                                <div className="text-[9px] font-semibold text-white">{row.name}</div>
                                <div className="text-[8px] text-slate-500">{row.role}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 w-32">
                              <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div className={`h-full ${row.color}`} style={{ width: `${row.progress}%` }}></div>
                              </div>
                              <span className="text-[8px] text-slate-400 w-6 text-right">{row.progress}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex-1 bg-[#1A1F30] rounded-xl border border-white/5 p-4">
                       <div className="text-[11px] font-semibold text-white mb-4">Analytics</div>
                       <div className="space-y-4">
                         <div>
                           <div className="flex justify-between text-[9px] mb-1">
                             <span className="text-slate-400">Performance</span>
                             <span className="text-white font-bold">184</span>
                           </div>
                           <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                             <div className="w-[80%] h-full bg-indigo-500 rounded-full"></div>
                           </div>
                         </div>
                         <div>
                           <div className="flex justify-between text-[9px] mb-1">
                             <span className="text-slate-400">Total Hours</span>
                             <span className="text-white font-bold">52K</span>
                           </div>
                           <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                             <div className="w-[60%] h-full bg-cyan-500 rounded-full"></div>
                           </div>
                         </div>
                         <div>
                           <div className="flex justify-between text-[9px] mb-1">
                             <span className="text-slate-400">Performance</span>
                             <span className="text-white font-bold">82%</span>
                           </div>
                           <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                             <div className="w-[82%] h-full bg-purple-500 rounded-full"></div>
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
        <section className="px-6 lg:px-12 pb-24 relative z-10">
          <h2 className="text-[22px] font-bold text-slate-300 mb-8">Features</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-gradient-to-b from-[#131B2A] to-[#0A0F18] border border-indigo-500/20 rounded-2xl p-8 hover:border-indigo-500/40 transition-colors">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded-full border border-indigo-500/30 flex items-center justify-center bg-indigo-500/10">
                  <Clock className="w-4 h-4 text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-300">Automated Scheduling</h3>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-slate-400">Smart shift planning & rotas</h4>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Easily create schedules, manage shifts, and reduce conflicts.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-b from-[#131B2A] to-[#0A0F18] border border-cyan-500/20 rounded-2xl p-8 hover:border-cyan-500/40 transition-colors">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded-full border border-cyan-500/30 flex items-center justify-center bg-cyan-500/10">
                  <Activity className="w-4 h-4 text-cyan-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-300">Time & Attendance</h3>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-slate-400">Real-time tracking & reporting</h4>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Monitor attendance, clock-ins/outs, and generate accurate reports.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-b from-[#131B2A] to-[#0A0F18] border border-purple-500/20 rounded-2xl p-8 hover:border-purple-500/40 transition-colors">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded-full border border-purple-500/30 flex items-center justify-center bg-purple-500/10">
                  <LineChartIcon className="w-4 h-4 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-300">Payroll Management</h3>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-slate-400">Seamless payroll processing</h4>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Automate payroll calculations, handle tax filings, and ensure compliance.
                </p>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
