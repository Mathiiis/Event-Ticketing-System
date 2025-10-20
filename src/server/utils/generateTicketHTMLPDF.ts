import fs from "fs";
import path from "path";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

export async function generateTicketPDF({
  name,
  eventName,
  date,
  location,
  code,
  ticketNumber,
  maxTickets,
  qrCodeBase64,
  logoUrl,
  info,
}: {
  name: string;
  eventName: string;
  date: string;
  location: string;
  code: string;
  ticketNumber?: number;
  maxTickets?: number;
  qrCodeBase64: string;
  logoUrl?: string;
  info?: string;
}) {
  // Lecture du template HTML
  const templatePath = path.resolve("src/server/templates/ticket.html");
  let html = fs.readFileSync(templatePath, "utf8");

  // Gestion du logo (local → base64)
  let logoFinal = logoUrl;
  if (logoUrl && logoUrl.startsWith("/")) {
    const logoPath = path.resolve("public", logoUrl.replace("/", ""));
    if (fs.existsSync(logoPath)) {
      const base64 = fs.readFileSync(logoPath, "base64");
      logoFinal = `data:image/png;base64,${base64}`;
    } else {
      console.warn("⚠️ Logo introuvable :", logoPath);
    }
  }

  // Remplacement des variables
  html = html
    .replace(/{{eventName}}/g, eventName)
    .replace(/{{participantName}}/g, name)
    .replace(/{{eventDate}}/g, date)
    .replace(/{{eventLocation}}/g, location)
    .replace(/{{ticketCode}}/g, code)
    .replace(/{{qrCodeBase64}}/g, qrCodeBase64)
    .replace(/{{logoUrl}}/g, logoFinal || "")
    .replace(/{{info}}/g, info || "")
    .replace(/{{ticketNumber}}/g, ticketNumber?.toString() ?? "")
    .replace(/{{maxTickets}}/g, maxTickets?.toString() ?? "");

  console.log("🧾 Aperçu HTML :", html.slice(0, 300)); // ← debug temporaire

  // Environnement d’exécution
  const isRunningOnVercel = !!process.env.VERCEL || !!process.env.AWS_REGION;

  const executablePath = isRunningOnVercel
    ? await chromium.executablePath()
    : process.platform === "win32"
    ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
    : "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

  const launchOptions = {
    args: [
      ...chromium.args,
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--single-process",
      "--no-zygote",
    ],
    executablePath,
    headless: true,
    ignoreHTTPSErrors: true,
  };

  let browser;
  try {
    browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();

    // Attente du chargement complet (images incluses)
    await page.setContent(html, { waitUntil: ["networkidle0", "domcontentloaded"] });

    // Vérifie dans la page que le logo est bien chargé
    const hasLogo = await page.$eval("img", (img) => !!img.getAttribute("src"));
    console.log("✅ Logo détecté dans la page :", hasLogo);

    // Génération du PDF
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0", bottom: "0", left: "0", right: "0" },
    });

    return pdfBuffer;
  } catch (error) {
    console.error("❌ Erreur Puppeteer :", error);
    throw new Error("Erreur lors de la génération du PDF : " + (error as Error).message);
  } finally {
    if (browser) await browser.close().catch(() => null);
  }
}
