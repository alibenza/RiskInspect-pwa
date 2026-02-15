import React from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { useInspectionStore } from '../hooks/useInspectionStore';
import { FileDown } from 'lucide-react';

const ExportPDF = () => {
  const { questionsConfig, responses, calculateScore } = useInspectionStore();

  const generatePDF = () => {
    const doc = new jsPDF();
    const globalScore = calculateScore();
    const date = new Date().toLocaleDateString();

    // --- EN-TÊTE DU RAPPORT ---
    doc.setFontSize(20);
    doc.setTextColor(40);
    doc.text('RAPPORT DE VISITE DE RISQUE', 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text(`Date de l'inspection : ${date}`, 105, 30, { align: 'center' });
    doc.text(`Score Global de Conformité : ${globalScore}%`, 105, 38, { align: 'center' });

    // Ligne de séparation
    doc.setLineWidth(0.5);
    doc.line(20, 45, 190, 45);

    let currentY = 55;

    // --- PARCOURS DES SECTIONS ---
    questionsConfig.forEach((section) => {
      // Vérifier s'il y a des réponses dans cette section
      const sectionHasData = section.questions.some(q => responses[q.id]);
      if (!sectionHasData) return;

      // Ajouter une nouvelle page si nécessaire
      if (currentY > 240) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFontSize(14);
      doc.setTextColor(37, 99, 235); // Bleu pro
      doc.text(section.title, 14, currentY);
      currentY += 7;

      const tableRows = [];

      section.questions.forEach((q) => {
        const resp = responses[q.id];
        if (!resp) return;

        let displayValue = "";
        
        // Formater l'affichage selon le type
        if (q.type === 'range') {
          displayValue = `${resp.value || 0} / 5`;
        } else if (q.id === 'nb_extincteurs') {
            const surface = parseFloat(responses['superficie_batie']?.value) || 0;
            const nbTheorique = Math.ceil(surface / 150);
            displayValue = `${resp.value || 0} (Besoin: ${nbTheorique})`;
        } else {
          displayValue = resp.value || "-";
        }

        tableRows.push([
          q.label,
          displayValue,
          resp.comment || "" // On ajoute les observations libres
        ]);
      });

      // Génération du tableau pour la section
      doc.autoTable({
        startY: currentY,
        head: [['Point de contrôle', 'Donnée / Note', 'Observations & Commentaires']],
        body: tableRows,
        theme: 'striped',
        headStyles: { fillColor: [51, 65, 85] },
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: {
          0: { cellWidth: 50 },
          1: { cellWidth: 35, fontStyle: 'bold' },
          2: { cellWidth: 'auto', fontStyle: 'italic' }
        },
        margin: { left: 14, right: 14 }
      });

      currentY = doc.lastAutoTable.finalY + 15;
    });

    // --- PIED DE PAGE ---
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`CIAR Inspect PWA - Page ${i} sur ${pageCount}`, 105, 285, { align: 'center' });
    }

    doc.save(`Rapport_Risque_${date.replace(/\//g, '-')}.pdf`);
  };

  return (
    <button
      onClick={generatePDF}
      className="w-full flex items-center justify-center space-x-3 bg-blue-600 text-white p-5 rounded-2xl font-bold shadow-lg hover:bg-blue-700 active:scale-95 transition-all"
    >
      <FileDown size={22} />
      <span>EXPORTER LE RAPPORT COMPLET (PDF)</span>
    </button>
  );
};

export default ExportPDF;
