import Link from "next/link";
import type { GetServerSideProps } from "next";
import { db } from "@/server/db";

type Event = {
  id: string;
  name: string;
  date: string;
  description?: string | null;
  location?: string | null;
  logoUrl?: string | null;
  image?: string | null;
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
        description: e.description,
        location: e.location,
        logoUrl: e.logoUrl,
        image: e.image,
      })),
    },
  };
};

export default function EventsPage({ events }: { events: Event[] }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors">
      {/* Hero Section */}
      <section className="text-center py-20 px-6">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
          Événements à venir
        </h1>
        <p className="text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
          Inscrivez-vous aux prochainnes projections.
        </p>
      </section>

      {/* Liste des événements */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        {events.length === 0 ? (
          <div className="text-center py-20 text-gray-500 text-lg">
            Aucun événement n’est disponible pour le moment.
          </div>
        ) : (
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <li
                key={event.id}
                className="group bg-white dark:bg-gray-900 rounded-2xl shadow-soft hover:shadow-lg hover:-translate-y-1 transition-all p-5 border border-gray-100 dark:border-gray-700"
              >
                {/* Image */}
                {event.image ? (
                  <img
                    src={event.image}
                    alt={event.name}
                    className="w-full h-40 object-cover rounded-xl mb-4"
                  />
                ) : (
                  <div className="w-full h-40 bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-gray-700 dark:to-gray-800 rounded-xl mb-4 flex items-center justify-center text-5xl">
                    🎫
                  </div>
                )}

                {/* Infos événement */}
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition">
                  {event.name}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(event.date).toLocaleDateString("fr-FR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>

                {event.location && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">📍 {event.location}</p>
                )}

                {event.description && (
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-3 line-clamp-3">
                    {event.description}
                  </p>
                )}

                <Link
                  href={`/events/${event.id}/register`}
                  className="mt-5 inline-block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition"
                >
                  S&apos;inscrire →
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
