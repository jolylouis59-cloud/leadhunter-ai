"use client";

import { useState } from "react";
import { colors, fontFamily, primaryButton } from "@/lib/dashboard-styles";

type ResponseModalProps = {
  response: string;
  leadId: string;
  onClose: () => void;
  onMarkResponded: (leadId: string) => Promise<void>;
};

export default function ResponseModal({
  response,
  leadId,
  onClose,
  onMarkResponded,
}: ResponseModalProps) {
  const [copied, setCopied] = useState(false);
  const [marking, setMarking] = useState(false);
  const [copyHover, setCopyHover] = useState(false);
  const [markHover, setMarkHover] = useState(false);
  const [closeHover, setCloseHover] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleMarkResponded() {
    setMarking(true);
    await onMarkResponded(leadId);
    setMarking(false);
    onClose();
  }

  return (
    <div
      role="presentation"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        padding: "16px",
        fontFamily,
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "600px",
          background: colors.card,
          borderRadius: "16px",
          padding: "32px",
          boxShadow: "0 25px 50px rgba(0,0,0,0.15)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2
            id="modal-title"
            style={{ fontSize: "18px", fontWeight: 700, color: colors.text, margin: 0 }}
          >
            ✨ Réponse générée
          </h2>
          <button
            type="button"
            onClick={onClose}
            onMouseEnter={() => setCloseHover(true)}
            onMouseLeave={() => setCloseHover(false)}
            aria-label="Fermer"
            style={{
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: closeHover ? colors.bg : "transparent",
              border: "none",
              borderRadius: "8px",
              color: colors.textMuted,
              fontSize: "18px",
              cursor: "pointer",
              transition: "background 150ms ease",
            }}
          >
            ✕
          </button>
        </div>

        <div
          style={{
            marginTop: "20px",
            background: colors.bg,
            borderRadius: "8px",
            padding: "16px",
          }}
        >
          <p
            style={{
              margin: 0,
              whiteSpace: "pre-wrap",
              fontSize: "14px",
              lineHeight: 1.6,
              color: colors.text,
            }}
          >
            {response}
          </p>
        </div>

        <div style={{ marginTop: "24px", display: "flex", flexWrap: "wrap", gap: "10px" }}>
          <button
            type="button"
            onClick={handleCopy}
            onMouseEnter={() => setCopyHover(true)}
            onMouseLeave={() => setCopyHover(false)}
            style={{
              background: copyHover ? "#F9FAFB" : colors.card,
              color: colors.text,
              borderRadius: "8px",
              padding: "10px 18px",
              fontSize: "14px",
              fontWeight: 600,
              border: `1px solid ${colors.border}`,
              cursor: "pointer",
              transition: "background 150ms ease",
            }}
          >
            {copied ? "✅ Copié !" : "📋 Copier"}
          </button>
          <button
            type="button"
            onClick={handleMarkResponded}
            disabled={marking}
            onMouseEnter={() => setMarkHover(true)}
            onMouseLeave={() => setMarkHover(false)}
            style={{
              ...primaryButton(markHover, marking),
              padding: "10px 18px",
              fontSize: "14px",
              fontWeight: 600,
              fontFamily,
            }}
          >
            {marking ? "Enregistrement…" : "✅ Marquer répondu"}
          </button>
        </div>
      </div>
    </div>
  );
}
