export default function Logo({ size = 28 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2.5">
      <svg
        viewBox="0 0 40 40"
        width={size}
        height={size}
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        <ellipse cx="20" cy="20" rx="12" ry="10" fill="#22c55e" />
        <circle cx="14" cy="16" r="2.5" fill="#2B2B2B" />
        <circle cx="26" cy="16" r="2.5" fill="#2B2B2B" />
        <path d="M8 24 C6 28 4 32 6 36 C8 34 10 30 12 28" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M32 24 C34 28 36 32 34 36 C32 34 30 30 28 28" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M10 26 C8 30 6 34 8 38" stroke="#15803d" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <path d="M30 26 C32 30 34 34 32 38" stroke="#15803d" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      </svg>
      <span className="text-base font-bold text-brand-text">LeadHunter AI</span>
    </div>
  );
}
