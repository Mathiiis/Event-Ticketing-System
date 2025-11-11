import { useState } from "react";
import { useRouter } from "next/router";

export default function NewEventPage() {
  const router = useRouter();
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
      router.push("/admin/events");
    } else {
      alert("Erreur lors de la création de l’événement");
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white p-6 rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6 text-center">➕ Créer un nouvel événement</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {["name", "location", "logoUrl", "image"].map((field) => (
          <div key={field}>
            <label className="block mb-1 font-medium capitalize">{field}</label>
            <input
              type="text"
              value={(formData as any)[field]}
              onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        ))}

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

        <textarea
          placeholder="Description..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full border rounded px-3 py-2 h-24"
        />

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          Créer l’événement
        </button>
      </form>
    </div>
  );
}
