export default function EduvaLogo({
  className = "w-8 h-8",
  size,
  variant = "badge", // 'badge' | 'flat'
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
    >
      {variant === "badge" && (
        <>
          {/* Rounded Squircle Container */}
          <rect width="64" height="64" rx="16" fill="#253D2C" />
          <rect
            x="2"
            y="2"
            width="60"
            height="60"
            rx="14"
            stroke="#68BA7F"
            strokeWidth="1.5"
            strokeOpacity="0.4"
          />
          {/* Soft Mint Ambient Glow */}
          <circle cx="32" cy="32" r="22" fill="#CFFFDC" fillOpacity="0.1" />
        </>
      )}

      {/* ── Open Academic Book Base ── */}
      {/* Lower Book Shadow/Thickness */}
      <path
        d="M32 49C25 45 18 45 10 47.5L12 43C19 41 25.5 41 32 45C38.5 41 45 41 52 43L54 47.5C46 45 39 45 32 49Z"
        fill="#2E6F40"
      />

      {/* Main Book Pages */}
      <path
        d="M32 44.5C24 40.5 17 40.5 9 43.5C8.5 39.5 10 35 12 33C19 31 25 32 32 36C39 32 45 31 52 33C54 35 55.5 39.5 55 43.5C47 40.5 40 40.5 32 44.5Z"
        fill="#2E6F40"
      />

      {/* Page Inset Accents (Soft Mint #CFFFDC) */}
      <path
        d="M13 36C19 33.5 25 34.5 31 38"
        stroke="#CFFFDC"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M51 36C45 33.5 39 34.5 33 38"
        stroke="#CFFFDC"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M14 40C19 38 25 38.8 30.5 41.5"
        stroke="#68BA7F"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeOpacity="0.7"
      />
      <path
        d="M50 40C45 38 39 38.8 33.5 41.5"
        stroke="#68BA7F"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeOpacity="0.7"
      />

      {/* ── Central Sprout & Growth Leaves ── */}
      {/* Central Stem */}
      <path
        d="M32 41V25"
        stroke="#CFFFDC"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Primary Right Leaf (Upward Growth) */}
      <path
        d="M32 28C32 20 42 15 44 14C45 18 43 28 32 28Z"
        fill="#68BA7F"
      />
      <path
        d="M32 28C36 24 39.5 20.5 42 16.5"
        stroke="#CFFFDC"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeOpacity="0.8"
      />

      {/* Secondary Left Leaf */}
      <path
        d="M32 32C32 26 24 21 21 21C20.5 24.5 23 32 32 32Z"
        fill="#CFFFDC"
      />
      <path
        d="M32 32C28.5 29 25.5 26 23 23"
        stroke="#2E6F40"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeOpacity="0.6"
      />
    </svg>
  );
}
