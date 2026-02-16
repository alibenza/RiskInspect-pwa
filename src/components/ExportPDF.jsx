import React from 'react';import { jsPDF } from "jspdf";import "jspdf-autotable";import { useInspectionStore } from '../hooks/useInspectionStore';import { Download } from 'lucide-react';

const ExportPDF = () => {
  const { questionsConfig, responses, calculateScore } = useInspectionStore();

  const generatePDF = () => {
    const doc = new jsPDF();
    const scoreGlobal = calculateScore();
    const date = new Date().toLocaleDateString();

    // En-tête
    doc.setFontSize(20);doc.setTextColor(37, 99, 235);doc.text("RAPPORT D'INSPECTION RISQUE", 14, 22);
    doc.setFontSize(10);doc.setTextColor(100);doc.text(`Date: ${date} | Score de Conformité: ${scoreGlobal}%`, 14, 30);
    
    let finalY = 35;

    questionsConfig.forEach((section) => {
      const tableRows = [];
      section.questions.forEach((q) => {
        const resp = responses[q.id];
        if (!resp) return;

        // On affiche la valeur texte/chiffre
        let displayValue = resp.value || "-";
        
        // On ajoute la note si l'interrupteur isScored est actif
        if (resp.isScored) {
          displayValue += `\n(Note: ${resp.score || 0}/5)`;
        }

        // Cas spécial pour les extincteurs (calcul auto)
        if (q.id === 'nb_extincteurs') {
          const surface = parseFloat(responses['superficie_batie']?.value) || 0;
          const nbTheorique = Math.ceil(surface / 150);
          displayValue += `\n[Besoin théorique: ${nbTheorique}]`;
        }

        tableRows.push([q.label, displayValue, resp.comment || "-"]);
      });

      if (tableRows.length > 0) {
        doc.setFontSize(14);doc.setTextColor(30, 41, 59);
        doc.text(section.title.toUpperCase(), 14, finalY + 10);
        
        doc.autoTable({
          startY: finalY + 15,
          head: [['Point de contrôle', 'Données / Note', 'Observations']],
          body: tableRows,
          theme: 'grid',
          headStyles: { fillColor: [37, 99, 235], fontSize: 9 },
          columnStyles: { 0: { cellWidth: 50 }, 1: { cellWidth: 50 }, 2: { cellWidth: 'auto' } },
          styles: { fontSize: 8, cellPadding: 3 }
        });
        finalY = doc.lastAutoTable.finalY;
      }
    });

    doc.save(`Rapport_Inspection_${date.replace(/\//g, '-')}.pdf`);
  };

  return (
    <button onClick={generatePDF} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center space-x-3 shadow-lg active:scale-95 transition-transform">
      <Download size={20} />
      <span>TELECHARGER LE RAPPORT PDF</span>
    </button>
  );
};

export default ExportPDF;
