import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const exportToPdf = (responses, questionsConfig, aiResults, auditorInfo) => {
  const doc = new jsPDF();
  const date = new Date().toLocaleDateString();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Calcul score global terrain
  const scoredQ = Object.values(responses).filter(r => r.isScored);
  const score = scoredQ.length ? Math.round((scoredQ.reduce((a, b) => a + (Number(b.score) || 0), 0) / (scoredQ.length * 5)) * 100) : 0;

  // --- PAGE 1 : DASHBOARD DE SYNTHÈSE ---
  // Bandeau Header
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(0, 0, 210, 65, 'F');

  if (auditorInfo?.logo) {
    try {
      doc.addImage(auditorInfo.logo, 'PNG', 165, 12, 30, 15);
    } catch (e) { console.error(e); }
  }

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont(undefined, 'bold');
  doc.text("RAPPORT D'EXPERTISE RISQUES", 15, 25);
  
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(200, 200, 200);
  doc.text(`AUDITEUR : ${auditorInfo?.name || 'Non spécifié'}`, 15, 35);
  doc.text(`CABINET : ${auditorInfo?.company || 'Non spécifié'}`, 15, 40);
  doc.text(`NATURE D'ACTIVITÉ : ${responses['activite_nature']?.value || 'Non spécifiée'}`, 15, 45);
  doc.text(`DATE DU RAPPORT : ${date}`, 15, 50);

  // Score Global sous forme de badge
  doc.setFillColor(79, 70, 229); // Indigo 600
  doc.roundedRect(15, 75, 180, 25, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text("SCORE D'ASSURABILITÉ GLOBAL (TERRAIN)", 25, 85);
  doc.setFontSize(16);
  doc.text(`${score}%`, 25, 92);

  // Tableau d'exposition IA (Remplace les graphiques)
  let yPos = 115;
  if (aiResults?.analyses) {
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text("MATRICE D'EXPOSITION PAR GARANTIE", 15, 110);

    const exposureRows = aiResults.analyses.map(an => [
      an.garantie, 
      `${an.exposition}/10`, 
      `${an.confidence}%`,
      an.exposition > 6 ? "CRITIQUE" : "MAITRISÉ"
    ]);

    doc.autoTable({
      startY: 115,
      head: [['Garantie', 'Exposition', 'Fiabilité IA', 'Statut']],
      body: exposureRows,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], fontSize: 9 },
      styles: { fontSize: 8 },
      didParseCell: function(data) {
        if (data.column.index === 3 && data.cell.text[0] === 'CRITIQUE') {
          data.cell.styles.textColor = [239, 68, 68];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    });
    yPos = doc.lastAutoTable.finalY + 15;
  }

  // Top Recommandation sur page 1
  if (aiResults?.recommandation_maitresse) {
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(15, yPos, 180, 20, 2, 2, 'F');
    doc.setTextColor(79, 70, 229);
    doc.setFontSize(8);
    doc.setFont(undefined, 'bold');
    doc.text("PRIORITÉ N°1 :", 20, yPos + 8);
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(9);
    const splitRec = doc.splitTextToSize(aiResults.recommandation_maitresse, 165);
    doc.text(splitRec, 20, yPos + 14);
  }

  // --- PAGE 2 : ANALYSE DÉTAILLÉE IA ---
  doc.addPage();
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(16);
  doc.text("SYNTHÈSE DE L'INGÉNIEUR CONSEIL", 15, 20);
  doc.setDrawColor(79, 70, 229);
  doc.line(15, 23, 80, 23);

  // Paragraphe d'introduction
  doc.setFontSize(10);
  doc.setFont(undefined, 'italic');
  const intro = doc.splitTextToSize(aiResults?.introduction || aiResults?.synthese || "", 180);
  doc.text(intro, 15, 35, { lineHeightFactor: 1.4 });
  
  let currentY = 35 + (intro.length * 6) + 10;

  // Analyse par paragraphe pour chaque garantie
  aiResults?.analyses?.forEach(an => {
    if (currentY > 260) { doc.addPage(); currentY = 20; }
    
    doc.setFont(undefined, 'bold');
    doc.setTextColor(79, 70, 229);
    doc.text(`Analyse Focus : ${an.garantie}`, 15, currentY);
    
    doc.setFont(undefined, 'normal');
    doc.setTextColor(40, 40, 40);
    const avis = doc.splitTextToSize(an.avis, 175);
    doc.text(avis, 15, currentY + 6, { lineHeightFactor: 1.3 });
    
    currentY += (avis.length * 6) + 12;
  });

  // --- PAGE 3 : RECUEIL TECHNIQUE ---
  doc.addPage();
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text("RELEVÉS DÉTAILLÉS DE L'INSPECTION", 15, 20);
  
  const tableRows = [];
  questionsConfig.forEach(s => {
    tableRows.push([{ content: s.title.toUpperCase(), colSpan: 3, styles: { fillColor: [248, 250, 252], fontStyle: 'bold' } }]);
    s.questions.forEach(q => {
      const r = responses[q.id];
      if (r) {
        tableRows.push([q.label, r.value || r.score + '/5', r.comment || '-']);
      }
    });
  });

  doc.autoTable({
    startY: 30,
    head: [['Point de contrôle', 'Réponse', 'Commentaires']],
    body: tableRows,
    theme: 'grid',
    styles: { fontSize: 8 },
    headStyles: { fillColor: [15, 23, 42] }
  });

  // --- PAGE 4+ : GALERIE PHOTOS (2 colonnes x 3 lignes = 6 par page) ---
  const allPhotos = [];
  Object.keys(responses).forEach(id => {
    const q = questionsConfig.flatMap(s => s.questions).find(qu => qu.id === id);
    if (responses[id]?.photos) {
      responses[id].photos.forEach(p => allPhotos.push({ ...p, label: q?.label || "Image" }));
    }
  });

  if (allPhotos.length > 0) {
    doc.addPage();
    doc.setFontSize(14);
    doc.text("ANNEXES PHOTOGRAPHIQUES", 15, 20);

    let pX = 15;
    let pY = 30;
    const imgW = 85;
    const imgH = 60;

    allPhotos.forEach((photo, index) => {
      // Si on dépasse 6 photos, nouvelle page
      if (index > 0 && index % 6 === 0) {
        doc.addPage();
        pY = 20;
      }

      try {
        doc.addImage(photo.url, 'JPEG', pX, pY, imgW, imgH);
        doc.setFontSize(7);
        doc.setTextColor(100);
        doc.text(doc.splitTextToSize(photo.label, imgW), pX, pY + imgH + 4);
        doc.text(`GPS: ${photo.coords.lat.toFixed(4)}, ${photo.coords.lng.toFixed(4)}`, pX, pY + imgH + 8);
      } catch (e) { console.error(e); }

      // Logique de grille 2x3
      if ((index + 1) % 2 === 0) {
        pX = 15;
        pY += imgH + 25; // Espace pour l'image + texte + marge
      } else {
        pX = 110;
      }
    });
  }

  doc.save(`Expertise_Risque_${auditorInfo?.company || 'Risk'}_${date.replace(/\//g, '-')}.pdf`);
};
