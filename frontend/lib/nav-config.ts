import type { Role } from "@/types/auth";

interface NavItem {
  href: string;
  label: string;
  roles: Role[]; // which roles see this item
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/employees", label: "Employees", roles: ["ADMIN", "HR", "MANAGER", "EMPLOYEE"] },
  { href: "/departments", label: "Departments", roles: ["ADMIN", "HR", "MANAGER"] },
  { href: "/attendance", label: "Attendance", roles: ["ADMIN", "HR", "MANAGER", "EMPLOYEE"] },
  { href: "/leave", label: "Leave", roles: ["ADMIN", "HR", "MANAGER", "EMPLOYEE"] },
];

export function visibleNavItems(role: Role | null): NavItem[] {
  if (!role) return [];
  return NAV_ITEMS.filter((item) => item.roles.includes(role));
}
