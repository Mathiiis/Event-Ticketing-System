import PDFDocument from "pdfkit";
import fs from "fs";

export async function generateTicketPDF({
  name,
  eventName,
  date,
  location,
  code,
  qrCodeBase64,
}: {
  name: string;
  eventName: string;
  date: string;
  location: string;
  code: string;
  qrCodeBase64: string;
}) {
  const doc = new PDFDocument({ size: "A4", margin: 0 });
  const buffers: Uint8Array[] = [];

  return new Promise<Buffer>((resolve) => {
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => resolve(Buffer.concat(buffers)));

    const width = doc.page.width;
    const height = doc.page.height;

    // ===== 🎨 Fond dégradé =====
    const gradient = doc.linearGradient(0, 0, width, height);
    gradient.stop(0, "#f5f7fa").stop(1, "#c3cfe2");
    doc.rect(0, 0, width, height).fill(gradient);

    // ===== 🎬 En-tête =====
    doc
      .fontSize(32)
      .fillColor("#000")
      .font("Helvetica-Bold")
      .text(eventName.toUpperCase(), { align: "center" });

    doc.moveDown(1.5);
    doc
      .fontSize(20)
      .font("Helvetica-Bold")
      .fillColor("#000")
      .text(name.toUpperCase(), { align: "center" });

    // ===== 🧾 QR Code =====
    const qrImage = qrCodeBase64.replace(/^data:image\/png;base64,/, "");
    const qrBuffer = Buffer.from(qrImage, "base64");
    const qrWidth = 180;
    const qrX = (width - qrWidth) / 2;
    const qrY = 250;

    // Ombre légère
    doc.save().rect(qrX - 5, qrY - 5, qrWidth + 10, qrWidth + 10).fillOpacity(0.15).fill("#000").restore();

    doc.image(qrBuffer, qrX, qrY, { width: qrWidth });

    // ===== Code du ticket =====
    doc
      .fontSize(14)
      .fillColor("#000")
      .font("Helvetica-Bold")
      .text(code, { align: "center", baseline: "bottom" });
    doc.moveDown(3);

    // ===== 🗓️ Date et 📍 Lieu =====
    const infoY = 500;
    doc.fontSize(14).font("Helvetica-Bold").fillColor("#000");

    doc.text(`📅 ${date}`, 0, infoY, { align: "center" });
    doc.text(`📍 ${location}`, 0, infoY + 25, { align: "center" });

    // ===== INFO : encadré transparent =====
    const infoBoxY = infoY + 80;
    const boxWidth = width - 100;
    const boxHeight = 100;
    const boxX = 50;

    doc.save()
      .rect(boxX, infoBoxY, boxWidth, boxHeight)
      .fillOpacity(0.15)
      .fill("#fff")
      .restore();

    doc
      .fontSize(12)
      .fillColor("#000")
      .font("Helvetica-Bold")
      .text("INFO :", boxX + 20, infoBoxY + 15);

    // ===== Pied de page =====
    doc
      .fontSize(10)
      .fillColor("#555")
      .text("Présentez ce ticket à l'entrée pour validation.", 0, height - 60, {
        align: "center",
      });
    doc
      .fontSize(9)
      .fillColor("#777")
      .text("Ce billet est personnel et non transférable.", 0, height - 45, {
        align: "center",
      });

    doc.end();
  });
}
