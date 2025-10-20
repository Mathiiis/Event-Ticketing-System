import { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";


type Event = {
  _count: { tickets: number };
  id: string;
  name: string;
  date: string;
  location?: string;
  description?: string;
  logoUrl?: string;
  image?: string;
  maxTickets?: number | null;
};

export default function AdminEventsPage() {
  const { data: session, status } = useSession();
  const [events, setEvents] = useState<Event[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    time: "",
    location: "",
    description: "",
    logoUrl: "",
    image: "",
    maxTickets: "",
  });

  // Charger les événements
  useEffect(() => {
    if (status === "authenticated") fetchEvents();
  }, [status]);

  const fetchEvents = async () => {
    const res = await fetch("/api/admin/events");
    if (!res.ok) return;
    const data = await res.json();
    setEvents(data);
  };

  // Créer un événement
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { name, date, time } = formData;
    if (!name || !date || !time) {
      alert("Veuillez remplir le nom, la date et l'heure");
      return;
    }

    const dateTime = new Date(`${date}T${time}:00`);

    const res = await fetch("/api/admin/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formData, date: dateTime }),
    });

    if (res.ok) {
      setFormData({
        name: "",
        date: "",
        time: "",
        location: "",
        description: "",
        logoUrl: "",
        image: "",
        maxTickets: "",
      });
      await fetchEvents();
    } else {
      alert("Erreur lors de la création de l’événement");
    }
  };

  // Modifier un événement
  const handleEdit = async (event: Event) => {
    const newName = prompt("Nouveau nom de l’événement :", event.name);
    if (!newName) return;

    const res = await fetch(`/api/admin/events/${event.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName }),
    });

    if (res.ok) {
      alert("Événement mis à jour !");
      await fetchEvents();
    } else {
      alert("Erreur lors de la mise à jour.");
    }
  };

  // Supprimer un événement
  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cet événement ?")) return;

    const res = await fetch(`/api/admin/events/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      alert("Événement supprimé !");
      await fetchEvents();
    } else {
      alert("Erreur lors de la suppression.");
    }
  };

  // Gestion des états de session
  if (status === "loading") {
    return <p className="text-center mt-10">Chargement...</p>;
  }

  if (!session) {
    return (
      <div className="text-center mt-20">
        <h1 className="text-2xl font-semibold mb-4">🔒 Accès restreint</h1>
        <p className="text-gray-600">Vous devez être connecté pour gérer vos événements.</p>
        <button
          onClick={() => signIn("discord")}
          className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Se connecter avec Discord
        </button>
      </div>
    );
  }

  // Interface admin
  return (
    <div className="max-w-4xl mx-auto mt-10 space-y-10">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            ⚙️ Espace Administrateur
          </h1>
          <p className="text-gray-600">Bienvenue, {session.user?.name}</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
        >
          Déconnexion
        </button>
      </div>

      {/* === Formulaire de création === */}
      <form
        onSubmit={handleSubmit}
        className="border p-4 rounded-lg shadow space-y-4 bg-white"
      >
        <h2 className="text-xl font-semibold">Créer un nouvel événement</h2>

        {/* Nom */}
        <div>
          <label className="block mb-1 font-medium">Nom de l’événement</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full border rounded px-3 py-2"
            placeholder="Ex: Conférence Tech 2025"
          />
        </div>

        {/* Date + Heure */}
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block mb-1 font-medium">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div className="flex-1">
            <label className="block mb-1 font-medium">Heure</label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        {/* Lieu */}
        <div>
          <label className="block mb-1 font-medium">Lieu</label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) =>
              setFormData({ ...formData, location: e.target.value })
            }
            className="w-full border rounded px-3 py-2"
            placeholder="Ex: Palais des Congrès, Paris"
          />
        </div>

        {/* Tickets */}
        <div>
          <label className="block mb-1 font-medium">
            Nombre maximum de billets
          </label>
          <input
            type="number"
            min="1"
            value={formData.maxTickets}
            onChange={(e) =>
              setFormData({ ...formData, maxTickets: e.target.value })
            }
            className="w-full border rounded px-3 py-2"
            placeholder="Ex: 200"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block mb-1 font-medium">
            Informations complémentaires
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full border rounded px-3 py-2 h-24"
            placeholder="Ex: Accueil à 18h, parking gratuit..."
          ></textarea>
        </div>

        {/* Logo */}
        <div>
          <label className="block mb-1 font-medium">
            Logo de l’événement (URL)
          </label>
          <input
            type="url"
            value={formData.logoUrl}
            onChange={(e) =>
              setFormData({ ...formData, logoUrl: e.target.value })
            }
            className="w-full border rounded px-3 py-2"
            placeholder="Ex: https://.../logo.png"
          />
          {formData.logoUrl && (
            <div className="mt-2 flex justify-center">
              <img
                src={formData.logoUrl}
                alt="Aperçu logo"
                className="w-24 h-24 object-contain border rounded"
              />
            </div>
          )}
        </div>

        {/* Image */}
        <div>
          <label className="block mb-1 font-medium">
            Image de l’événement (URL)
          </label>
          <input
            type="url"
            value={formData.image}
            onChange={(e) =>
              setFormData({ ...formData, image: e.target.value })
            }
            className="w-full border rounded px-3 py-2"
            placeholder="Ex: https://.../image.png"
          />
          {formData.image && (
            <div className="mt-2 flex justify-center">
              <img
                src={formData.image}
                alt="Aperçu image"
                className="w-24 h-24 object-contain border rounded"
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full"
        >
          Créer l’événement
        </button>
      </form>

      {/* === Liste des événements === */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">📅 Vos Événements</h2>

        {events.length === 0 ? (
          <p className="text-gray-500">
            Vous n’avez encore créé aucun événement.
          </p>
        ) : (
          <ul className="space-y-3">
            {events.map((event) => (
              <li
                key={event.id}
                className="border rounded-lg p-4 flex justify-between items-center bg-white"
              >
                <div>
                  <h3 className="font-semibold">{event.name}</h3>
                  <p className="text-gray-600">
                    {new Date(event.date).toLocaleString("fr-FR", {
                      dateStyle: "long",
                      timeStyle: "short",
                    })}
                  </p>
                  {event.location && (
                    <p className="text-gray-500">📍 {event.location}</p>
                  )}
                  {event.maxTickets ? (
                    <p className="text-sm text-gray-700 mt-1">
                      🎟️ {event._count?.tickets ?? 0} / {event.maxTickets} billets vendus
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400 mt-1">
                      🎟️ Billets illimités
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(event)}
                    className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Supprimer
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
