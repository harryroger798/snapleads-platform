interface SnapLeadsLogoProps {
  size?: number;
  className?: string;
}

export default function SnapLeadsLogo({ size = 40, className = "" }: SnapLeadsLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="snapleads-bg" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7C3AED" />
          <stop offset="1" stopColor="#A855F7" />
        </linearGradient>
        <linearGradient id="snapleads-icon" x1="16" y1="16" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#E9D5FF" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="url(#snapleads-bg)" />
      {/* Chain link / S shape representing SnapLeads */}
      <path
        d="M38 18C33.58 18 30 21.58 30 26V28H26C21.58 28 18 31.58 18 36C18 40.42 21.58 44 26 44H28V46H26C20.48 46 16 41.52 16 36C16 30.48 20.48 26 26 26H28V26C28 20.48 32.48 16 38 16C43.52 16 48 20.48 48 26C48 31.52 43.52 36 38 36H36V38H38C44.63 38 50 32.63 50 26C50 19.37 44.63 14 38 14"
        fill="none"
        stroke="url(#snapleads-icon)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="26" cy="36" r="5" fill="url(#snapleads-icon)" opacity="0.9" />
      <circle cx="38" cy="26" r="5" fill="url(#snapleads-icon)" opacity="0.9" />
      <path
        d="M30 32L34 28"
        stroke="url(#snapleads-icon)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
