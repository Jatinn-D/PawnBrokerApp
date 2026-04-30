export default function VaultaLogo({ size = 32, color = "var(--color-navy)" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="4" y="6" width="32" height="28" stroke={color} strokeWidth="2" />
      <circle cx="20" cy="20" r="8" stroke={color} strokeWidth="1.5" />
      <circle cx="20" cy="20" r="3" stroke={color} strokeWidth="1.5" />
      <line x1="20" y1="12" x2="20" y2="6" stroke={color} strokeWidth="1.5" />
      <line x1="20" y1="28" x2="20" y2="34" stroke={color} strokeWidth="1.5" />
      <line x1="12" y1="20" x2="6" y2="20" stroke={color} strokeWidth="1.5" />
      <line x1="28" y1="20" x2="36" y2="20" stroke={color} strokeWidth="1.5" />
      <line
        x1="14.34"
        y1="14.34"
        x2="10.1"
        y2="10.1"
        stroke={color}
        strokeWidth="1.5"
      />
      <line
        x1="25.66"
        y1="25.66"
        x2="29.9"
        y2="29.9"
        stroke={color}
        strokeWidth="1.5"
      />
      <line
        x1="25.66"
        y1="14.34"
        x2="29.9"
        y2="10.1"
        stroke={color}
        strokeWidth="1.5"
      />
      <line
        x1="14.34"
        y1="25.66"
        x2="10.1"
        y2="29.9"
        stroke={color}
        strokeWidth="1.5"
      />
      <rect x="32" y="18" width="4" height="4" fill={color} />
    </svg>
  );
}
