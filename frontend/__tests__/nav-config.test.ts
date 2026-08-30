import { visibleNavItems, NAV_ITEMS } from '@/lib/nav-config';
import type { Role } from '@/types/auth';

describe('nav-config RBAC permissions', () => {
  it('returns empty array when role is null', () => {
    expect(visibleNavItems(null)).toEqual([]);
  });

  it('ADMIN sees all administration items including Payroll and Departments', () => {
    const items = visibleNavItems('ADMIN');
    const labels = items.map((i) => i.label);

    expect(labels).toContain('Overview');
    expect(labels).toContain('Employees');
    expect(labels).toContain('Departments');
    expect(labels).toContain('Payroll');
    expect(labels).not.toContain('My Payslips');
  });

  it('HR sees Departments, Payroll, and Core EMS items', () => {
    const items = visibleNavItems('HR');
    const labels = items.map((i) => i.label);

    expect(labels).toContain('Employees');
    expect(labels).toContain('Payroll');
    expect(labels).toContain('Departments');
    expect(labels).not.toContain('My Payslips');
  });

  it('MANAGER sees My Payslips and Team routes, but not Payroll administration', () => {
    const items = visibleNavItems('MANAGER');
    const labels = items.map((i) => i.label);

    expect(labels).toContain('Overview');
    expect(labels).toContain('Employees');
    expect(labels).toContain('Departments');
    expect(labels).toContain('My Payslips');
    expect(labels).not.toContain('Payroll');
  });

  it('EMPLOYEE sees self-service routes only and cannot see Departments or Payroll admin', () => {
    const items = visibleNavItems('EMPLOYEE');
    const labels = items.map((i) => i.label);

    expect(labels).toContain('Overview');
    expect(labels).toContain('Employees');
    expect(labels).toContain('Attendance');
    expect(labels).toContain('Leave');
    expect(labels).toContain('Messages');
    expect(labels).toContain('My Payslips');
    expect(labels).not.toContain('Departments');
    expect(labels).not.toContain('Payroll');
  });
});
