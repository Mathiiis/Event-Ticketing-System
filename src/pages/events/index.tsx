import Link from "next/link";
import type { GetServerSideProps } from "next";
import { db } from "@/server/db";

type Event = {
  id: string;
  name: string;
  date: string;
};

export const getServerSideProps: GetServerSideProps = async () => {
  const events = await db.event.findMany({
    orderBy: { date: "asc" },
  });

  return {
    props: {
      events: events.map((e) => ({
        id: e.id,
        name: e.name,
        date: e.date.toISOString(),
      })),
    },
  };
};

export default function EventsPage({ events }: { events: Event[] }) {
  return (
    <div className="max-w-3xl mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-6 text-center">🎉 Événements disponibles</h1>

      {events.length === 0 && (
        <p className="text-center text-gray-500">Aucun événement n’est disponible pour le moment.</p>
      )}

      <ul className="space-y-4">
        {events.map((event) => (
          <li key={event.id} className="border rounded-lg p-4 shadow flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">{event.name}</h2>
              <p className="text-gray-600">{new Date(event.date).toLocaleDateString()}</p>
            </div>
            <Link
              href={`/events/${event.id}/register`}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              S'inscrire
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
