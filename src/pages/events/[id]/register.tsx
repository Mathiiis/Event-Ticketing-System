import { useState } from "react";
import { useRouter } from "next/router";

export default function RegisterPage() {
  const router = useRouter();
  const { id } = router.query;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ticketData, setTicketData] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch(`/api/events/${id}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Une erreur est survenue");
      return;
    }

    // On garde les données du ticket pour téléchargement manuel
    setTicketData(data);
  };

  const handleDownload = () => {
    if (!ticketData?.pdfBase64) return;

    const byteCharacters = atob(ticketData.pdfBase64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const blob = new Blob([new Uint8Array(byteNumbers)], { type: "application/pdf" });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${ticketData.ticket.eventName.replace(/\s+/g, "_")}_ticket.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded-lg shadow bg-white">
      <h1 className="text-2xl font-bold mb-4 text-center">
        Inscription à l'événement
      </h1>

      {!ticketData ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Nom complet"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
          <input
            type="email"
            placeholder="Adresse e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700"
          >
            {loading ? "Inscription..." : "S'inscrire"}
          </button>

          {error && <p className="text-red-500 text-center mt-4">{error}</p>}
        </form>
      ) : (
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">
            🎟️ {ticketData.ticket.eventName}
          </h2>
          <p className="mb-4">
            Bonjour <strong>{ticketData.ticket.participantName}</strong>,<br />
            Votre ticket a été envoyé à <strong>{ticketData.ticket.participantEmail}</strong>.
          </p>

          <button
            onClick={handleDownload}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
          >
            Télécharger mon ticket PDF
          </button>
        </div>
      )}
    </div>
  );
}
