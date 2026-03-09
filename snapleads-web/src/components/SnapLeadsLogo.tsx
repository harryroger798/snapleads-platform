interface SnapLeadsLogoProps {
  size?: number;
  className?: string;
}

export default function SnapLeadsLogo({ size = 40, className = "" }: SnapLeadsLogoProps) {
  return (
    <img
      src="/images/logo.png"
      alt="SnapLeads"
      width={size}
      height={size}
      className={`rounded-lg ${className}`}
    />
  );
}
