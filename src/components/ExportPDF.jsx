import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { RISK_QUESTIONS } from './questions';
import { useInspectionStore } from '../hooks/useInspectionStore';

const ExportPDF = () => {
  const { responses, calculateScore } = useInspectionStore();

  const generatePDF = () => {
    const doc = new jsPDF();
    const globalScore = calculateScore();
    const date = new Date().toLocaleDateString();

    // --- EN-TÊTE DU DOCUMENT ---
    doc.setFontSize(20);
    doc.setTextColor(30, 64, 175); // Bleu primaire
    doc.text("RAPPORT D'INSPECTION DE RISQUE", 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Généré le : ${date} | Score Global : ${globalScore}%`, 14, 30);
    doc.line(14, 35, 196, 35);

    // --- PRÉPARATION DES DONNÉES DU TABLEAU ---
    const tableRows = [];

    RISK_QUESTIONS.forEach(section => {
      // Ajouter une ligne de titre de section
      tableRows.push([{ content: section.title, colSpan: 2, styles: { fillColor: [241, 245, 249], fontStyle: 'bold' } }]);
      
      section.questions.forEach(q => {
        let value = responses[q.id] || "N/A";
        
        // Formatage spécial pour le nombre d'extincteurs
        if (q.id === 'nb_extincteurs' && responses['superficie_batie']) {
          const requis = Math.ceil(responses['superficie_batie'] / 150);
          value = `${value} (Requis: ${requis})`;
        }

        tableRows.push([q.label, value.toString()]);
      });
    });

    // --- GÉNÉRATION DU TABLEAU ---
    doc.autoTable({
      startY: 40,
      head: [['Point de Contrôle', 'Valeur / Note']],
      body: tableRows,
      theme: 'striped',
      headStyles: { fillColor: [30, 64, 175] },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: { 0: { cellWidth: 120 }, 1: { halign: 'center' } }
    });

    // --- PIED DE PAGE ---
    const pageCount = doc.internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`Page ${i} sur ${pageCount} - Rapport RiskInspect`, 196, 285, { align: 'right' });
    }

    doc.save(`Rapport_Inspection_${date.replace(/\//g, '-')}.pdf`);
  };

  return (
    <button
      onClick={generatePDF}
      className="w-full flex items-center justify-center space-x-2 bg-slate-900 text-white p-4 rounded-2xl font-bold shadow-xl active:scale-95 transition-transform mt-4"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-6"/><path d="m9 15 3 3 3-3"/></svg>
      <span>Exporter le Rapport PDF</span>
    </button>
  );
};

export default ExportPDF;
