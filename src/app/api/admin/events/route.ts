import { getServerSession } from "next-auth/next";
import { authOptions } from "@/server/auth/config";
import { db } from "@/server/db";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401 });
  }

  const events = await db.event.findMany({
    where: { createdById: session.user.id },
    include: { _count: { select: { tickets: true } } },
    orderBy: { date: "asc" },
  });

  return Response.json(events);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401 });
  }

  const body = await req.json();
  const { name, date, location, description, logoUrl, image, maxTickets } = body;

  if (!name || !date) {
    return new Response(JSON.stringify({ error: "Nom et date requis." }), { status: 400 });
  }

  const newEvent = await db.event.create({
    data: {
      name,
      date: new Date(date),
      location,
      description,
      logoUrl,
      image,
      maxTickets: maxTickets ? parseInt(maxTickets, 10) : null,
      createdById: session.user.id,
    },
  });

  return Response.json(newEvent);
}
