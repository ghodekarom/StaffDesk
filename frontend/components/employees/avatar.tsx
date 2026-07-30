// A photo-free identity mark: initials on a color derived deterministically
// from the employee's name, so the same person always gets the same color
// across sessions without storing anything extra.
const PALETTE = [
  "#2D5D53", // brand teal
  "#5C6B64",
  "#8A6D2F",
  "#3E7A6B",
  "#A13B2C",
  "#6B5B95",
  "#2E6F8E",
];

function colorFor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

function statusRingClass(status?: string): string {
  const s = status?.toUpperCase();
  if (s === "ACTIVE") return "ring-active animate-pulse-ring";
  if (s === "INACTIVE") return "ring-inactive";
  if (s === "TERMINATED") return "ring-terminated";
  return "";
}

export function Avatar({ firstName, lastName, status }: { firstName: string; lastName: string; status?: string }) {
  const initials = `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
  const ring = statusRingClass(status);
  return (
    <div
      className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white transition-shadow ${ring}`}
      style={{ backgroundColor: colorFor(`${firstName}${lastName}`) }}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}

// Animations need to be defined in globals.css (already added).
// @keyframes pulseRing and .animate-pulse-ring are in globals.css.
