// Mirrors com.company.ems.auth.dto.AuthResponse from the backend,
// minus the refresh token — that never reaches client-side JS.

export type Role = "ADMIN" | "HR" | "MANAGER" | "EMPLOYEE";

export interface SessionUser {
  employeeId: number;
  role: Role;
}

export interface LoginPayload {
  email: string;
  password: string;
}

// Mirrors com.staffdesk.ems.auth.dto.RegisterRequest. Used by the
// ADMIN-only "Create login" action on the Employees page.
export interface RegisterPayload {
  employeeId: number;
  email: string;
  password: string;
  role: Role;
}

// What our BFF route (/api/auth/login) returns to the browser.
// accessToken lives in JS memory only; refreshToken is set as an
// httpOnly cookie server-side and never included in this response body.
export interface ClientAuthResponse {
  accessToken: string;
  expiresIn: number; // seconds
  employeeId: number;
  role: Role;
}

export interface ApiErrorBody {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
}
