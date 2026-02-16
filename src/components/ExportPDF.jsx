import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const exportToPdf = (responses, questionsConfig, aiAnalysisText) => {
  const doc = new jsPDF();
  const date = new Date().toLocaleDateString();

  // DESIGN DU HEADER
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, 210, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("RAPPORT D'EXPERTISE IARD", 15, 25);
  doc.setFontSize(10);
  doc.text(`Généré le : ${date}`, 15, 32);

  let yPos = 50;

  // SECTION IA : ANALYSE STRATÉGIQUE (Si disponible)
  if (aiAnalysisText) {
    doc.setTextColor(79, 70, 229);
    doc.setFontSize(14);
    doc.text("1. SYNTHÈSE DE L'EXPERT (IA)", 15, yPos);
    yPos += 7;
    
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    const splitAi = doc.splitTextToSize(aiAnalysisText, 180);
    doc.text(splitAi, 15, yPos);
    yPos += (splitAi.length * 5) + 10;
  }

  // SECTION TECHNIQUE : TABLEAU DES DONNÉES
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("2. DÉTAILS DES POINTS DE CONTRÔLE", 15, yPos);
  yPos += 5;

  const tableRows = [];
  questionsConfig.forEach(section => {
    tableRows.push([{ content: section.title, colSpan: 3, styles: { fillColor: [240, 240, 240], fontStyle: 'bold' } }]);
    section.questions.forEach(q => {
      const r = responses[q.id];
      if (r && r.value) {
        tableRows.push([
          q.label,
          r.isScored ? `${r.score}/5` : 'Info',
          `${r.value}${r.comment ? '\nObs: ' + r.comment : ''}`
        ]);
      }
    });
  });

  doc.autoTable({
    startY: yPos,
    head: [['Point de contrôle', 'Note', 'Détails / Observations']],
    body: tableRows,
    theme: 'grid',
    headStyles: { fillColor: [79, 70, 229] },
    styles: { fontSize: 8, cellPadding: 3 },
    margin: { left: 15, right: 15 }
  });

  doc.save(`Expertise_Risque_${date.replace(/\//g, '-')}.pdf`);
};
