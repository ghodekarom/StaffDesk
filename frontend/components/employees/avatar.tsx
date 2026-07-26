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

export function Avatar({ firstName, lastName }: { firstName: string; lastName: string }) {
  const initials = `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
  return (
    <div
      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
      style={{ backgroundColor: colorFor(`${firstName}${lastName}`) }}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}
