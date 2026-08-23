# Contributing

Conventions actually followed in the current codebase — not aspirational
style-guide copy.

## Backend conventions

- **Module shape:** every business module follows
  `controller/ → service/ → repository/ → entity/ → dto/`, with its own
  `exception/` package handled by a per-module `@RestControllerAdvice`.
- **DTOs at the boundary:** controllers never expose JPA entities directly —
  every endpoint has a request/response DTO.
- **Interface + impl split for services** where a module has enough surface
  area to warrant it (e.g. `EmployeeService` / `EmployeeServiceImpl`,
  `LeaveService`).
- **Ports & adapters in payroll:** `payroll/service/port/` defines interfaces
  (`EmployeeDirectoryPort`, `AttendanceLeavePort`, `SalaryStructureLookupPort`,
  `PdfStoragePort`) with `*Impl` adapters, decoupling payroll's calculation
  logic from how employee/attendance/leave data is actually fetched. Follow
  this pattern if payroll needs another external dependency.
- **Pure calculation classes:** `payroll/service/calculation/*Calculator`
  classes take rates as parameters and do no entity/repository access — keep
  new statutory calculations in that same pure-function style so they stay
  independently unit-testable (see the existing `*CalculatorTest` classes).
- **Role checks:** use `@PreAuthorize("hasRole('X')")` /
  `@PreAuthorize("hasAnyRole('X','Y')")` at the controller method level, not
  inside service logic. See [`API_REFERENCE.md`](./API_REFERENCE.md) for the
  role required on every existing endpoint before adding a new one.
- **Migrations:** every schema change is a new Flyway file
  (`V{n}__description.sql`) — never edit an already-applied migration.
  **If you add a new value to a Java-side enum that's backed by a DB `CHECK`
  constraint (e.g. `Notification.Type`), you must also write a migration to
  extend that constraint.** This has already caused one bug (see
  [`STATUS_AND_ROADMAP.md`](./STATUS_AND_ROADMAP.md)) — the DB constraint is
  not derived from the Java enum automatically.
- **Versioned data over code changes:** where a business rule changes on a
  schedule outside your control (tax slabs, statutory rates), model it as a
  versioned table (`effective_from`/`effective_to`) seeded via migration,
  not a hardcoded constant — see `payroll_statutory_settings` / `tds_slabs`.

## Frontend conventions

- App Router structure: `(auth)/` and `(dashboard)/` route groups; dashboard
  routes are guarded by `middleware.ts` (cookie presence check) before they
  render.
- Auth state lives in `lib/auth-context.tsx` (React context); no global state
  library beyond that.
- All authenticated data calls go through `apiFetch()`/`apiJson()` in
  `lib/api.ts` — it injects the bearer token and handles 401 → refresh →
  retry-once automatically. Don't hand-roll fetch calls with manual headers
  for authenticated endpoints.
- `lib/nav-config.ts` is the single source of truth for which roles see which
  nav items/pages — keep it in sync with backend `@PreAuthorize` roles when
  adding a page.
- Design tokens (`canvas`, `ink`, `surface`, `muted`, `line`, `accent`,
  `status.*`) are CSS variables that flip under `[data-theme="dark"]` — use
  the existing Tailwind utility classes (`bg-canvas`, `text-ink`, etc.)
  rather than hardcoding colors, so components get dark mode for free. See
  `frontend/UI-REDESIGN-NOTES.md` for the full rationale.

## Git workflow

- Commit convention: Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`)
- No direct commits to `main`; open a PR from a feature branch
- Open an issue to discuss significant changes before submitting a large PR

## Before opening a PR touching payroll

Read the flagged risks in
[`STATUS_AND_ROADMAP.md`](./STATUS_AND_ROADMAP.md#known-gaps-and-flagged-risks)
first — several statutory figures and role assumptions there are explicitly
unconfirmed, and it's easy to build on top of them without realizing.
