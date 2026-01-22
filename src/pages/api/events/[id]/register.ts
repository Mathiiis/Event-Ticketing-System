import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/server/db";
import { generateQRCode } from "@/server/utils/ticket";
import nodemailer from "nodemailer";
import { generateTicketPDF } from "@/server/utils/generateTicketHTMLPDF";
import { branding } from "@/config/branding";

const EVENT_TIME_ZONE = process.env.EVENT_TIME_ZONE ?? "Europe/Paris";
  const formatEventDate = (date: Date) =>
    date.toLocaleString("fr-FR", {
      dateStyle: "long",
      timeStyle: "short",
      timeZone: EVENT_TIME_ZONE,
    });

const buildEmailSignature = () => {
  if (!branding.emailSignature) return "";
  return `<div style=\"margin-top:24px;font-size:14px;color:#475569;\">${branding.emailSignature}</div>`;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée." });
  }

  const { id: eventId } = req.query;
  const { name, email } = req.body as { name?: string; email?: string };

  if (!eventId || typeof eventId !== "string" || !name || !email) {
    return res.status(400).json({ error: "Données manquantes." });
  }

  try {
    // Récupérer ou créer le participant
    let participant = await db.participant.findUnique({
      where: { email },
    });

    if (!participant) {
      participant = await db.participant.create({
        data: { name, email },
      });
    }

    // Récupérer l'événement
    const event = await db.event.findUnique({
      where: { id: eventId },
      include: { tickets: true },
    });

    if (!event) {
      return res.status(404).json({ error: "Événement introuvable." });
    }

    // Transporter d'e-mail (utilisé dans les deux branches)
    const transporter =
      process.env.EMAIL_DISABLED === "true"
        ? null
        : nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: false,
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            },
          });

    // Vérifier si ce participant a déjà un ticket pour cet événement
    const existingTicket = await db.ticket.findFirst({
      where: {
        eventId: event.id,
        participantId: participant.id,
      },
      include: {
        event: true,
        participant: true,
      },
    });

    if (existingTicket) {
      // Il a déjà un ticket → on réutilise ce ticket

      const readableDate = formatEventDate(existingTicket.event.date);

      const pdfBuffer = await generateTicketPDF({
        name: existingTicket.participant.name,
        eventName: existingTicket.event.name,
        date: readableDate,
        location: existingTicket.event.location ?? "Lieu à venir",
        code: existingTicket.code,
        qrCodeBase64: existingTicket.qrCode,
        logoUrl: existingTicket.event.logoUrl ?? "",
        info: existingTicket.event.description ?? "",
        ticketNumber: existingTicket.number ?? undefined,
        maxTickets: existingTicket.event.maxTickets ?? undefined,
      });

      const pdfBufferFinal = Buffer.isBuffer(pdfBuffer)
        ? pdfBuffer
        : Buffer.from(pdfBuffer);

      if (process.env.EMAIL_DISABLED === "true") {
        console.log(
          "📮 Envoi d'e-mail désactivé (EMAIL_DISABLED=true).",
          `Destinataire: ${existingTicket.participant.email}`,
          `Sujet: Votre billet pour ${existingTicket.event.name} (déjà existant)`,
        );
      } else if (transporter) {
        await transporter.sendMail({
          from: `"${branding.appShortName}" <${process.env.SMTP_USER}>`,
          to: existingTicket.participant.email,
          subject: `🎟️ Votre ticket pour ${existingTicket.event.name}`,
          html: `
            <h1>🎟️ Votre ticket pour ${existingTicket.event.name}</h1>
            <p>Bonjour <strong>${existingTicket.participant.name}</strong>,</p>
            <p>Vous aviez déjà une inscription pour cet événement. Voici à nouveau votre billet en pièce jointe.</p>
            ${buildEmailSignature()}
          `,
          attachments: [
            {
              filename: `${existingTicket.code}.pdf`,
              content: pdfBufferFinal,
              contentType: "application/pdf",
            },
          ],
        });
      }

      const pdfBase64 = Buffer.from(pdfBufferFinal).toString("base64");

      return res.status(200).json({
        success: true,
        reused: true,
        ticket: {
          id: existingTicket.id,
          code: existingTicket.code,
          number: existingTicket.number,
          qrCode: existingTicket.qrCode,
          eventName: existingTicket.event.name,
          eventLogoUrl: existingTicket.event.logoUrl ?? "",
          eventDescription: existingTicket.event.description ?? "",
          participantName: existingTicket.participant.name,
          participantEmail: existingTicket.participant.email,
        },
        pdfBase64,
      });
    }

    // Pas encore de ticket

    // Vérifier la limite de billets UNIQUEMENT pour les nouvelles inscriptions
    if (event.maxTickets && event.tickets.length >= event.maxTickets) {
      return res.status(400).json({
        error: "Le nombre maximum de billets pour cet événement est atteint.",
      });
    }

    const currentCount = await db.ticket.count({
      where: { eventId },
    });

    // Génère un code unique et un QR code
    const ticketCode = `TICKET-${Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase()}`;
    const qrCode = await generateQRCode(ticketCode);

    // Crée le ticket
    const ticket = await db.ticket.create({
      data: {
        code: ticketCode,
        number: currentCount + 1,
        qrCode,
        eventId,
        participantId: participant.id,
      },
      include: { event: true },
    });

    // Génération du PDF avec toutes les infos
    const pdfBuffer = await generateTicketPDF({
      name: participant.name,
      eventName: ticket.event.name,
      date: formatEventDate(ticket.event.date),
      location: ticket.event.location ?? "Lieu à venir",
      code: ticket.code,
      qrCodeBase64: qrCode,
      logoUrl: event.logoUrl ?? "",
      info: ticket.event.description ?? "",
      ticketNumber: ticket.number ?? undefined,
      maxTickets: ticket.event.maxTickets ?? undefined,
    });

    const pdfBufferFinal = Buffer.isBuffer(pdfBuffer)
      ? pdfBuffer
      : Buffer.from(pdfBuffer);

    if (process.env.EMAIL_DISABLED === "true") {
      console.log(
        "📮 Envoi d'e-mail désactivé (EMAIL_DISABLED=true).",
        `Destinataire: ${participant.email}`,
        `Sujet: Votre billet pour ${event.name}`,
      );
    } else if (transporter) {
      await transporter.sendMail({
        from: `"${branding.appShortName}" <${process.env.SMTP_USER}>`,
        to: participant.email,
        subject: `🎟️ Votre ticket pour ${ticket.event.name}`,
        html: `
          <h1>🎟️ Votre ticket pour ${ticket.event.name}</h1>
          <p>Bonjour <strong>${participant.name}</strong>,</p>
          <p>Merci pour votre inscription. Vous trouverez votre billet en pièce jointe au format PDF.</p>
          ${buildEmailSignature()}
        `,
        attachments: [
          {
            filename: `${ticket.code}.pdf`,
            content: pdfBufferFinal,
            contentType: "application/pdf",
          },
        ],
      });
    }

    const pdfBase64 = Buffer.from(pdfBufferFinal).toString("base64");

    return res.status(200).json({
      success: true,
      reused: false,
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
    console.error("❌ Erreur lors de la création / récupération du ticket :", error);
    return res.status(500).json({ error: "Erreur serveur." });
  }
}
