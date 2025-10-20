import { useState } from "react";
import { useRouter } from "next/router";
import { Loader2, Ticket, Mail } from "lucide-react";

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4 py-10 transition-colors">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8">
        {!ticketData ? (
          <>
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <Ticket className="w-12 h-12 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Inscription à l’événement
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                Remplis le formulaire pour recevoir ton ticket !
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nom complet
                </label>
                <input
                  type="text"
                  placeholder="Ex : Marie Dupont"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Adresse e-mail
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    placeholder="ton@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {error && (
                <p className="text-center text-red-500 text-sm font-medium">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Inscription en cours...
                  </>
                ) : (
                  "S'inscrire"
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <Ticket className="w-14 h-14 text-green-500" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              🎉 Inscription confirmée !
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Bonjour <strong>{ticketData.ticket.participantName}</strong>,<br />
              ton ticket pour{" "}
              <strong>{ticketData.ticket.eventName}</strong> a été envoyé à{" "}
              <strong>{ticketData.ticket.participantEmail}</strong>.
            </p>

            <button
              onClick={handleDownload}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg font-semibold mt-4 transition"
            >
              Télécharger mon ticket PDF
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
