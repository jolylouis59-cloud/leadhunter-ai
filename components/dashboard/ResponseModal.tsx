"use client";

import { useState } from "react";
import { colors, fontFamily, primaryButton } from "@/lib/dashboard-styles";

type ResponseModalProps = {
  response: string;
  leadTitle: string;
  leadId: string;
  onClose: () => void;
  onMarkResponded: (leadId: string) => Promise<void>;
};

export default function ResponseModal({
  response,
  leadTitle,
  leadId,
  onClose,
  onMarkResponded,
}: ResponseModalProps) {
  const [text, setText] = useState(response);
  const [copied, setCopied] = useState(false);
  const [marking, setMarking] = useState(false);
  const [copyHover, setCopyHover] = useState(false);
  const [markHover, setMarkHover] = useState(false);
  const [closeHover, setCloseHover] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
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
        padding: "16px",
        fontFamily,
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "600px",
          maxHeight: "90vh",
          overflowY: "auto",
          background: colors.card,
          borderRadius: "16px",
          padding: "32px",
          boxShadow: "0 25px 50px rgba(0,0,0,0.15)",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }}>
          <div>
            <p style={{ margin: 0, fontSize: "12px", fontWeight: 600, color: colors.textMuted }}>
              Post Reddit
            </p>
            <h2 style={{ fontSize: "17px", fontWeight: 700, color: colors.text, margin: "6px 0 0", lineHeight: 1.4 }}>
              {leadTitle}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            onMouseEnter={() => setCloseHover(true)}
            onMouseLeave={() => setCloseHover(false)}
            aria-label="Fermer"
            style={{
              width: "32px",
              height: "32px",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: closeHover ? colors.bg : "transparent",
              border: "none",
              borderRadius: "8px",
              color: colors.textMuted,
              fontSize: "18px",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        <label
          htmlFor="ai-response"
          style={{
            display: "block",
            marginTop: "20px",
            marginBottom: "8px",
            fontSize: "13px",
            fontWeight: 600,
            color: colors.text,
          }}
        >
          Réponse générée (modifiable)
        </label>
        <textarea
          id="ai-response"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          style={{
            width: "100%",
            boxSizing: "border-box",
            background: colors.bg,
            border: `1px solid ${colors.border}`,
            borderRadius: "8px",
            padding: "14px",
            fontSize: "14px",
            lineHeight: 1.6,
            color: colors.text,
            resize: "vertical",
            fontFamily,
            outline: "none",
          }}
        />

        <div style={{ marginTop: "20px", display: "flex", flexWrap: "wrap", gap: "10px" }}>
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
            }}
          >
            {copied ? "✅ Copié !" : "📋 Copier la réponse"}
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
            {marking ? "Enregistrement…" : "Marquer comme répondu"}
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "10px 18px",
              fontSize: "14px",
              fontWeight: 600,
              background: "transparent",
              border: `1px solid ${colors.border}`,
              borderRadius: "8px",
              cursor: "pointer",
              color: colors.textMuted,
              fontFamily,
            }}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
