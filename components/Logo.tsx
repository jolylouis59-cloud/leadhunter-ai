type LogoProps = {
  size?: number;
  showText?: boolean;
};

export default function Logo({ size = 32, showText = true }: LogoProps) {
  return (
    <div className="flex items-center gap-2.5">
      <img
        src="/logo.png"
        alt="LeadHunter AI"
        width={size}
        height={size}
        style={{ borderRadius: "8px", flexShrink: 0, background: "transparent" }}
      />
      {showText && (
        <span className="text-base font-bold text-brand-text">LeadHunter AI</span>
      )}
    </div>
  );
}
