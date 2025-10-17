import { getServerSession } from "next-auth/next";
import { authOptions } from "@/server/auth/config";
import { db } from "@/server/db";

/**
 * ✏️ Modifier un événement
 */
export async function PUT(request: Request, context: any) {
  const id = context.params.id;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await request.json();
  const { name, date, location, description, logoUrl, maxTickets } = body;

  const event = await db.event.findUnique({ where: { id } });
  if (!event || event.createdById !== session.user.id) {
    return Response.json({ error: "Accès refusé" }, { status: 403 });
  }

  const updated = await db.event.update({
    where: { id },
    data: {
      name,
      date: date ? new Date(date) : event.date,
      location,
      description,
      logoUrl,
      maxTickets: maxTickets ? parseInt(maxTickets, 10) : null,
    },
  });

  return Response.json(updated);
}

/**
 * 🗑️ Supprimer un événement
 */
export async function DELETE(request: Request, context: any) {
  const id = context.params.id;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Non autorisé" }, { status: 401 });
  }

  const event = await db.event.findUnique({ where: { id } });
  if (!event) {
    return Response.json({ error: "Événement introuvable" }, { status: 404 });
  }

  if (event.createdById !== session.user.id) {
    return Response.json({ error: "Accès refusé" }, { status: 403 });
  }

  await db.event.delete({ where: { id } });

  return Response.json({ success: true });
}
