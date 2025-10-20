import { useEffect, useState, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useSession, signIn, signOut } from "next-auth/react";

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
  const [totalTickets, setTotalTickets] = useState(0);
  const [checkedInCount, setCheckedInCount] = useState(0);
  const [eventName, setEventName] = useState("");
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [lastScanTime, setLastScanTime] = useState(0);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const readerId = "qr-reader";
  const [lastCode, setLastCode] = useState<string | null>(null);

  // Charger stats de tickets
  const fetchTicketStats = async () => {
    try {
      const res = await fetch("/api/tickets/stats");
      if (!res.ok) return;
      const data = await res.json();
      setTotalTickets(data.totalTickets);
      setCheckedInCount(data.checkedInCount);
      setEventName(data.eventName);
    } catch (err) {
      console.error("Erreur stats :", err);
    }
  };

  useEffect(() => { if (status === "authenticated") { safeCreateReaderDiv(); fetchTicketStats(); } 
  return () => { stopScanner(); }; }, [status]);

  const safeCreateReaderDiv = () => {
    const old = document.getElementById(readerId);
    if (old && old.parentNode) old.parentNode.removeChild(old);
    const div = document.createElement("div");
    div.id = readerId;
    div.className =
      "mb-4 w-80 h-80 rounded-lg border flex items-center justify-center bg-gray-100 shadow-inner";
    document.getElementById("scanner-container")?.appendChild(div);
  };

  const stopScanner = async () => {
    const scanner = scannerRef.current;
    if (!scanner) return;
    try {
      if (scanner.isScanning) await scanner.stop();
    } catch {}
    finally {
      scannerRef.current = null;
      setScanning(false);
      safeCreateReaderDiv();
    }
  };

  const handleVerify = async (ticketCode: string) => {
    if (!ticketCode || loading) return;
    const now = Date.now();
    if (ticketCode === lastCode && now - lastScanTime < 5000) return;

    setLastCode(ticketCode);
    setLastScanTime(now);
    setLoading(true);
    await stopScanner();

    try {
      const res = await fetch("/api/tickets/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: ticketCode }),
      });

      const data = await res.json();
      const scanDate = data.ticket?.redeemedAt
        ? new Date(data.ticket.redeemedAt).toLocaleString()
        : new Date().toLocaleString();

      setScanResults((prev) => [
        {
          code: ticketCode,
          participantName: data.ticket?.participant?.name ?? "Inconnu",
          eventName: data.ticket?.event?.name ?? "Inconnu",
          valid: data.valid ?? false,
          message: data.message ?? "Erreur",
          scanTime: scanDate,
        },
        ...prev,
      ]);

      if (data.valid) setCheckedInCount((c) => c + 1);

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
        (decodedText) => handleVerify(decodedText),
        (err) => console.warn("QR error:", err)
      );
    } catch (err) {
      console.error("Impossible de démarrer le scanner:", err);
      setScanning(false);
    }
  };

  // États d'accès
  if (status === "loading") return <p className="text-center mt-10">Chargement...</p>;

  if (!session)
    return (
      <div className="text-center mt-20">
        <h1 className="text-2xl font-semibold mb-4">🔒 Accès restreint</h1>
        <p className="text-gray-600 mb-4">Vous devez être connecté.</p>
        <button
          onClick={() => signIn("discord")}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Se connecter avec Discord
        </button>
      </div>
    );

  // Interface principale
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-br from-gray-50 to-gray-200 relative">
      <div className="absolute top-4 right-6">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
        >
          Déconnexion
        </button>
      </div>

      <h1 className="text-3xl font-bold mb-2 text-gray-800">Vérification des billets</h1>
      {eventName && (
        <p className="text-gray-700 mb-6 text-center">
          🎫 {checkedInCount} validés / {totalTickets} émis <br />
          📅 <span className="font-semibold">{eventName}</span>
        </p>
      )}

      <div id="scanner-container" className="mb-4">
        <div id={readerId} className="w-80 h-80 border rounded-lg bg-gray-100 shadow-inner" />
      </div>

      {!scanning ? (
        <button
          onClick={startScanner}
          className="w-80 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition mb-4"
        >
           Démarrer le scanner
        </button>
      ) : (
        <button
          onClick={stopScanner}
          className="w-80 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition mb-4"
        >
          ⛔ Arrêter le scanner
        </button>
      )}

      <input
        type="text"
        placeholder="Ou entrez un code manuellement"
        className="border p-2 rounded w-80 text-center mb-3 shadow-sm"
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
        className="w-80 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        {loading ? "Vérification..." : "Vérifier manuellement"}
      </button>

      {/* Résultats */}
      <div className="mt-8 w-full max-w-md space-y-2">
        {scanResults.map((r, i) => (
          <div
            key={i}
            className={`p-3 rounded-lg text-center shadow transition transform ${
              r.valid
                ? "bg-green-100 text-green-700 border border-green-300"
                : "bg-red-100 text-red-700 border border-red-300"
            }`}
          >
            <p className="font-semibold">{r.message}</p>
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
