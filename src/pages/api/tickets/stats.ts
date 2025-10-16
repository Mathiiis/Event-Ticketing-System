import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/server/auth/config";
import { db } from "@/server/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Méthode non autorisée." });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) {
    return res.status(401).json({ error: "Non autorisé." });
  }

  try {
    // 🔍 Récupère le dernier événement créé par l’utilisateur connecté
    const event = await db.event.findFirst({
      where: { createdById: session.user.id },
      orderBy: { date: "desc" },
      include: {
        _count: { select: { tickets: true } },
        tickets: { select: { checkedIn: true } },
      },
    });

    if (!event) {
      return res.status(200).json({
        totalTickets: 0,
        checkedInCount: 0,
        eventName: "Aucun événement trouvé",
      });
    }

    const totalTickets = event._count.tickets;
    const checkedInCount = event.tickets.filter((t) => t.checkedIn).length;

    return res.status(200).json({
      totalTickets,
      checkedInCount,
      eventName: event.name,
    });
  } catch (err) {
    console.error("Erreur chargement stats:", err);
    return res.status(500).json({ error: "Erreur serveur." });
  }
}
