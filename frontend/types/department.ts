// Reuses the generic Page<T> pagination wrapper already defined for Employees
// (Spring's Pageable/Page shape: content, totalElements, totalPages, number, first, last)
import { Page } from "@/types/employee";

export interface Department {
  id: number;
  name: string;
  headEmployeeId: number | null;
  headEmployeeName: string | null;
  employeeCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentRequest {
  name: string;
  headEmployeeId: number | null;
}

export type DepartmentPage = Page<Department>;
