import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/server/db";
import { generateQRCode } from "@/server/utils/ticket";
import nodemailer from "nodemailer";
import { generateTicketPDF } from "@/server/utils/generateTicketHTMLPDF";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée." });
  }

  const { id: eventId } = req.query;
  const { name, email } = req.body;

  if (!eventId || !name || !email) {
    return res.status(400).json({ error: "Données manquantes." });
  }

  try {
    // Vérifie si le participant existe déjà
    let participant = await db.participant.findUnique({
      where: { email: email as string },
    });

    if (!participant) {
      participant = await db.participant.create({
        data: { name, email },
      });
    }

    // Récupère l'événement complet
    const event = await db.event.findUnique({
      where: { id: eventId as string },
      include: { tickets: true },
    });

    if (!event) {
      return res.status(404).json({ error: "Événement introuvable." });
    }

    // Vérifie la limite de billets
    if (event.maxTickets && event.tickets.length >= event.maxTickets) {
      return res.status(400).json({
        error: "Le nombre maximum de billets pour cet événement est atteint.",
      });
    }

    const currentCount = await db.ticket.count({
      where: { eventId: eventId as string },
    });

    // Génère un code unique et un QR code
    const ticketCode = `TICKET-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    const qrCode = await generateQRCode(ticketCode);

    // Crée le ticket
    const ticket = await db.ticket.create({
      data: {
        code: ticketCode,
        number: currentCount + 1,
        qrCode,
        eventId: eventId as string,
        participantId: participant.id,
      },
      include: { event: true },
    });

    // Génération du PDF avec toutes les infos
    const pdfBuffer = await generateTicketPDF({
      name: participant.name,
      eventName: ticket.event.name,
      date: new Date(ticket.event.date).toLocaleString("fr-FR", {
        dateStyle: "long",
        timeStyle: "short",
      }),
      location: ticket.event.location ?? "Lieu à venir",
      code: ticket.code,
      qrCodeBase64: qrCode,
      logoUrl: event.logoUrl ?? "",
      info: ticket.event.description ?? "",
      ticketNumber: ticket.number ?? undefined,
      maxTickets: ticket.event.maxTickets ?? undefined,
    });

    // Envoi du mail avec le PDF en pièce jointe
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const pdfBufferFinal = Buffer.isBuffer(pdfBuffer)
      ? pdfBuffer
      : Buffer.from(pdfBuffer);

    await transporter.sendMail({
      from: `"Event Ticketing" <${process.env.SMTP_USER}>`,
      to: participant.email,
      subject: `🎟️ Votre ticket pour ${ticket.event.name}`,
      html: `
        <h1>🎟️ Votre ticket pour ${ticket.event.name}</h1>
        <p>Bonjour <strong>${participant.name}</strong>,</p>
        <p>Merci pour votre inscription. Vous trouverez votre billet en pièce jointe au format PDF.</p>
      `,
      attachments: [
        {
          filename: `${ticket.code}.pdf`,
          content: pdfBufferFinal,
          contentType: "application/pdf",
        },
      ],
    });

    // Réponse au frontend (PDF encodé pour téléchargement)
    const pdfBase64 = Buffer.from(pdfBuffer).toString("base64");

    return res.status(200).json({
      success: true,
      ticket: {
        id: ticket.id,
        code: ticket.code,
        number: ticket.number,
        qrCode: ticket.qrCode,
        eventName: ticket.event.name,
        eventLogoUrl: ticket.event.logoUrl ?? "",
        eventDescription: ticket.event.description ?? "",
        participantName: participant.name,
        participantEmail: participant.email,
      },
      pdfBase64,
    });
  } catch (error) {
    console.error("❌ Erreur lors de la création du ticket :", error);
    return res.status(500).json({ error: "Erreur serveur." });
  }
}
