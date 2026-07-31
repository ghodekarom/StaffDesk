// Centralized copy/content for the marketing landing page (app/page.tsx).
// Editing this file updates the page — no JSX changes needed for copy edits.

export const NAV_LINKS = [
  { label: "Features", href: "#features", hasDropdown: true },
  { label: "Integrations", href: "#" },
] as const;

export const HERO = {
  eyebrowNone: true,
  titleGradient: "Workforce operations,",
  titleWhite: "managed in one system",
  subtitle:
    "Optimize scheduling, track time, manage payroll, and streamline HR processes in a unified platform for modern teams.",
  primaryCta: { label: "Request Demo", href: "/login" },
  secondaryCta: { label: "Learn More", href: "#features" },
};

export const TRUSTED_LOGOS = [
  "Horizon Corp",
  "NexaWave",
  "Orbital HR",
  "PeakForce",
  "Synapse Co",
];

export type Feature = {
  icon: "clock" | "activity" | "chart";
  accent: "indigo" | "cyan" | "purple";
  title: string;
  subtitle: string;
  description: string;
};

export const FEATURES: Feature[] = [
  {
    icon: "clock",
    accent: "indigo",
    title: "Automated Scheduling",
    subtitle: "Smart shift planning & rotas",
    description: "Easily create schedules, manage shifts, and reduce conflicts.",
  },
  {
    icon: "activity",
    accent: "cyan",
    title: "Time & Attendance",
    subtitle: "Real-time tracking & reporting",
    description: "Monitor attendance, clock-ins/outs, and generate accurate reports.",
  },
  {
    icon: "chart",
    accent: "purple",
    title: "Payroll Management",
    subtitle: "Seamless payroll processing",
    description: "Automate payroll calculations, handle tax filings, and ensure compliance.",
  },
];

export type HowItWorksStep = {
  step: string;
  color: "indigo" | "cyan" | "purple";
  border: string;
  bg: string;
  glow: string;
  text: string;
  title: string;
  desc: string;
};

export const HOW_IT_WORKS: HowItWorksStep[] = [
  {
    step: "01",
    color: "indigo",
    border: "border-indigo-500/30",
    bg: "bg-indigo-500/10",
    glow: "shadow-[0_0_20px_rgba(99,102,241,0.2)]",
    text: "text-indigo-400",
    title: "Connect Your Team",
    desc: "Import employees from your existing HR system or invite them via email in seconds. SSO supported.",
  },
  {
    step: "02",
    color: "cyan",
    border: "border-cyan-500/30",
    bg: "bg-cyan-500/10",
    glow: "shadow-[0_0_20px_rgba(6,182,212,0.2)]",
    text: "text-cyan-400",
    title: "Configure Your Workflows",
    desc: "Set up departments, shift patterns, leave policies, and approval chains using our guided setup.",
  },
  {
    step: "03",
    color: "purple",
    border: "border-purple-500/30",
    bg: "bg-purple-500/10",
    glow: "shadow-[0_0_20px_rgba(168,85,247,0.2)]",
    text: "text-purple-400",
    title: "Manage Everything",
    desc: "Your entire workforce operation is live. Track, approve, report — all from one dashboard.",
  },
];

export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  gradient: string;
  border: string;
  initials: string;
  avatarBg: string;
};

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "StaffDesk completely transformed how we manage our 200+ person team. Scheduling conflicts are a thing of the past.",
    name: "Sarah Chen",
    role: "Head of People, Horizon Corp",
    gradient: "from-indigo-500/20 to-transparent",
    border: "border-indigo-500/20",
    initials: "SC",
    avatarBg: "bg-indigo-600",
  },
  {
    quote:
      "The real-time attendance tracking alone saved us 15 hours a week. I can't imagine going back to spreadsheets.",
    name: "Marcus Reid",
    role: "Operations Manager, NexaWave",
    gradient: "from-cyan-500/20 to-transparent",
    border: "border-cyan-500/20",
    initials: "MR",
    avatarBg: "bg-cyan-600",
  },
  {
    quote:
      "Payroll used to take us 2 full days every month. With StaffDesk it's done in under an hour with zero errors.",
    name: "Priya Patel",
    role: "Finance Director, Synapse Co",
    gradient: "from-purple-500/20 to-transparent",
    border: "border-purple-500/20",
    initials: "PP",
    avatarBg: "bg-purple-600",
  },
];

export const FINAL_CTA = {
  titleWhite: "Ready to transform your",
  titleGradient: "workforce operations?",
  subtitle: "Join thousands of HR teams already saving hours every week with StaffDesk.",
  primaryCta: { label: "Get Started", href: "/login" },
  secondaryCta: { label: "Book a Demo", href: "#" },
};

export const FOOTER_COLUMNS = [
  { heading: "Product", links: ["Features", "Changelog", "Roadmap"] },
  { heading: "Company", links: ["About", "Blog", "Careers", "Press"] },
  { heading: "Legal", links: ["Privacy", "Terms", "Security", "Contact"] },
] as const;

export const FOOTER_TAGLINE =
  "The all-in-one workforce management platform built for modern, distributed teams.";

export const DASHBOARD_STATS = {
  activityValue: 530,
  activityDelta: "20%",
  activeEmployees: 184,
  totalHours: 3210,
  teamRows: [
    { initials: "AM", name: "Axel Montana", employees: 32, pct: 86, color: "bg-indigo-600", bar: "from-purple-500 to-cyan-400" },
    { initials: "JR", name: "Jaron Retie", employees: 15, pct: 73, color: "bg-teal-600", bar: "bg-[#22D3EE]" },
    { initials: "SD", name: "Soea Desmar", employees: 10, pct: 70, color: "bg-purple-600", bar: "bg-[#C084FC]" },
  ],
};
