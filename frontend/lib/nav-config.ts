import type { Role } from "@/types/auth";

interface NavItem {
  href: string;
  label: string;
  roles: Role[];
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/overview", label: "Overview", roles: ["ADMIN", "HR", "MANAGER", "EMPLOYEE"] },
  { href: "/employees", label: "Employees", roles: ["ADMIN", "HR", "MANAGER", "EMPLOYEE"] },
  { href: "/departments", label: "Departments", roles: ["ADMIN", "HR", "MANAGER"] },
  { href: "/attendance", label: "Attendance", roles: ["ADMIN", "HR", "MANAGER", "EMPLOYEE"] },
  { href: "/leave", label: "Leave", roles: ["ADMIN", "HR", "MANAGER", "EMPLOYEE"] },
  { href: "/settings", label: "Settings", roles: ["ADMIN", "HR", "MANAGER", "EMPLOYEE"] },
];

export function visibleNavItems(role: Role | null): NavItem[] {
  if (!role) return [];
  return NAV_ITEMS.filter((item) => item.roles.includes(role));
}
