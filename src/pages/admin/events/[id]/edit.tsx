import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function EditEventPage() {
  const router = useRouter();
  const { id } = router.query;

  const [loading, setLoading] = useState(true);
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

  // Charger l’événement existant
  useEffect(() => {
    if (id) fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/events/${id}`);
    if (res.ok) {
      const data = await res.json();
      const dateObj = new Date(data.date);
      setFormData({
        name: data.name || "",
        date: dateObj.toISOString().split("T")[0] || "",
        time: dateObj.toISOString().split("T")[1]?.slice(0, 5) || "",
        location: data.location || "",
        description: data.description || "",
        logoUrl: data.logoUrl || "",
        image: data.image || "",
        maxTickets: data.maxTickets?.toString() || "",
      });
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dateTime = new Date(`${formData.date}T${formData.time}:00`);

    const res = await fetch(`/api/admin/events/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formData, date: dateTime }),
    });

    if (res.ok) {
      alert("✅ Événement mis à jour avec succès !");
      router.push("/admin/events");
    } else {
      alert("Erreur lors de la mise à jour de l’événement.");
    }
  };

  if (loading) return <p className="text-center mt-10">Chargement...</p>;

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white p-6 rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6 text-center">✏️ Modifier l’événement</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nom */}
        <div>
          <label className="block mb-1 font-medium">Nom de l’événement</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* Date et Heure */}
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
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* Max tickets */}
        <div>
          <label className="block mb-1 font-medium">Nombre maximum de billets</label>
          <input
            type="number"
            value={formData.maxTickets}
            onChange={(e) => setFormData({ ...formData, maxTickets: e.target.value })}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block mb-1 font-medium">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full border rounded px-3 py-2 h-24"
          ></textarea>
        </div>

        {/* Logo */}
        <div>
          <label className="block mb-1 font-medium">Logo de l’événement (URL)</label>
          <input
            type="url"
            value={formData.logoUrl}
            onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
            className="w-full border rounded px-3 py-2"
          />
          {formData.logoUrl && (
            <img
              src={formData.logoUrl}
              alt="Logo aperçu"
              className="w-24 h-24 object-contain mt-2 border rounded"
            />
          )}
        </div>

        {/* Image principale */}
        <div>
          <label className="block mb-1 font-medium">Image principale (URL)</label>
          <input
            type="url"
            value={formData.image}
            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            className="w-full border rounded px-3 py-2"
          />
          {formData.image && (
            <img
              src={formData.image}
              alt="Image de l’événement"
              className="w-full h-40 object-cover mt-2 rounded-lg"
            />
          )}
        </div>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => router.push("/admin/events")}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Enregistrer les modifications
          </button>
        </div>
      </form>
    </div>
  );
}
