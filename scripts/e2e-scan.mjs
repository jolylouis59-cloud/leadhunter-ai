/**
 * E2E test: signup → scan → verify leads in dashboard
 * Usage: node scripts/e2e-scan.mjs [port]
 */
import { chromium } from "playwright";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const port = process.argv[2] || "3002";
const baseUrl = `http://localhost:${port}`;

const envPath = resolve(__dirname, "../.env.local");
const env = Object.fromEntries(
  readFileSync(envPath, "utf8")
    .split("\n")
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i), l.slice(i + 1)];
    })
);

const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || "";

function log(step, msg) {
  console.log(`[${step}] ${msg}`);
}

async function main() {
  if (!anonKey || !supabaseUrl) {
    console.error(
      "FAIL: NEXT_PUBLIC_SUPABASE_ANON_KEY ou NEXT_PUBLIC_SUPABASE_URL manquant dans .env.local."
    );
    process.exit(1);
  }

  const email = `e2e-${Date.now()}@leadhunter-test.local`;
  const password = "E2eTestPass123!";

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const consoleLogs = [];
  page.on("console", (msg) => {
    const text = msg.text();
    if (
      text.includes("USER ID:") ||
      text.includes("LEADS DATA:") ||
      text.includes("LEADS ERROR:") ||
      text.includes("SCAN USER ID:")
    ) {
      consoleLogs.push(text);
    }
  });

  try {
    log("1", `Signup ${email} sur ${baseUrl}/login`);
    await page.goto(`${baseUrl}/login`, { waitUntil: "domcontentloaded" });

    await page.getByRole("button", { name: "Créer un compte" }).click();
    await page.locator("#email").fill(email);
    await page.locator("#password").fill(password);
    await page.locator('form button[type="submit"]').click();

    await page.waitForURL(/\/(dashboard|pricing)/, { timeout: 15000 }).catch(() => null);

    if (page.url().includes("/pricing")) {
      await page.goto(`${baseUrl}/dashboard`, { waitUntil: "domcontentloaded" });
    }

    if (!page.url().includes("/dashboard")) {
      const err = await page.locator("text=/erreur|error|vérifie/i").first().textContent().catch(() => "");
      throw new Error(`Signup échoué — URL: ${page.url()} ${err}`);
    }

    log("2", "Dashboard chargé — clic Scanner Reddit");
    const scanBtn = page.getByRole("button", { name: /Scanner Reddit/i });
    await scanBtn.click();

    log("3", "Attente fin du scan (max 60s)…");
    await page
      .getByText(/nouveaux leads trouvés|Aucun nouveau lead/i)
      .waitFor({ timeout: 60000 });

    await page.waitForTimeout(2000);

    log("4", "Vérification affichage leads…");
    const statTotal = page.locator("text=Total leads").locator("..").locator("p").first();
    const totalText = await statTotal.textContent();
    const total = parseInt(totalText || "0", 10);

    const leadCards = page.locator('button:has-text("Générer réponse IA")');
    const cardCount = await leadCards.count();

    log("5", `Stats Total leads: ${total}, LeadCards: ${cardCount}`);
    consoleLogs.forEach((l) => console.log("  browser:", l));

    if (total === 0 && cardCount === 0) {
      const empty = await page.getByText("Aucun lead pour l'instant").isVisible();
      throw new Error(
        `Aucun lead affiché après scan (empty state: ${empty}). Vérifie les logs browser ci-dessus.`
      );
    }

    if (cardCount === 0) {
      throw new Error(`Total=${total} mais aucune LeadCard rendue (filtres actifs ?)`);
    }

    console.log("\n✅ SUCCESS: fetchLeads + LeadCards OK après scan");
    console.log(`   Email test: ${email}`);
    console.log(`   Leads affichés: ${cardCount} carte(s), stat total: ${total}`);
  } catch (err) {
    console.error("\n❌ FAIL:", err.message);
    consoleLogs.forEach((l) => console.log("  browser:", l));
    await page.screenshot({ path: resolve(__dirname, "../e2e-fail.png") }).catch(() => null);
    console.log("Screenshot: e2e-fail.png");
    process.exit(1);
  } finally {
    await browser.close();
  }
}

main();
