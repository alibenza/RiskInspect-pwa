import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const exportToPdf = (responses, questionsConfig, aiResults, auditorInfo) => {
  const doc = new jsPDF();
  const date = new Date().toLocaleDateString();

  // Calcul score global
  const scoredQ = Object.values(responses).filter(r => r.isScored);
  const score = scoredQ.length ? Math.round((scoredQ.reduce((a, b) => a + (Number(b.score) || 0), 0) / (scoredQ.length * 5)) * 100) : 0;

  // --- PAGE 1 : RÉSUMÉ DASHBOARD AVEC LOGO ---
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(0, 0, 210, 60, 'F');

  // Insertion du Logo Auditeur (en haut à droite)
  if (auditorInfo?.logo) {
    try {
      // On place le logo à x:160, y:10 avec une largeur de 35mm
      doc.addImage(auditorInfo.logo, 'PNG', 160, 10, 35, 20);
    } catch (e) {
      console.error("Erreur lors de l'insertion du logo dans le PDF", e);
    }
  }

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.text("RAPPORT DE VISITE DE RISQUE", 15, 25);
  
  // Infos Auditeur dans le bandeau
  doc.setFontSize(10);
  doc.setTextColor(200, 200, 200);
  doc.text(`AUTEUR : ${auditorInfo?.name || 'Non spécifié'}`, 15, 35);
  doc.text(`ENTREPRISE : ${auditorInfo?.company || 'Non spécifié'}`, 15, 41);
  
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text(`SCORE DE CONFORMITÉ : ${score}% | Date : ${date}`, 15, 52);

  let y = 75;
  if (aiResults) {
    // Points Forts
    doc.setTextColor(34, 197, 94);
    doc.setFontSize(12);
    doc.text("POINTS FORTS TECHNIQUES", 15, y);
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    aiResults.pointsForts.forEach(p => {
      const splitP = doc.splitTextToSize(`• ${p}`, 180);
      doc.text(splitP, 20, y += 7);
      y += (splitP.length - 1) * 4;
    });

    // Points Faibles
    y += 12;
    doc.setFontSize(12);
    doc.setTextColor(239, 68, 68);
    doc.text("VULNÉRABILITÉS CRITIQUES", 15, y);
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    aiResults.pointsFaibles.forEach(p => {
      const splitP = doc.splitTextToSize(`• ${p}`, 180);
      doc.text(splitP, 20, y += 7);
      y += (splitP.length - 1) * 4;
    });

    // Recommandations
    y += 12;
    doc.setFontSize(12);
    doc.setTextColor(79, 70, 229);
    doc.text("ACTIONS DE PRÉVENTION PRIORITAIRES", 15, y);
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    aiResults.recommandations.forEach(p => {
      const splitP = doc.splitTextToSize(`* ${p}`, 180);
      doc.text(splitP, 20, y += 7);
      y += (splitP.length - 1) * 4;
    });
  }

  // --- PAGE 2 : SYNTHÈSE IA DÉTAILLÉE ---
  doc.addPage();
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(16);
  doc.text("SYNTHÈSE DE L'INGÉNIEUR CONSEIL", 15, 20);
  doc.setDrawColor(79, 70, 229);
  doc.line(15, 22, 100, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(40, 40, 40);
  const synth = doc.splitTextToSize(aiResults?.synthese || "Analyse non générée.", 180);
  doc.text(synth, 15, 35, { lineHeightFactor: 1.5 });

  // --- PAGE 3 : TABLEAU COMPLET DES RÉPONSES ---
  doc.addPage();
  doc.setFontSize(16);
  doc.text("RELEVÉS DÉTAILLÉS DU SITE", 15, 20);
  
  const rows = [];
  questionsConfig.forEach(s => {
    rows.push([{ content: s.title.toUpperCase(), colSpan: 3, styles: { fillColor: [241, 245, 249], fontStyle: 'bold', textColor: [79, 70, 229] } }]);
    s.questions.forEach(q => {
      const r = responses[q.id];
      if (r) {
        const photoCount = r.photos?.length || 0;
        const val = r.value || '-';
        const obs = r.comment ? `\nNote: ${r.comment}` : '';
        const photoLabel = photoCount > 0 ? `\n[${photoCount} photo(s) en annexe]` : '';
        
        rows.push([
          q.label, 
          r.score || 'N/A', 
          { content: val + obs + photoLabel }
        ]);
      }
    });
  });

  doc.autoTable({
    startY: 30,
    head: [['Point de contrôle', 'Note/5', 'Observations']],
    body: rows,
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], fontSize: 10 },
    styles: { fontSize: 8, cellPadding: 4 },
    columnStyles: { 1: { halign: 'center', cellWidth: 20 } }
  });

  // --- PAGES SUIVANTES : ANNEXE PHOTOGRAPHIQUE ---
  let hasPhotos = false;
  questionsConfig.forEach(s => {
    s.questions.forEach(q => {
      if (responses[q.id]?.photos?.length > 0) hasPhotos = true;
    });
  });

  if (hasPhotos) {
    doc.addPage();
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    doc.text("ANNEXE : PREUVES PHOTOGRAPHIQUES", 15, 20);
    doc.setFontSize(8);
    doc.text(`Expert : ${auditorInfo?.name || 'Expert IARD'} | Horodatage GPS certifié`, 15, 26);

    let photoY = 35;
    questionsConfig.forEach(section => {
      section.questions.forEach(q => {
        const r = responses[q.id];
        if (r?.photos && r.photos.length > 0) {
          if (photoY > 230) { doc.addPage(); photoY = 25; }

          doc.setFontSize(9);
          doc.setTextColor(79, 70, 229);
          doc.setFont(undefined, 'bold');
          doc.text(`Réf : ${q.label}`, 15, photoY);
          doc.setFont(undefined, 'normal');
          doc.setTextColor(100, 100, 100);

          r.photos.forEach((p, idx) => {
            const xPos = 15 + (idx % 3) * 62;
            const yPos = photoY + 5;
            const finalYPos = yPos + (Math.floor(idx / 3) * 55);
            if (finalYPos > 240) { doc.addPage(); photoY = 20; }

            try {
              doc.addImage(p.url, 'JPEG', xPos, finalYPos, 58, 42);
              doc.setFontSize(6);
              doc.text(`Prise le : ${new Date(p.timestamp).toLocaleString()}`, xPos, finalYPos + 45);
              doc.text(`GPS: ${p.coords.lat.toFixed(5)}, ${p.coords.lng.toFixed(5)}`, xPos, finalYPos + 48);
            } catch (e) {
              console.error("Erreur image", e);
            }
          });
          
          const rowCount = Math.ceil(r.photos.length / 3);
          photoY += (rowCount * 55) + 15;
        }
      });
    });
  }

  doc.save(`Expertise_${auditorInfo?.company || 'Risk'}_${date.replace(/\//g, '-')}.pdf`);
};
