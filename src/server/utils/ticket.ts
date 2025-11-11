import QRCode from "qrcode";
import nodemailer from "nodemailer";

/**
 * Génère un QR code en Base64 à partir du code de ticket unique.
 */
export async function generateQRCode(ticketCode: string): Promise<string> {
  try {
    return await QRCode.toDataURL(ticketCode);
  } catch (err) {
    console.error("Erreur lors de la génération du QR code :", err);
    throw new Error("Impossible de générer le QR code");
  }
}

/**
 * Envoie le ticket par email au participant.
 */
export async function sendTicketEmail(to: string, html: string) {
  if (process.env.EMAIL_DISABLED === "true") {
    console.log(`📪 Envoi d’e-mail désactivé.)`);
    return;
  }
  
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Event Ticketing" <${process.env.SMTP_USER}>`,
    to,
    subject: "🎟️ Votre ticket d'événement",
    html,
  });
}
