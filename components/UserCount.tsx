"use client";

import { useEffect, useState } from "react";
import { landingColors, landingFont } from "@/lib/landing-styles";

export default function UserCount() {
  const [displayCount, setDisplayCount] = useState(0);
  const [target, setTarget] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/stats/user-count");
        const data = await res.json();
        if (!cancelled && typeof data.count === "number") {
          setTarget(data.count);
        }
      } catch {
        if (!cancelled) setTarget(0);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (target === null) return;

    const duration = 1000;
    const start = performance.now();

    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayCount(Math.round(target! * eased));
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }, [target]);

  if (target === null) return null;

  return (
    <p
      style={{
        margin: "16px 0 0",
        fontSize: "14px",
        color: landingColors.muted,
        fontFamily: landingFont,
      }}
    >
      Déjà{" "}
      <span style={{ fontWeight: 700, color: landingColors.white }}>
        {displayCount.toLocaleString("fr-FR")}
      </span>{" "}
      entrepreneurs
    </p>
  );
}
