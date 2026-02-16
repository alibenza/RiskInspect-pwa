import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const exportToPdf = (responses, questionsConfig, aiResults) => {
  const doc = new jsPDF();
  const date = new Date().toLocaleDateString();

  // Calcul score
  const scoredQ = Object.values(responses).filter(r => r.isScored);
  const score = scoredQ.length ? Math.round((scoredQ.reduce((a, b) => a + (Number(b.score) || 0), 0) / (scoredQ.length * 5)) * 100) : 0;

  // --- PAGE 1 : RÉSUMÉ DASHBOARD ---
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, 210, 60, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.text("RAPPORT D'EXPERTISE RISQUE", 15, 30);
  doc.setFontSize(12);
  doc.text(`SCORE GLOBAL : ${score}%`, 15, 45);

  let y = 75;
  if (aiResults) {
    // Points Forts
    doc.setTextColor(34, 197, 94);
    doc.text("POINTS FORTS", 15, y);
    doc.setFontSize(10);
    doc.setTextColor(40, 40, 40);
    aiResults.pointsForts.forEach(p => doc.text(`- ${p}`, 20, y += 7));

    // Points Faibles
    y += 15;
    doc.setFontSize(12);
    doc.setTextColor(239, 68, 68);
    doc.text("POINTS FAIBLES", 15, y);
    doc.setFontSize(10);
    doc.setTextColor(40, 40, 40);
    aiResults.pointsFaibles.forEach(p => doc.text(`- ${p}`, 20, y += 7));

    // Recs
    y += 15;
    doc.setFontSize(12);
    doc.setTextColor(79, 70, 229);
    doc.text("RECOMMANDATIONS PRIORITAIRES", 15, y);
    doc.setFontSize(9);
    doc.setTextColor(40, 40, 40);
    aiResults.recommandations.forEach(p => doc.text(`* ${p}`, 20, y += 7));
  }

  // --- PAGE 2 : ANALYSE IA COMPLÈTE ---
  doc.addPage();
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(16);
  doc.text("SYNTHÈSE DE L'EXPERT IA", 15, 20);
  doc.setFontSize(10);
  const synth = doc.splitTextToSize(aiResults?.synthese || "N/A", 180);
  doc.text(synth, 15, 30);

  // --- PAGE 3 : DÉTAILS AUDIT ---
  doc.addPage();
  doc.setFontSize(16);
  doc.text("DÉTAILS DES RÉPONSES", 15, 20);
  const rows = [];
  questionsConfig.forEach(s => {
    rows.push([{ content: s.title, colSpan: 3, styles: { fillColor: [240, 240, 240], fontStyle: 'bold' } }]);
    s.questions.forEach(q => {
      const r = responses[q.id];
      if (r) rows.push([q.label, r.score || '-', r.value + (r.comment ? ` (${r.comment})` : '')]);
    });
  });

  doc.autoTable({
    startY: 30,
    head: [['Question', 'Note', 'Réponse']],
    body: rows,
    theme: 'grid',
    headStyles: { fillColor: [79, 70, 229] }
  });

  doc.save(`Expertise_Complete_${date}.pdf`);
};
