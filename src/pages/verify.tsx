import { useEffect, useState, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useSession, signIn } from "next-auth/react";

type ScanResult = {
  code: string;
  participantName: string;
  eventName: string;
  valid: boolean;
  message: string;
  scanTime: string;
};

export default function VerifyTicketPage() {
  const { data: session, status } = useSession();
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [totalTickets, setTotalTickets] = useState<number>(0);
  const [checkedInCount, setCheckedInCount] = useState<number>(0);
  const [eventName, setEventName] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [lastScanTime, setLastScanTime] = useState<number>(0);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const readerId = "qr-reader";

  const fetchTicketStats = async () => {
    try {
      const res = await fetch("/api/tickets/stats");
      if (!res.ok) return console.error("Erreur chargement stats");
      const data = await res.json();
      setTotalTickets(data.totalTickets);
      setCheckedInCount(data.checkedInCount);
      setEventName(data.eventName);
    } catch (err) {
      console.error("Erreur chargement statistiques :", err);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      safeCreateReaderDiv();
      fetchTicketStats();
    }
    return () => stopScanner();
  }, [status]);

  const safeCreateReaderDiv = () => {
    const oldReader = document.getElementById(readerId);
    if (oldReader && oldReader.parentNode) oldReader.parentNode.removeChild(oldReader);
    const newDiv = document.createElement("div");
    newDiv.id = readerId;
    newDiv.className =
      "mb-4 w-80 h-80 rounded-lg border flex items-center justify-center bg-gray-200";
    document.getElementById("scanner-container")?.appendChild(newDiv);
  };

  const stopScanner = async () => {
    const scanner = scannerRef.current;
    if (!scanner) return;
    try {
      if (scanner.isScanning) await scanner.stop();
    } catch {
      /* ignore */
    } finally {
      scannerRef.current = null;
      setScanning(false);
      safeCreateReaderDiv();
    }
  };

  // 🔸 Nouveau state pour garder le dernier code scanné
  const [lastCode, setLastCode] = useState<string | null>(null);

  // ✅ Fonction de vérification (protégée contre le spam)
  const handleVerify = async (ticketCode: string) => {
    if (!ticketCode || loading) return;

    // 🔒 Ignore si c'est le même code scanné trop vite
    const now = Date.now();
    if (ticketCode === lastCode && now - lastScanTime < 5000) {
      console.log("Scan ignoré (doublon ou trop rapide)");
      return;
    }

    setLastCode(ticketCode);
    setLastScanTime(now);
    setLoading(true);

    try {
      // 🔕 Stop le scanner pendant la vérif (évite les rafales)
      await stopScanner();

      const res = await fetch("/api/tickets/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: ticketCode }),
      });

      const data = await res.json();
      const scanDate = data.ticket?.redeemedAt
        ? new Date(data.ticket.redeemedAt).toLocaleString()
        : new Date().toLocaleString();

      // ✅ Ajoute à l’historique uniquement si ce code n’est pas déjà tout en haut
      setScanResults((prev) => {
        if (prev[0]?.code === ticketCode) return prev;
        return [
          {
            code: ticketCode,
            participantName: data.ticket?.participant?.name ?? "Inconnu",
            eventName: data.ticket?.event?.name ?? "Inconnu",
            valid: data.valid ?? false,
            message: data.message ?? "Erreur",
            scanTime: scanDate,
          },
          ...prev,
        ];
      });

      if (data.valid) setCheckedInCount((c) => c + 1);

      // 🕒 Redémarre le scanner après un petit délai
      setTimeout(() => startScanner(), 2000);
    } catch (err) {
      console.error("Erreur vérification ticket:", err);
    } finally {
      setLoading(false);
    }
  };

  const startScanner = async () => {
    if (scanning) return;
    safeCreateReaderDiv();
    setScanning(true);
    const html5QrCode = new Html5Qrcode(readerId);
    scannerRef.current = html5QrCode;
    try {
      await html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        (decodedText) => handleVerify(decodedText)
      );
    } catch (err) {
      console.error("Impossible de démarrer le scanner QR:", err);
      setScanning(false);
    }
  };

  // 🧠 maintenant les conditions d’affichage viennent APRÈS tous les hooks
  if (status === "loading") {
    return <p className="text-center mt-10">Chargement...</p>;
  }

  if (!session) {
    return (
      <div className="text-center mt-20">
        <h1 className="text-2xl font-semibold mb-4">🔒 Accès restreint</h1>
        <p className="text-gray-600 mb-4">
          Vous devez être connecté pour accéder à la vérification.
        </p>
        <button
          onClick={() => signIn("discord")}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Se connecter avec Discord
        </button>
      </div>
    );
  }

  // 🎥 Interface principale
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">🎟️ Vérifier un billet</h1>

      {eventName && (
        <p className="text-gray-700 mb-4">
          🎟️ {checkedInCount} billets validés / {totalTickets} émis <br />
          📅 Événement : <span className="font-semibold">{eventName}</span>
        </p>
      )}

      <div id="scanner-container" className="mb-4">
        <div id={readerId} className="w-80 h-80 border rounded-lg bg-gray-200" />
      </div>

      {!scanning ? (
        <button
          onClick={startScanner}
          className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 mb-4"
        >
          🎥 Démarrer le scanner
        </button>
      ) : (
        <button
          onClick={stopScanner}
          className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 mb-4"
        >
          ⛔ Arrêter le scanner
        </button>
      )}

      <input
        type="text"
        placeholder="Ou entrez le code manuellement"
        className="border p-2 rounded w-80 text-center mb-3"
        onKeyDown={(e) => {
          if (e.key === "Enter")
            handleVerify((e.target as HTMLInputElement).value);
        }}
      />

      <button
        onClick={() =>
          handleVerify(
            (document.querySelector("input") as HTMLInputElement).value
          )
        }
        disabled={loading}
        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mb-4"
      >
        {loading ? "Vérification..." : "Vérifier manuellement"}
      </button>

      <div className="mt-6 w-96">
        {scanResults.map((r, index) => (
          <div
            key={index}
            className={`mb-2 p-3 rounded-lg text-center shadow ${
              r.valid ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            <p>{r.message}</p>
            <p className="text-sm mt-1">
              👤 {r.participantName} <br />
              🎫 {r.code} <br />
              🗓️ {r.eventName} <br />
              ⏱️ {r.scanTime}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
