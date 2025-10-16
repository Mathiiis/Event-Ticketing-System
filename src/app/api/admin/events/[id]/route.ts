import { getServerSession } from "next-auth/next";
import { authOptions } from "@/server/auth/config";
import { db } from "@/server/db";

/**
 * ✏️ Modifier un événement
 */
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401 });

  const body = await req.json();
  const { name, date, location, description, logoUrl, maxTickets } = body;

  const event = await db.event.findUnique({
    where: { id: params.id },
  });

  if (!event || event.createdById !== session.user.id)
    return new Response(JSON.stringify({ error: "Accès refusé" }), { status: 403 });

  const updated = await db.event.update({
    where: { id: params.id },
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
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401 });

  const event = await db.event.findUnique({
    where: { id: params.id },
  });

  if (!event) {
    return new Response(JSON.stringify({ error: "Événement introuvable" }), { status: 404 });
  }

  if (event.createdById !== session.user.id) {
    return new Response(JSON.stringify({ error: "Accès refusé" }), { status: 403 });
  }

  await db.event.delete({
    where: { id: params.id },
  });

  return Response.json({ success: true });
}
