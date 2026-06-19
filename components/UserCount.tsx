"use client";

import { useEffect, useState } from "react";
import { landingColors, landingFont } from "@/lib/landing-styles";

const START_COUNT = 337;
const END_COUNT = 341;

export default function UserCount() {
  const [count, setCount] = useState(START_COUNT);

  useEffect(() => {
    const duration = 2000;
    const startTime = performance.now();

    function tick(now: number) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(START_COUNT + (END_COUNT - START_COUNT) * eased));
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((c) => c + 1);
    }, 47000);
    return () => clearInterval(interval);
  }, []);

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
        {count.toLocaleString("fr-FR")}
      </span>{" "}
      entrepreneurs
    </p>
  );
}
