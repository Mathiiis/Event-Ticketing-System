import { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";

type Event = {
  id: string;
  name: string;
  date: string;
  location?: string;
  description?: string;
  image?: string;
  show?: boolean;
  _count: { tickets: number };
  maxTickets?: number | null;
};

export default function AdminEventsPage() {
  const { data: session, status } = useSession();
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    if (status === "authenticated") fetchEvents();
  }, [status]);

  const fetchEvents = async () => {
    const res = await fetch("/api/admin/events");
    if (res.ok) {
      const data = await res.json();
      setEvents(data);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cet événement ?")) return;
    const res = await fetch(`/api/admin/events/${id}`, { method: "DELETE" });
    if (res.ok) fetchEvents();
  };

  const toggleVisibility = async (id: string, currentShow?: boolean) => {
    const next = !(currentShow ?? false);

    const res = await fetch(`/api/admin/events/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ show: next }),
    });

    if (res.ok) {
      // mise à jour optimiste (optionnel)
      setEvents((prev) =>
        prev.map((e) => (e.id === id ? { ...e, show: next } : e))
      );
    } else {
      alert("Erreur lors de la mise à jour de la visibilité.");
    }
  };

  if (status === "loading") return <p className="text-center mt-10">Chargement...</p>;

  if (!session)
    return (
      <div className="text-center mt-20">
        <h1 className="text-2xl font-semibold mb-4">🔒 Accès restreint</h1>
        <button
          onClick={() => signIn("discord")}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Se connecter avec Discord
        </button>
      </div>
    );

  return (
    
    <div className="max-w-6xl mx-auto mt-10">
      <div className="flex items-center gap-3">
        {session.user?.image && (
          <img
            src={session.user.image}
            alt="Avatar"
            className="w-10 h-10 rounded-full border"
      />
      )}
      </div>
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          ⚙️ Espace Administrateur
        </h1>
        <p className="text-gray-600">
          Connecté en tant que{" "}
          <span className="font-semibold">
            {session.user?.name || session.user?.email || "Utilisateur inconnu"}
          </span>
        </p>
      </div>

      {/* Grille des événements */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Tuile de création */}
        <Link
          href="/admin/events/new"
          className="flex items-center justify-center border-2 border-dashed border-gray-400 rounded-lg h-64 hover:bg-gray-100 transition"
        >
          <span className="text-5xl text-gray-500 font-light">+</span>
        </Link>

        {events.map((event) => (
          <div
            key={event.id}
            className="bg-white shadow rounded-lg overflow-hidden flex flex-col"
          >
            <img
              src={event.image || "/placeholder.jpg"}
              alt={event.name}
              className="h-40 w-full object-cover"
            />
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-lg">{event.name}</h3>
                <p className="text-gray-600 text-sm">
                  {new Date(event.date).toLocaleString("fr-FR", {
                    dateStyle: "long",
                    timeStyle: "short",
                  })}
                </p>
                {event.location && <p className="text-gray-500 mt-1">📍 {event.location}</p>}
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => toggleVisibility(event.id, event.show)}
                  className={`px-3 py-1 text-white rounded ${
                    (event.show ?? false)
                      ? "bg-gray-500 hover:bg-gray-600"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {(event.show ?? false) ? "Masquer" : "Afficher"}
                </button>

                <Link
                  href={`/admin/events/${event.id}/edit`}
                  className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
                >
                  Modifier
                </Link>

                <button
                  onClick={() => handleDelete(event.id)}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
