"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { cardBase, colors, fontFamily, primaryButton } from "@/lib/dashboard-styles";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Step = "profile" | "review";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("profile");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [painPoint, setPainPoint] = useState("");
  const [competitors, setCompetitors] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [targetPricing, setTargetPricing] = useState("");

  const [keywords, setKeywords] = useState<string[]>([]);
  const [subreddits, setSubreddits] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [subredditInput, setSubredditInput] = useState("");

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("user_configs")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        setProductName(data.product_name ?? "");
        setProductDescription(data.product_description ?? "");
        setTargetAudience(data.target_audience ?? data.target ?? "");
        setPainPoint(data.pain_point ?? "");
        setCompetitors(data.competitors ?? "");
        setWebsiteUrl(data.website_url ?? "");
        setTargetPricing(data.target_pricing ?? "");
        if (data.keywords?.length) setKeywords(data.keywords);
        if (data.subreddits?.length) setSubreddits(data.subreddits);
        if (data.onboarding_completed && data.keywords?.length) {
          setStep("review");
        }
      }
      setLoading(false);
    }
    load();
  }, []);

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "13px",
    fontWeight: 600,
    color: colors.text,
    marginBottom: "8px",
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

  const textareaStyle: React.CSSProperties = {
    ...inputStyle,
    minHeight: step === "profile" && productDescription === "" ? "120px" : "96px",
    resize: "vertical",
    lineHeight: 1.5,
  };

  const largeTextareaStyle: React.CSSProperties = {
    ...textareaStyle,
    minHeight: "140px",
  };

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }

  function getProfilePayload() {
    return {
      productName: productName.trim(),
      productDescription: productDescription.trim(),
      targetAudience: targetAudience.trim(),
      painPoint: painPoint.trim(),
      competitors: competitors.trim() || undefined,
      websiteUrl: websiteUrl.trim() || undefined,
      targetPricing: targetPricing.trim() || undefined,
    };
  }

  async function handleGenerate() {
    const profile = getProfilePayload();
    if (!profile.productName || !profile.productDescription) {
      showToast("Remplis au minimum le nom et la description du produit.");
      return;
    }
    if (!profile.targetAudience || !profile.painPoint) {
      showToast("Remplis la cible et la douleur principale.");
      return;
    }

    setGenerating(true);
    try {
      const res = await fetch("/api/onboarding/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Erreur lors de la génération");
        return;
      }
      setKeywords(data.keywords ?? []);
      setSubreddits(data.subreddits ?? []);
      setStep("review");
      showToast("Mots-clés et subreddits générés ✓");
    } catch {
      showToast("Erreur réseau lors de la génération");
    } finally {
      setGenerating(false);
    }
  }

  async function handleSave() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    if (keywords.length === 0 || subreddits.length === 0) {
      showToast("Ajoute au moins un mot-clé et un subreddit.");
      return;
    }

    setSaving(true);
    const profile = getProfilePayload();

    const { error } = await supabase.from("user_configs").upsert(
      {
        user_id: user.id,
        product_name: profile.productName,
        product_description: profile.productDescription,
        target: profile.targetAudience,
        target_audience: profile.targetAudience,
        pain_point: profile.painPoint,
        competitors: profile.competitors || null,
        website_url: profile.websiteUrl || null,
        target_pricing: profile.targetPricing || null,
        keywords,
        subreddits,
        onboarding_completed: true,
      },
      { onConflict: "user_id" }
    );

    setSaving(false);

    if (error) {
      showToast("Erreur : " + error.message);
      return;
    }

    showToast("Profil sauvegardé ✓");
    router.push("/dashboard");
    router.refresh();
  }

  function addKeyword() {
    const value = keywordInput.trim();
    if (!value || keywords.includes(value)) return;
    setKeywords((prev) => [...prev, value]);
    setKeywordInput("");
  }

  function addSubreddit() {
    const value = subredditInput.trim().replace(/^r\//, "");
    if (!value || subreddits.includes(value)) return;
    setSubreddits((prev) => [...prev, value]);
    setSubredditInput("");
  }

  function renderBadges(items: string[], onRemove: (item: string) => void) {
    if (items.length === 0) return null;
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "12px" }}>
        {items.map((item) => (
          <span
            key={item}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              background: colors.oatmeal,
              border: `1px solid ${colors.border}`,
              borderRadius: "20px",
              fontSize: "13px",
              color: colors.text,
            }}
          >
            {item}
            <button
              type="button"
              onClick={() => onRemove(item)}
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                padding: 0,
                fontSize: "14px",
                color: colors.textMuted,
                lineHeight: 1,
              }}
              aria-label={`Retirer ${item}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ fontFamily, color: colors.textMuted, padding: "48px 0", textAlign: "center" }}>
        Chargement…
      </div>
    );
  }

  return (
    <div style={{ fontFamily, maxWidth: "720px", margin: "0 auto", width: "100%" }}>
      <header style={{ marginBottom: isMobile ? "24px" : "32px" }}>
        <Link
          href="/dashboard/settings"
          style={{
            fontSize: "13px",
            color: colors.accent,
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          ← Retour aux paramètres
        </Link>
        <h1
          style={{
            fontSize: isMobile ? "24px" : "28px",
            fontWeight: 700,
            color: colors.text,
            margin: "12px 0 0",
          }}
        >
          Profil client & scanner Reddit
        </h1>
        <p style={{ margin: "8px 0 0", fontSize: "13px", color: colors.textMuted, lineHeight: 1.5 }}>
          * Tu peux demander à une IA (ChatGPT, Claude...) de t&apos;aider à rédiger ces réponses si
          tu manques d&apos;inspiration — copie-colle simplement ce qu&apos;elle te propose.
        </p>
      </header>

      {step === "profile" && (
        <div style={{ ...cardBase, padding: isMobile ? "20px" : "28px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <label htmlFor="productName" style={labelStyle}>
                Nom du produit / service
              </label>
              <input
                id="productName"
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Ex: LeadHunter AI"
                style={inputStyle}
              />
            </div>

            <div>
              <label htmlFor="productDescription" style={labelStyle}>
                Description complète
              </label>
              <textarea
                id="productDescription"
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
                placeholder="Ce que fait ton produit, quel problème il résout, en quoi il est différent…"
                style={largeTextareaStyle}
              />
            </div>

            <div>
              <label htmlFor="targetAudience" style={labelStyle}>
                Cible précise
              </label>
              <textarea
                id="targetAudience"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="Rôle, taille d'entreprise, secteur… Ex: Fondateurs SaaS B2B, 1-10 employés, marketing/growth"
                style={textareaStyle}
              />
            </div>

            <div>
              <label htmlFor="painPoint" style={labelStyle}>
                Douleur principale
              </label>
              <textarea
                id="painPoint"
                value={painPoint}
                onChange={(e) => setPainPoint(e.target.value)}
                placeholder="Ce qu'ils tapent quand ils galèrent… Ex: « comment trouver des clients B2B », « outil prospection Reddit »"
                style={textareaStyle}
              />
            </div>

            <div>
              <label htmlFor="competitors" style={labelStyle}>
                Concurrents connus <span style={{ fontWeight: 400, color: colors.textMuted }}>(optionnel)</span>
              </label>
              <input
                id="competitors"
                type="text"
                value={competitors}
                onChange={(e) => setCompetitors(e.target.value)}
                placeholder="Ex: Octolens, Brand24, Mention"
                style={inputStyle}
              />
            </div>

            <div>
              <label htmlFor="websiteUrl" style={labelStyle}>
                Site web du produit <span style={{ fontWeight: 400, color: colors.textMuted }}>(optionnel)</span>
              </label>
              <input
                id="websiteUrl"
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://tonproduit.com"
                style={inputStyle}
              />
            </div>

            <div>
              <label htmlFor="targetPricing" style={labelStyle}>
                Budget / pricing cible des prospects{" "}
                <span style={{ fontWeight: 400, color: colors.textMuted }}>(optionnel)</span>
              </label>
              <input
                id="targetPricing"
                type="text"
                value={targetPricing}
                onChange={(e) => setTargetPricing(e.target.value)}
                placeholder="Ex: 50-200€/mois, PME avec budget marketing 500€+"
                style={inputStyle}
              />
            </div>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating}
              style={{
                ...primaryButton(false, generating),
                width: "100%",
                padding: "14px 24px",
                fontSize: "15px",
                fontWeight: 600,
                fontFamily,
                marginTop: "8px",
              }}
            >
              {generating ? "Génération en cours…" : "Générer mots-clés & subreddits avec l'IA →"}
            </button>
          </div>
        </div>
      )}

      {step === "review" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ ...cardBase, padding: isMobile ? "20px" : "28px" }}>
            <p style={{ margin: "0 0 4px", fontSize: "16px", fontWeight: 700, color: colors.text }}>
              Résultat généré par l&apos;IA
            </p>
            <p style={{ margin: "0 0 20px", fontSize: "13px", color: colors.textMuted }}>
              Ajuste les mots-clés et subreddits avant de sauvegarder. Le scanner Reddit utilisera
              cette configuration.
            </p>

            <div style={{ marginBottom: "24px" }}>
              <label style={labelStyle}>Mots-clés Reddit ({keywords.length})</label>
              <div
                style={{
                  display: "flex",
                  flexDirection: isMobile ? "column" : "row",
                  gap: "10px",
                }}
              >
                <input
                  type="text"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addKeyword();
                    }
                  }}
                  placeholder="Ajouter un mot-clé…"
                  style={inputStyle}
                />
                <button
                  type="button"
                  onClick={addKeyword}
                  style={{
                    padding: "12px 18px",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: colors.accent,
                    background: colors.card,
                    border: `1px solid ${colors.accent}`,
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontFamily,
                    flexShrink: 0,
                  }}
                >
                  Ajouter
                </button>
              </div>
              {renderBadges(keywords, (item) =>
                setKeywords((prev) => prev.filter((k) => k !== item))
              )}
            </div>

            <div>
              <label style={labelStyle}>Subreddits ({subreddits.length})</label>
              <div
                style={{
                  display: "flex",
                  flexDirection: isMobile ? "column" : "row",
                  gap: "10px",
                }}
              >
                <input
                  type="text"
                  value={subredditInput}
                  onChange={(e) => setSubredditInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSubreddit();
                    }
                  }}
                  placeholder="Ex: SaaS"
                  style={inputStyle}
                />
                <button
                  type="button"
                  onClick={addSubreddit}
                  style={{
                    padding: "12px 18px",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: colors.accent,
                    background: colors.card,
                    border: `1px solid ${colors.accent}`,
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontFamily,
                    flexShrink: 0,
                  }}
                >
                  Ajouter
                </button>
              </div>
              {renderBadges(subreddits, (item) =>
                setSubreddits((prev) => prev.filter((s) => s !== item))
              )}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              gap: "12px",
            }}
          >
            <button
              type="button"
              onClick={() => setStep("profile")}
              style={{
                flex: 1,
                padding: "12px 20px",
                fontSize: "14px",
                fontWeight: 600,
                color: colors.text,
                background: colors.card,
                border: `1px solid ${colors.border}`,
                borderRadius: "10px",
                cursor: "pointer",
                fontFamily,
              }}
            >
              ← Modifier le profil
            </button>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating}
              style={{
                flex: 1,
                padding: "12px 20px",
                fontSize: "14px",
                fontWeight: 600,
                color: colors.accent,
                background: colors.card,
                border: `1px solid ${colors.accent}`,
                borderRadius: "10px",
                cursor: generating ? "wait" : "pointer",
                fontFamily,
              }}
            >
              {generating ? "Régénération…" : "Régénérer avec l'IA"}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              style={{
                ...primaryButton(false, saving),
                flex: 1,
                padding: "12px 20px",
                fontSize: "14px",
                fontWeight: 600,
                fontFamily,
              }}
            >
              {saving ? "Sauvegarde…" : "Sauvegarder & lancer le scan"}
            </button>
          </div>
        </div>
      )}

      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            left: isMobile ? 24 : "auto",
            background: colors.text,
            color: "#fff",
            padding: "14px 20px",
            borderRadius: "10px",
            fontSize: "14px",
            fontWeight: 500,
            boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
            zIndex: 100,
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
