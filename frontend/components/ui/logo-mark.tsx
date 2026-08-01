interface StaffDeskLogoProps {
  size?: number;
  /** Must be unique per rendered instance on the page — SVG gradient ids
   *  are global to the document, so two instances sharing an id will
   *  silently pick up whichever gradient def was parsed first. */
  idPrefix: string;
  className?: string;
}

export function StaffDeskLogo({ size = 32, idPrefix, className }: StaffDeskLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M22 10.5C22 14.0899 19.0899 17 15.5 17H10V10.5C10 6.91015 12.9101 4 16.5 4H22V10.5Z"
        fill={`url(#${idPrefix}-1)`}
      />
      <path
        d="M10 21.5C10 17.9101 12.9101 15 16.5 15H22V21.5C22 25.0899 19.0899 28 15.5 28H10V21.5Z"
        fill={`url(#${idPrefix}-2)`}
      />
      <defs>
        <linearGradient id={`${idPrefix}-1`} x1="10" y1="4" x2="22" y2="17" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2DD4BF" />
          <stop offset="1" stopColor="#3B82F6" />
        </linearGradient>
        <linearGradient id={`${idPrefix}-2`} x1="10" y1="15" x2="22" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3B82F6" />
          <stop offset="1" stopColor="#A855F7" />
        </linearGradient>
      </defs>
    </svg>
  );
}