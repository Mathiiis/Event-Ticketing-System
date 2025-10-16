import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";

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
  // 📄 Lecture du template HTML
  const templatePath = path.resolve("src/server/templates/ticket.html");
  let html = fs.readFileSync(templatePath, "utf8");

  // 🧩 Remplacement des variables dynamiques
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

  // 🚀 Lancement de Puppeteer
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",           // ✅ utile pour hébergement (Vercel/Render)
      "--disable-setuid-sandbox"
    ],
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  // 🧾 Génération du PDF
const pdfBuffer = await page.pdf({
  format: "A4",
  printBackground: true,
  margin: { top: "0", bottom: "0", left: "0", right: "0" },
});


  await browser.close();
  return pdfBuffer;
}
