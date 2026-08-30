export type EmployeeStatus = "ACTIVE" | "INACTIVE" | "TERMINATED";

// Mirrors EmployeeResponseDto.java
export interface Employee {
  id: number;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  departmentId: number | null;
  departmentName: string | null;
  managerId: number | null;
  managerName: string | null;
  designation: string | null;
  dateOfJoining: string | null; // ISO date (LocalDate)
  // Indian state for Professional Tax (e.g. "Maharashtra"). Nullable.
  workState: string | null;
  status: EmployeeStatus;
  // Whether a matching row exists in `users` -- i.e. whether this employee
  // can actually log in. Employees and login accounts are created via two
  // separate endpoints (POST /employees vs. POST /auth/register), so this
  // can be false for employees who have an HR record but no way to sign in.
  hasLoginAccount: boolean;
}

// Mirrors EmployeeRequestDto.java (fields consumed by applyRequestToEntity)
export interface EmployeeRequest {
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  designation: string | null;
  dateOfJoining: string | null;
  departmentId: number | null;
  managerId: number | null;
  workState: string | null;
}

// Mirrors Spring's Page<T> JSON shape
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // current page index, 0-based
  size: number;
  first: boolean;
  last: boolean;
}