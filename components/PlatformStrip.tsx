const PLATFORMS = [
  { id: "reddit", label: "Reddit", color: "#FF4500" },
  { id: "x", label: "X", color: "#2B2B2B" },
  { id: "linkedin", label: "LinkedIn", color: "#0A66C2" },
] as const;

function RedditLogo() {
  return (
    <svg
      width={28}
      height={28}
      viewBox="0 0 24 24"
      fill="#FF4500"
      aria-hidden
      style={{ flexShrink: 0 }}
    >
      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.03 4.87-6.77 4.87-3.74 0-6.77-2.176-6.77-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.85-3.994 2.59.544a1.25 1.25 0 0 1 1.249-1.25z" />
    </svg>
  );
}

function XLogo() {
  return (
    <svg
      width={22}
      height={22}
      viewBox="0 0 24 24"
      fill="#2B2B2B"
      aria-hidden
      style={{ flexShrink: 0 }}
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInLogo() {
  return (
    <svg
      width={26}
      height={26}
      viewBox="0 0 24 24"
      fill="#0A66C2"
      aria-hidden
      style={{ flexShrink: 0 }}
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function PlatformItem({ id, label }: { id: string; label: string }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "10px",
        padding: "0 32px",
        flexShrink: 0,
      }}
    >
      {id === "reddit" && <RedditLogo />}
      {id === "x" && <XLogo />}
      {id === "linkedin" && <LinkedInLogo />}
      <span
        style={{
          fontSize: "15px",
          fontWeight: 700,
          color: "#2B2B2B",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
    </div>
  );
}

export default function PlatformStrip() {
  const sequence = [...PLATFORMS, ...PLATFORMS, ...PLATFORMS];

  return (
    <section
      style={{
        background: "#F3EDE2",
        padding: "40px 0",
        overflow: "hidden",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <style>{`
        @keyframes platformMarquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333333%); }
        }
        .platform-marquee-track {
          display: flex;
          width: max-content;
          animation: platformMarquee 30s linear infinite;
          will-change: transform;
        }
      `}</style>

      <p
        style={{
          textAlign: "center",
          fontSize: "13px",
          fontWeight: 600,
          color: "#6B7280",
          margin: "0 0 24px",
          padding: "0 24px",
        }}
      >
        Scanne en temps réel sur :
      </p>

      <div style={{ overflow: "hidden", width: "100%" }}>
        <div className="platform-marquee-track">
          {sequence.map((platform, i) => (
            <PlatformItem key={`${platform.id}-${i}`} id={platform.id} label={platform.label} />
          ))}
        </div>
      </div>
    </section>
  );
}
