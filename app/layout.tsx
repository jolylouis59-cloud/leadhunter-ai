import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "LeadHunter AI — Trouve tes clients B2B",
  description:
    "Scanne Reddit, X et LinkedIn. Score l'intention d'achat. Génère une réponse prête à envoyer.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={jakarta.variable}>
      <body className="bg-white font-sans text-brand-text antialiased">
        {children}
      </body>
    </html>
  );
}
