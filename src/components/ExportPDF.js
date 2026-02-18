import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const exportToPdf = (responses, questionsConfig, aiResults, auditorInfo) => {
  const doc = new jsPDF();
  const date = new Date().toLocaleDateString();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Calcul score global terrain
  const scoredQ = Object.values(responses).filter(r => r.isScored);
  const terrainScore = scoredQ.length ? Math.round((scoredQ.reduce((a, b) => a + (Number(b.score) || 0), 0) / (scoredQ.length * 5)) * 100) : 0;

  // --- PAGE 1 : DASHBOARD EXÉCUTIF ---
  // Bandeau Header Premium
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(0, 0, 210, 65, 'F');

  if (auditorInfo?.logo) {
    try {
      doc.addImage(auditorInfo.logo, 'PNG', 165, 12, 30, 15);
    } catch (e) { console.error(e); }
  }

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont(undefined, 'bold');
  doc.text("RAPPORT D'EXPERTISE TECHNIQUE", 15, 25);
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(148, 163, 184); // Slate 400
  doc.text(`RÉFÉRENCE : ${auditorInfo?.company?.toUpperCase() || 'RISK'}-${new Date().getFullYear()}-001`, 15, 32);

  doc.setTextColor(255, 255, 255);
  doc.text(`EXPERT : ${auditorInfo?.name || 'Non spécifié'}`, 15, 42);
  doc.text(`ACTIVITÉ : ${responses['activite_nature']?.value || 'Non spécifiée'}`, 15, 47);
  doc.text(`LOCALISATION : ${responses['adress']?.value || 'Algérie'}`, 15, 52);
  doc.text(`DATE D'INSPECTION : ${date}`, 15, 57);

  // SECTION SCORES (Double Badge)
  // Score Terrain
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(15, 75, 85, 30, 3, 3, 'F');
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(8);
  doc.text("CONFORMITÉ TERRAIN", 20, 85);
  doc.setFontSize(16);
  doc.text(`${terrainScore}%`, 20, 95);

  // Score Qualité IA
  doc.setFillColor(79, 70, 229);
  doc.roundedRect(110, 75, 85, 30, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text("QUALITÉ RISQUE (IA)", 115, 85);
  doc.setFontSize(16);
  doc.text(`${aiResults?.score_global || '--'}%`, 115, 95);

  // MATRICE D'EXPOSITION IA
  let yPos = 125;
  if (aiResults?.analyses_par_garantie) {
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text("ÉVALUATION TECHNIQUE PAR GARANTIE", 15, 120);

    const exposureRows = aiResults.analyses_par_garantie.map(an => [
      an.garantie, 
      `${an.exposition}/10`, 
      an.exposition > 7 ? "ÉLEVÉE" : (an.exposition > 4 ? "MODÉRÉE" : "FAIBLE")
    ]);

    doc.autoTable({
      startY: 125,
      head: [['Garantie Souscrite', 'Indice d\'Exposition', 'Niveau de Risque']],
      body: exposureRows,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], fontSize: 9 },
      styles: { fontSize: 8 },
      didParseCell: function(data) {
        if (data.column.index === 2 && data.cell.text[0] === 'ÉLEVÉE') {
          data.cell.styles.textColor = [220, 38, 38];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    });
    yPos = doc.lastAutoTable.finalY + 15;
  }

  // SYNTHÈSE EXÉCUTIVE SUR PAGE 1
  if (aiResults?.synthese_executive) {
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(15, yPos, 180, 35, 2, 2, 'FD');
    doc.setTextColor(79, 70, 229);
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.text("AVIS DE L'EXPERT CONSEIL :", 22, yPos + 10);
    doc.setTextColor(51, 65, 85);
    doc.setFont(undefined, 'italic');
    doc.setFontSize(9);
    const splitSynth = doc.splitTextToSize(aiResults.synthese_executive, 165);
    doc.text(splitSynth, 22, yPos + 18);
  }

  // --- PAGE 2 : ANALYSE DES ALÉAS ET RISQUES MAJEURS ---
  doc.addPage();
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text("1. ANALYSE DES RISQUES NATURELS (NAT-CAT)", 15, 25);
  doc.setDrawColor(6, 182, 212); // Cyan
  doc.line(15, 28, 100, 28);

  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  const catNatText = doc.splitTextToSize(aiResults?.analyse_nat_cat || "Non disponible", 180);
  doc.text(catNatText, 15, 40, { lineHeightFactor: 1.4 });

  let currentY = 40 + (catNatText.length * 6) + 15;

  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text("2. POINTS DE VIGILANCE MAJEURS", 15, currentY);
  doc.setDrawColor(225, 29, 72); // Rose
  doc.line(15, currentY + 3, 100, currentY + 3);

  currentY += 15;
  aiResults?.points_vigilance_majeurs?.forEach((point, i) => {
    doc.setFillColor(255, 241, 242);
    doc.roundedRect(15, currentY - 5, 180, 10, 1, 1, 'F');
    doc.setFontSize(9);
    doc.setTextColor(159, 18, 57);
    doc.setFont(undefined, 'bold');
    doc.text(`${i + 1}. ${point}`, 20, currentY + 1);
    currentY += 13;
  });

  // --- PAGE 3 : ANALYSE DÉTAILLÉE PAR GARANTIE ---
  doc.addPage();
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(16);
  doc.text("3. EXPERTISE TECHNIQUE PAR BRANCHE", 15, 25);
  
  let gY = 40;
  aiResults?.analyses_par_garantie?.forEach(an => {
    if (gY > 240) { doc.addPage(); gY = 25; }
    
    // Titre Branche
    doc.setFillColor(15, 23, 42);
    doc.rect(15, gY, 180, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text(an.garantie.toUpperCase(), 20, gY + 5.5);
    
    // Avis Technique
    doc.setTextColor(51, 65, 85);
    doc.setFont(undefined, 'bold');
    doc.text("Analyse du risque :", 15, gY + 15);
    doc.setFont(undefined, 'normal');
    const avisSplit = doc.splitTextToSize(an.avis_technique, 175);
    doc.text(avisSplit, 15, gY + 20);
    
    gY += (avisSplit.length * 5) + 25;

    // Préconisation Standard
    doc.setFillColor(245, 243, 255); // Indigo 50
    const standardSplit = doc.splitTextToSize(`NORME & STANDARD : ${an.recommandations_standards}`, 170);
    doc.roundedRect(15, gY - 5, 180, (standardSplit.length * 5) + 5, 2, 2, 'F');
    doc.setTextColor(67, 56, 202);
    doc.setFontSize(8.5);
    doc.text(standardSplit, 20, gY);

    gY += (standardSplit.length * 5) + 20;
  });

  // --- PAGE PLAN D'ACTIONS ---
  doc.addPage();
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text("4. PLAN DE MAÎTRISE DES RISQUES (PMR)", 15, 25);

  const actionRows = Object.entries(aiResults?.plan_actions || {}).map(([priorite, action]) => [priorite, action]);
  doc.autoTable({
    startY: 35,
    head: [['Priorité', 'Action Recommandée']],
    body: actionRows,
    theme: 'striped',
    headStyles: { fillColor: [79, 70, 229] },
    styles: { fontSize: 9, cellPadding: 5 }
  });

  // --- RELEVÉS TERRAIN ---
  doc.addPage();
  doc.setFontSize(14);
  doc.text("ANNEXE : RELEVÉS DÉTAILLÉS DE L'INSPECTION", 15, 25);
  
  const terrainRows = [];
  questionsConfig.forEach(s => {
    terrainRows.push([{ content: s.title.toUpperCase(), colSpan: 3, styles: { fillColor: [241, 245, 249], fontStyle: 'bold' } }]);
    s.questions.forEach(q => {
      const r = responses[q.id];
      if (r) {
        terrainRows.push([q.label, r.value || r.score + '/5', r.comment || '-']);
      }
    });
  });

  doc.autoTable({
    startY: 35,
    head: [['Point de contrôle', 'Réponse', 'Observations Expert']],
    body: terrainRows,
    theme: 'grid',
    styles: { fontSize: 8 },
    headStyles: { fillColor: [15, 23, 42] }
  });

  // --- GALERIE PHOTOS ---
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
    doc.text("ANNEXE : DOCUMENTATION PHOTOGRAPHIQUE", 15, 20);

    let pX = 15;
    let pY = 35;
    const imgW = 85;
    const imgH = 60;

    allPhotos.forEach((photo, index) => {
      if (index > 0 && index % 6 === 0) { doc.addPage(); pY = 20; }

      try {
        doc.addImage(photo.url, 'JPEG', pX, pY, imgW, imgH);
        doc.setFontSize(7);
        doc.setTextColor(100);
        doc.text(doc.splitTextToSize(photo.label, imgW), pX, pY + imgH + 4);
        if (photo.coords) {
          doc.text(`GPS: ${photo.coords.lat?.toFixed(4)}, ${photo.coords.lng?.toFixed(4)}`, pX, pY + imgH + 8);
        }
      } catch (e) { console.error(e); }

      if ((index + 1) % 2 === 0) {
        pX = 15;
        pY += imgH + 25;
      } else {
        pX = 110;
      }
    });
  }

  doc.save(`RAPPORT_EXPERTISE_${auditorInfo?.company || 'RISK'}_${date.replace(/\//g, '-')}.pdf`);
};
