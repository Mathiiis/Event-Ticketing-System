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
  eventLogoUrl,
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
  eventLogoUrl?: string;
  info?: string;
}) {
  const templatePath = path.resolve("src/server/templates/ticket.html");
  let html = fs.readFileSync(templatePath, "utf8");

  html = html
    .replace(/{{eventName}}/g, eventName)
    .replace(/{{participantName}}/g, name)
    .replace(/{{eventDate}}/g, date)
    .replace(/{{eventLocation}}/g, location)
    .replace(/{{ticketCode}}/g, code)
    .replace(/{{qrCodeBase64}}/g, qrCodeBase64)
    .replace(/{{eventLogoUrl}}/g, eventLogoUrl || "")
    .replace(/{{info}}/g, info || "")
    .replace(/{{ticketNumber}}/g, ticketNumber?.toString() ?? "")
    .replace(/{{maxTickets}}/g, maxTickets?.toString() ?? "");

  const isRunningOnVercel = !!process.env.VERCEL || !!process.env.AWS_REGION;

  const executablePath = isRunningOnVercel
    ? await chromium.executablePath()
    : process.platform === "win32"
    ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
    : "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

  // Configuration supplémentaire pour Vercel
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
    // Délai pour s'assurer que le binaire est prêt
    await new Promise((res) => setTimeout(res, 300));

    browser = await puppeteer.launch(launchOptions);

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "domcontentloaded" });

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
    if (browser) {
      await browser.close().catch(() => null);
    }
  }
}
