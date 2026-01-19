import { useState } from "react";
import { useRouter } from "next/router";

type FormState = {
  name: string;
  date: string;
  time: string;
  location: string;
  description: string;
  logoUrl: string;
  image: string;
  maxTickets: string;
};

const pad2 = (value: number) => value.toString().padStart(2, "0");

const formatLocalDateTime = (value: Date) => {
  const offsetMinutes = -value.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const absMinutes = Math.abs(offsetMinutes);
  const offsetHours = pad2(Math.floor(absMinutes / 60));
  const offsetMins = pad2(absMinutes % 60);

  return `${value.getFullYear()}-${pad2(value.getMonth() + 1)}-${pad2(
    value.getDate(),
  )}T${pad2(value.getHours())}:${pad2(
    value.getMinutes(),
  )}:00${sign}${offsetHours}:${offsetMins}`;
};

export default function NewEventPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormState>({
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
    if (!formData.name || !formData.date) {
      alert("Veuillez renseigner le nom et la date");
      return;
    }

    const dateTime = new Date(`${formData.date}T${formData.time || "00:00"}:00`);

    if (Number.isNaN(dateTime.getTime())) {
      alert("Date / heure invalides");
      return;
    }

    const formattedDate = formatLocalDateTime(dateTime);

    const res = await fetch("/api/admin/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...formData,
        date: formattedDate,
        maxTickets: formData.maxTickets
          ? parseInt(formData.maxTickets, 10)
          : null,
      }),
    });

    if (res.ok) {
      router.push("/admin/events");
    } else {
      alert("Erreur lors de la création de l’événement");
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white p-6 rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6 text-center">
        ➕ Créer un nouvel événement
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nom */}
        <div>
          <label className="block mb-1 font-medium">Nom de l’événement</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) =>
              setFormData((f) => ({ ...f, name: e.target.value }))
            }
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
              onChange={(e) =>
                setFormData((f) => ({ ...f, date: e.target.value }))
              }
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div className="flex-1">
            <label className="block mb-1 font-medium">Heure</label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) =>
                setFormData((f) => ({ ...f, time: e.target.value }))
              }
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
              setFormData((f) => ({ ...f, location: e.target.value }))
            }
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* Max tickets */}
        <div>
          <label className="block mb-1 font-medium">
            Nombre maximum de billets
          </label>
          <input
            type="number"
            value={formData.maxTickets}
            onChange={(e) =>
              setFormData((f) => ({ ...f, maxTickets: e.target.value }))
            }
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block mb-1 font-medium">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData((f) => ({ ...f, description: e.target.value }))
            }
            className="w-full border rounded px-3 py-2 h-24"
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
              setFormData((f) => ({ ...f, logoUrl: e.target.value }))
            }
            className="w-full border rounded px-3 py-2"
          />
          {formData.logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={formData.logoUrl}
              alt="Logo aperçu"
              className="w-24 h-24 object-contain mt-2 border rounded"
            />
          )}
        </div>

        {/* Image principale */}
        <div>
          <label className="block mb-1 font-medium">
            Image principale (URL)
          </label>
          <input
            type="url"
            value={formData.image}
            onChange={(e) =>
              setFormData((f) => ({ ...f, image: e.target.value }))
            }
            className="w-full border rounded px-3 py-2"
          />
          {formData.image && (
            // eslint-disable-next-line @next/next/no-img-element
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
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Créer l’événement
          </button>
        </div>
      </form>
    </div>
  );
}
