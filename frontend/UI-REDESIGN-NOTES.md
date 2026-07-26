# UI redesign — what changed & how to drop it in

No new npm dependencies — `next/font/google` (Space Grotesk, Inter, JetBrains Mono)
ships with Next.js already.

## Drop-in

Everything in this zip replaces the matching path in your project 1:1,
except `lib/theme.tsx` and `components/ui/theme-toggle.tsx`, which are new
files that sit alongside your existing `lib/` and `components/ui/` files —
they don't touch `auth-context.tsx`, `api.ts`, or `nav-config.ts`.

## What changed

- **`tailwind.config.ts` / `app/globals.css`** — `canvas`, `ink`, `surface`,
  `muted`, `line`, and a new `accent` token are now CSS variables that flip
  under `[data-theme="dark"]` on `<html>`. Any component already using these
  utility classes (`bg-canvas`, `text-ink`, etc.) gets dark mode for free —
  no `dark:` prefixes needed. `status.*` colors flip the same way.
- **`app/layout.tsx`** — wires up the three fonts and a blocking inline
  script that sets `data-theme` before first paint (no light-mode flash on
  reload for someone in dark mode).
- **`lib/theme.tsx`** (new) — `useTheme()` hook, persists to
  `localStorage('staffdesk-theme')`.
- **`components/ui/theme-toggle.tsx`** (new) — the sun/moon toggle button,
  used in the sidebar and on the login page.
- **`app/(dashboard)/layout.tsx`** — full sidebar redesign: logo mark,
  per-item icons, active-route highlight, user role chip, theme toggle.
- **`app/(auth)/login/page.tsx`** — was on raw `slate-*` colors, now matches
  the brand tokens; added the theme toggle.
- **`components/ui/{button,input,modal}.tsx`** — swapped `bg-brand-500` /
  `bg-white` for the new `accent` / `surface` tokens.
- **`components/ui/badge.tsx`** — added the status dot to the pill.
- **`components/employees/employee-table.tsx`** — monospace employee code.
- **`components/departments/department-table.tsx`** — monospace employee
  count, small accent-colored marker next to the head employee's name.

## One thing to check

`app/layout.tsx` imports `useTheme`'s sibling export `NO_FLASH_SCRIPT` from
`lib/theme.tsx` — make sure that file lands in `lib/` before you build, or
the import will fail.

## Not touched

`employee-form.tsx`, both page-level files
(`employees/page.tsx`, `departments/page.tsx` — only their empty-state
`bg-white` was swapped), and everything in `lib/` and `app/api/`. They
already used the token classes and inherit dark mode automatically.

## Update — searchable pickers (this pass)

- **`components/ui/combobox.tsx`** (new) — generic debounced type-ahead.
  Assumes `GET /employees?search=<q>&size=10` and `GET /departments?search=<q>&size=10`
  return the same `Page<T>` shape your list pages already use.
  **Check this against your backend**: if there's no `search` param on those
  endpoints yet, that's the one addition needed server-side — everything
  else (debounce, dropdown, clear button) works client-side against
  whatever `content: T[]` comes back.
- **`components/departments/department-form.tsx`** — head-employee field is
  now this combobox instead of a raw numeric input.
- **`components/employees/employee-form.tsx`** — department and manager
  fields are now comboboxes instead of raw numeric inputs.
