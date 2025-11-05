import { getServerSession } from "next-auth/next";
import { authOptions } from "@/server/auth/config";
import { db } from "@/server/db";

type UpdateBody = {
  name?: string;
  date?: string | Date;
  location?: string;
  description?: string;
  logoUrl?: string;
  image?: string;
  maxTickets?: string | number | null;
  show?: boolean;
};

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await context.params; // ✅ important : attendre params
  const body: UpdateBody = await req.json();

  // Récupérer l'événement
  const event = await db.event.findUnique({ where: { id } });
  if (!event) {
    return Response.json({ error: "Événement introuvable" }, { status: 404 });
  }
  if (event.createdById !== session.user.id) {
    return Response.json({ error: "Accès refusé" }, { status: 403 });
  }

  // Construction dynamique des données à mettre à jour
  const data: any = {};

  if (body.name !== undefined) data.name = body.name;
  if (body.location !== undefined) data.location = body.location;
  if (body.description !== undefined) data.description = body.description;
  if (body.logoUrl !== undefined) data.logoUrl = body.logoUrl;
  if (body.image !== undefined) data.image = body.image;

  if (body.maxTickets !== undefined) {
    data.maxTickets =
      body.maxTickets === null
        ? null
        : typeof body.maxTickets === "string"
        ? parseInt(body.maxTickets, 10)
        : body.maxTickets;
  }

  if (body.date !== undefined && !isNaN(new Date(body.date).getTime())) {
    data.date = new Date(body.date);
  }

  if (body.show !== undefined) {
    data.show = !!body.show;
  }

  const updated = await db.event.update({
    where: { id },
    data,
  });

  return Response.json(updated);
}
