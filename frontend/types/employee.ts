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
  status: EmployeeStatus;
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
