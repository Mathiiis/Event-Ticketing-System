import { useRouter } from "next/router";
import jsPDF from "jspdf";

export default function TicketPage() {
  const router = useRouter();
  const { code, name, event, qr } = router.query;

  if (!code || !qr) {
    return <p className="text-center mt-20">Aucun ticket trouvé 😕</p>;
  }

  const downloadPDF = () => {
    const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();

    // Fond couleur
    pdf.setFillColor(240, 240, 240);
    pdf.rect(0, 0, pageWidth, 842, "F");

    // Logo en haut (optionnel)
    const logo = "/logo.png"; // place ton logo dans public/logo.png
    pdf.addImage(logo, "PNG", pageWidth / 2 - 50, 20, 100, 50);

    // Titre
    pdf.setFontSize(24);
    pdf.setTextColor(0, 0, 80);
    pdf.text("🎟️ Ticket Événement", pageWidth / 2, 100, { align: "center" });

    // Infos participant et événement
    pdf.setFontSize(16);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`Nom : ${name}`, 40, 150);
    pdf.text(`Événement : ${event}`, 40, 180);
    pdf.text(`Code du ticket : ${code}`, 40, 210);

    // QR code centré
    const qrSize = 200;
    pdf.addImage(decodeURIComponent(qr as string), "PNG", pageWidth / 2 - qrSize / 2, 250, qrSize, qrSize);

    // Instructions
    pdf.setFontSize(12);
    pdf.setTextColor(80, 80, 80);
    pdf.text(
      "Présentez ce QR code à l'entrée pour valider votre ticket.\nUn e-mail vous a également été envoyé.",
      40,
      480,
      { maxWidth: pageWidth - 80 }
    );

    pdf.save(`${event}_ticket_${code}.pdf`);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded-lg shadow text-center">
      <h1 className="text-2xl font-bold mb-2">🎟️ Votre ticket</h1>
      <img src={decodeURIComponent(qr as string)} alt="QR Code du ticket" className="mx-auto mb-4 w-48 h-48" />
      <p className="text-gray-700"><strong>Nom :</strong> {name}</p>
      <p className="text-gray-700"><strong>Événement :</strong> {event}</p>
      <p className="text-gray-700"><strong>Code :</strong> {code}</p>

      <button
        onClick={downloadPDF}
        className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Télécharger en PDF
      </button>
    </div>
  );
}
