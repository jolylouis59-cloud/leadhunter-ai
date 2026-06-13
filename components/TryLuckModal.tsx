"use client";

import { FormEvent, useEffect, useState } from "react";
import { colors, fontFamily } from "@/lib/dashboard-styles";

type TryLuckModalProps = {
  open: boolean;
  onClose: () => void;
};

const SOURCE_OPTIONS = [
  "LinkedIn",
  "Reddit",
  "Bouche à oreille",
  "Google",
  "Autre",
] as const;

const PROBLEM_OPTIONS = [
  "Je ne sais pas où trouver des prospects qualifiés",
  "J'ai pas le temps de chercher manuellement",
  "Mes messages ne convertissent pas",
  "Je manque de volume de leads",
  "Autre",
] as const;

export default function TryLuckModal({ open, onClose }: TryLuckModalProps) {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [source, setSource] = useState("");
  const [sourceOther, setSourceOther] = useState("");
  const [problem, setProblem] = useState("");
  const [problemOther, setProblemOther] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function resetForm() {
    setStep(1);
    setSubmitted(false);
    setLoading(false);
    setError(null);
    setSource("");
    setSourceOther("");
    setProblem("");
    setProblemOther("");
    setName("");
    setEmail("");
    setPhone("");
    setConsent(false);
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  function canGoNext(): boolean {
    if (step === 1) {
      if (!source) return false;
      if (source === "Autre" && !sourceOther.trim()) return false;
      return true;
    }
    if (step === 2) {
      if (!problem) return false;
      if (problem === "Autre" && !problemOther.trim()) return false;
      return true;
    }
    return true;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !consent) {
      setError("Remplis tous les champs obligatoires et accepte d'être contacté.");
      return;
    }

    setLoading(true);
    setError(null);

    const resolvedSource = source === "Autre" ? sourceOther.trim() : source;
    const resolvedProblem = problem === "Autre" ? problemOther.trim() : problem;

    try {
      const res = await fetch("/api/try-luck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: resolvedSource,
          problem: resolvedProblem,
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || null,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Erreur lors de l'envoi. Réessaie plus tard.");
        return;
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur réseau");
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  const progress = submitted ? 100 : (step / 3) * 100;

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "13px",
    fontWeight: 600,
    color: colors.text,
    marginBottom: "10px",
  };

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

  function renderRadio(
    value: string,
    selected: string,
    onSelect: (v: string) => void,
    label: string
  ) {
    const checked = selected === value;
    return (
      <label
        key={value}
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "10px",
          padding: "12px 14px",
          borderRadius: "8px",
          border: `1px solid ${checked ? colors.accent : colors.border}`,
          background: checked ? "rgba(31,77,58,0.06)" : colors.card,
          cursor: "pointer",
          marginBottom: "8px",
        }}
      >
        <input
          type="radio"
          name={`radio-${step}`}
          checked={checked}
          onChange={() => onSelect(value)}
          style={{ marginTop: "3px", accentColor: colors.accent }}
        />
        <span style={{ fontSize: "14px", color: colors.text, lineHeight: 1.4 }}>{label}</span>
      </label>
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        boxSizing: "border-box",
      }}
    >
      <div
        onClick={handleClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(43, 43, 43, 0.65)",
        }}
      />

      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "520px",
          maxHeight: "90vh",
          overflowY: "auto",
          background: colors.card,
          borderRadius: "16px",
          padding: "28px 24px",
          fontFamily,
          boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
        }}
      >
        {!submitted && (
          <>
            <div style={{ marginBottom: "20px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <span style={{ fontSize: "12px", fontWeight: 600, color: colors.textMuted }}>
                  Étape {step}/3
                </span>
                <button
                  type="button"
                  onClick={handleClose}
                  aria-label="Fermer"
                  style={{
                    background: "transparent",
                    border: "none",
                    fontSize: "22px",
                    color: colors.textMuted,
                    cursor: "pointer",
                    lineHeight: 1,
                    padding: 0,
                  }}
                >
                  ×
                </button>
              </div>
              <div
                style={{
                  height: "6px",
                  borderRadius: "3px",
                  background: colors.border,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${progress}%`,
                    background: colors.accent,
                    borderRadius: "3px",
                    transition: "width 300ms ease",
                  }}
                />
              </div>
            </div>

            {step === 1 && (
              <div>
                <h2
                  style={{
                    margin: "0 0 16px",
                    fontSize: "18px",
                    fontWeight: 700,
                    color: colors.text,
                  }}
                >
                  Comment nous avez-vous trouvé ?
                </h2>
                {SOURCE_OPTIONS.map((opt) =>
                  renderRadio(opt, source, setSource, opt)
                )}
                {source === "Autre" && (
                  <input
                    type="text"
                    value={sourceOther}
                    onChange={(e) => setSourceOther(e.target.value)}
                    placeholder="Précisez si autre"
                    style={{ ...inputStyle, marginTop: "4px" }}
                  />
                )}
              </div>
            )}

            {step === 2 && (
              <div>
                <h2
                  style={{
                    margin: "0 0 16px",
                    fontSize: "18px",
                    fontWeight: 700,
                    color: colors.text,
                  }}
                >
                  Quel est votre plus gros problème de prospection ?
                </h2>
                {PROBLEM_OPTIONS.map((opt) =>
                  renderRadio(opt, problem, setProblem, opt)
                )}
                {problem === "Autre" && (
                  <input
                    type="text"
                    value={problemOther}
                    onChange={(e) => setProblemOther(e.target.value)}
                    placeholder="Précisez votre problème"
                    style={{ ...inputStyle, marginTop: "4px" }}
                  />
                )}
              </div>
            )}

            {step === 3 && (
              <form onSubmit={handleSubmit}>
                <h2
                  style={{
                    margin: "0 0 16px",
                    fontSize: "18px",
                    fontWeight: 700,
                    color: colors.text,
                  }}
                >
                  Vos coordonnées
                </h2>

                <label style={labelStyle}>Prénom + Nom</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jean Dupont"
                  style={{ ...inputStyle, marginBottom: "14px" }}
                />

                <label style={labelStyle}>Email *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jean@email.com"
                  style={{ ...inputStyle, marginBottom: "14px" }}
                />

                <label style={labelStyle}>Téléphone (optionnel)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+33 6 12 34 56 78"
                  style={{ ...inputStyle, marginBottom: "16px" }}
                />

                <label
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                    cursor: "pointer",
                    marginBottom: "20px",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    required
                    style={{ marginTop: "3px", accentColor: colors.accent }}
                  />
                  <span style={{ fontSize: "13px", color: colors.textMuted, lineHeight: 1.5 }}>
                    J&apos;accepte d&apos;être contacté par LeadHunter AI
                  </span>
                </label>

                {error && (
                  <p style={{ margin: "0 0 12px", fontSize: "13px", color: "#DC2626" }}>
                    {error}
                  </p>
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
                  {loading ? "Envoi…" : "Envoyer ma candidature"}
                </button>
              </form>
            )}

            {step < 3 && (
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginTop: "24px",
                }}
              >
                {step > 1 && (
                  <button
                    type="button"
                    onClick={() => setStep((s) => s - 1)}
                    style={{
                      flex: 1,
                      padding: "12px 16px",
                      background: "transparent",
                      color: colors.text,
                      border: `1px solid ${colors.border}`,
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily,
                    }}
                  >
                    Précédent
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setStep((s) => s + 1)}
                  disabled={!canGoNext()}
                  style={{
                    flex: 1,
                    padding: "12px 16px",
                    background: colors.accent,
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: canGoNext() ? "pointer" : "not-allowed",
                    opacity: canGoNext() ? 1 : 0.5,
                    fontFamily,
                  }}
                >
                  Suivant
                </button>
              </div>
            )}

            {step === 3 && (
              <button
                type="button"
                onClick={() => setStep(2)}
                style={{
                  width: "100%",
                  marginTop: "12px",
                  padding: "12px 16px",
                  background: "transparent",
                  color: colors.text,
                  border: `1px solid ${colors.border}`,
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily,
                }}
              >
                Précédent
              </button>
            )}
          </>
        )}

        {submitted && (
          <div style={{ textAlign: "center", padding: "12px 0" }}>
            <p style={{ margin: 0, fontSize: "48px" }}>🎉</p>
            <h2
              style={{
                margin: "16px 0 12px",
                fontSize: "22px",
                fontWeight: 700,
                color: colors.text,
              }}
            >
              Candidature envoyée !
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: "14px",
                color: colors.textMuted,
                lineHeight: 1.6,
              }}
            >
              On revient vers toi sous 1 à 2h. Si tu es sélectionné, tu recevras le
              code directement par email ou téléphone.
            </p>
            <button
              type="button"
              onClick={handleClose}
              style={{
                marginTop: "28px",
                padding: "12px 32px",
                background: colors.accent,
                color: "#FFFFFF",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily,
              }}
            >
              Fermer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
