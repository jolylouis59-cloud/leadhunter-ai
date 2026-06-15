"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { colors, fontFamily } from "@/lib/dashboard-styles";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputStyle: React.CSSProperties = {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 14px",
    fontSize: "14px",
    color: colors.text,
    background: colors.card,
    border: `1px solid ${colors.border}`,
    borderRadius: "8px",
    outline: "none",
    fontFamily,
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "13px",
    fontWeight: 600,
    color: colors.text,
    marginBottom: "8px",
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Erreur lors de l'envoi");
        return;
      }

      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur réseau");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: colors.bg,
        fontFamily,
        padding: "48px 24px 80px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ maxWidth: "520px", margin: "0 auto" }}>
        <Link
          href="/"
          style={{
            fontSize: "14px",
            fontWeight: 600,
            color: colors.accent,
            textDecoration: "none",
          }}
        >
          ← Retour à l&apos;accueil
        </Link>

        <h1
          style={{
            margin: "24px 0 8px",
            fontSize: "32px",
            fontWeight: 800,
            color: colors.text,
            letterSpacing: "-0.02em",
          }}
        >
          Contact
        </h1>
        <p style={{ margin: "0 0 8px", fontSize: "14px", color: colors.textMuted, lineHeight: 1.6 }}>
          Une question ? Écris-nous à{" "}
          <a href="mailto:contact@leadhunterai.fr" style={{ color: colors.accent }}>
            contact@leadhunterai.fr
          </a>
        </p>
        <p style={{ margin: "0 0 32px", fontSize: "13px", color: colors.textMuted }}>
          Réponse sous 24h.
        </p>

        <div
          style={{
            background: colors.card,
            border: `1px solid ${colors.border}`,
            borderRadius: "12px",
            padding: "32px 28px",
          }}
        >
          {sent ? (
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <p style={{ margin: 0, fontSize: "40px" }}>✉️</p>
              <p
                style={{
                  margin: "16px 0 0",
                  fontSize: "18px",
                  fontWeight: 700,
                  color: colors.text,
                }}
              >
                Message envoyé !
              </p>
              <p style={{ margin: "8px 0 0", fontSize: "14px", color: colors.textMuted }}>
                On te répond sous 24h.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "16px" }}>
                <label htmlFor="name" style={labelStyle}>
                  Nom
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label htmlFor="email" style={labelStyle}>
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label htmlFor="message" style={labelStyle}>
                  Message
                </label>
                <textarea
                  id="message"
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }}
                />
              </div>

              {error && (
                <p style={{ margin: "0 0 12px", fontSize: "13px", color: "#DC2626" }}>{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "12px 20px",
                  background: colors.accent,
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: loading ? "wait" : "pointer",
                  opacity: loading ? 0.7 : 1,
                  fontFamily,
                }}
              >
                {loading ? "Envoi…" : "Envoyer"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
