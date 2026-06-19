"use client";

import { useEffect, useState } from "react";
import { landingColors, landingFont } from "@/lib/landing-styles";

type LeadItem = { title: string; subreddit: string };

const FALLBACK_LEADS: LeadItem[] = [
  { title: "Je cherche un outil de prospection B2B sur Reddit", subreddit: "SaaS" },
  { title: "Alternative à un SDR pour trouver des clients", subreddit: "entrepreneur" },
  { title: "Comment automatiser ma prospection sans cold email", subreddit: "startups" },
];

export default function LiveLeadTicker() {
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/landing/recent-leads");
        const data = await res.json();
        if (!cancelled && Array.isArray(data.leads) && data.leads.length > 0) {
          setLeads(data.leads);
        } else if (!cancelled) {
          setLeads(FALLBACK_LEADS);
        }
      } catch {
        if (!cancelled) setLeads(FALLBACK_LEADS);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (leads.length === 0) return;

    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % leads.length);
        setVisible(true);
      }, 300);
    }, 4000);

    return () => clearInterval(interval);
  }, [leads]);

  if (leads.length === 0) return null;

  const lead = leads[index];

  return (
    <p
      style={{
        margin: "12px 0 0",
        fontSize: "13px",
        color: landingColors.muted,
        fontFamily: landingFont,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(4px)",
        transition: "opacity 0.3s ease, transform 0.3s ease",
        minHeight: "20px",
      }}
    >
      <span style={{ marginRight: "6px" }}>🟢</span>
      Lead détecté :{" "}
      <span style={{ color: landingColors.white, fontWeight: 500 }}>{lead.title}</span>
      {" · "}
      <span style={{ color: landingColors.accent }}>r/{lead.subreddit}</span>
    </p>
  );
}
