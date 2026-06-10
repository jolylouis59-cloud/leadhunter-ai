export default function OctopusIcon({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <ellipse cx="16" cy="14" rx="10" ry="8" fill="#1F4D3A" />
      <circle cx="11" cy="12" r="2" fill="#0F0F0F" />
      <circle cx="21" cy="12" r="2" fill="#0F0F0F" />
      <circle cx="11.5" cy="11.5" r="0.6" fill="#ffffff" />
      <circle cx="21.5" cy="11.5" r="0.6" fill="#ffffff" />
      <path
        d="M13 16 Q16 18 19 16"
        stroke="#0F0F0F"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M7 20 C5 23 4 26 6 28 C8 26 9 23 10 21"
        stroke="#1F4D3A"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M25 20 C27 23 28 26 26 28 C24 26 23 23 22 21"
        stroke="#1F4D3A"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M9 22 C8 25 7 28 9 30"
        stroke="#166534"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M23 22 C24 25 25 28 23 30"
        stroke="#166534"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M14 24 C13 27 13 29 15 30"
        stroke="#166534"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M18 24 C19 27 19 29 17 30"
        stroke="#166534"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
