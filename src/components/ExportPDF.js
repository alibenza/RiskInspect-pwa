import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Ajout du paramètre chartImage à la fin
export const exportToPdf = (responses, questionsConfig, aiResults, auditorInfo, chartImage) => {
  const doc = new jsPDF();
  const date = new Date().toLocaleDateString();
  const pageWidth = doc.internal.pageSize.getWidth();

  // --- LOGIQUE DE CALCUL ---
  const scoredQ = Object.values(responses).filter(r => r.isScored);
  const terrainScore = scoredQ.length ? Math.round((scoredQ.reduce((a, b) => a + (Number(b.score) || 0), 0) / (scoredQ.length * 5)) * 100) : 0;

  // --- PAGE 1 : HEADER & DASHBOARD ---
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(0, 0, 210, 65, 'F');

  if (auditorInfo?.logo) {
    try { doc.addImage(auditorInfo.logo, 'PNG', 165, 12, 30, 15); } catch (e) { console.error(e); }
  }

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont(undefined, 'bold');
  doc.text("RAPPORT D'EXPERTISE TECHNIQUE", 15, 25);
  
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(148, 163, 184); 
  doc.text(`RÉFÉRENCE : ${auditorInfo?.company?.toUpperCase() || 'RISK'}-${new Date().getFullYear()}-001`, 15, 32);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text(`EXPERT : ${auditorInfo?.name || 'Non spécifié'}`, 15, 42);
  doc.text(`ACTIVITÉ : ${responses['activite_nature']?.value || 'Non spécifiée'}`, 15, 47);
  doc.text(`LOCALISATION : ${responses['adress']?.value || 'Algérie'}`, 15, 52);
  doc.text(`DATE D'INSPECTION : ${date}`, 15, 57);

  // --- SECTION DISCLAIMER ---
  const auditorName = auditorInfo?.name || "l'expert désigné";
  const clientName = responses['nomination']?.value || responses['activite_nature']?.value || "du site client";
  const Adress = responses['adress']?.value 
  const disclaimerText = `Le présent document est rédigé à la suite de la visite de risque effectuée par ${auditorName} au site de "${clientName}" sis à "${Adress}". L'analyse est effectuée par un agent IA sur la base des informations collectées ; les synthèses et modélisations peuvent comporter des imprécisions.`;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  const splitDisclaimer = doc.splitTextToSize(disclaimerText, 180);
  const disclaimerHeight = (splitDisclaimer.length * 5) + 8;
  
  doc.roundedRect(15, 70, 180, disclaimerHeight, 2, 2, 'FD');
  doc.setFontSize(7.5);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(" PRÉAMBULE ", 20, 75);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(splitDisclaimer, 20, 80);

  // --- SECTION SCORES ---
  const scoreY = 70 + disclaimerHeight + 10;
  
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(15, scoreY, 85, 30, 3, 3, 'F');
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(8); doc.text("CONFORMITÉ TERRAIN", 20, scoreY + 10);
  doc.setFontSize(16); doc.text(`${terrainScore}%`, 20, scoreY + 20);

  doc.setFillColor(79, 70, 229);
  doc.roundedRect(110, scoreY, 85, 30, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8); doc.text("QUALITÉ RISQUE (IA)", 115, scoreY + 10);
  doc.setFontSize(16); doc.text(`${aiResults?.score_global || '--'}%`, 115, scoreY + 20);

  // --- TABLEAU D'EXPOSITION ---
  let nextY = scoreY + 45;

  if (aiResults?.analyses_par_garantie) {
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text("ÉVALUATION TECHNIQUE PAR BRANCHE", 15, nextY);

    const exposureRows = aiResults.analyses_par_garantie.map(an => [
      an.garantie, 
      `${an.exposition}/10`, 
      an.exposition > 7 ? "CRITIQUE" : (an.exposition > 4 ? "MODÉRÉ" : "SOUS CONTRÔLE")
    ]);

    doc.autoTable({
      startY: nextY + 5,
      head: [['Branche', 'Indice d\'Exposition', 'Statut Souscription']],
      body: exposureRows,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], fontSize: 9 },
      styles: { fontSize: 8.5 },
      didParseCell: function(data) {
        if (data.column.index === 2) {
          if (data.cell.text[0] === 'CRITIQUE') data.cell.styles.textColor = [190, 18, 60];
          if (data.cell.text[0] === 'SOUS CONTRÔLE') data.cell.styles.textColor = [5, 150, 105];
        }
      }
    });

    nextY = doc.lastAutoTable.finalY + 15;
  }

  // --- NOUVELLE SECTION : INSERTION DU GRAPHIQUE ---
  if (chartImage) {
    // Si on n'a plus de place sur la page 1, on ajoute le graphe sur la page 2
    if (nextY > 200) {
      doc.addPage();
      nextY = 25;
    }

    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text("CARTOGRAPHIE DU RISQUE (RADAR IA)", 15, nextY);
    
    try {
      // On insère l'image capturée (Radar Chart)
      doc.addImage(chartImage, 'PNG', 35, nextY + 5, 140, 70); 
      nextY += 85; 
    } catch (e) {
      console.error("Erreur image chart:", e);
    }
  }

  // --- SYNTHÈSE EXECUTIVE ---
  if (aiResults?.synthese_executive) {
    if (nextY > 240) { doc.addPage(); nextY = 25; }
    
    const splitSynth = doc.splitTextToSize(aiResults.synthese_executive, 170);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(79, 70, 229);
    doc.roundedRect(15, nextY, 180, (splitSynth.length * 5) + 12, 2, 2, 'FD');
    doc.setTextColor(79, 70, 229);
    doc.setFontSize(9); doc.setFont(undefined, 'bold');
    doc.text("SYNTHÈSE DE L'INGÉNIEUR CONSEIL", 22, nextY + 8);
    doc.setTextColor(51, 65, 85); doc.setFont(undefined, 'normal');
    doc.text(splitSynth, 22, nextY + 15);
  }

  // --- PAGE SUIVANTE : ALÉAS ---
  doc.addPage();
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(14); doc.setFont(undefined, 'bold');
  doc.text("1. ANALYSE ENVIRONNEMENTALE & NAT-CAT", 15, 25);
  doc.setDrawColor(6, 182, 212); doc.line(15, 28, 60, 28);

  doc.setFontSize(9.5); doc.setFont(undefined, 'normal');
  const catNatText = doc.splitTextToSize(aiResults?.analyse_nat_cat || "Non disponible", 180);
  doc.text(catNatText, 15, 38, { lineHeightFactor: 1.4 });

  // --- ANALYSE TECHNIQUE DÉTAILLÉE ---
  doc.addPage();
  doc.setFontSize(14); doc.setFont(undefined, 'bold');
  doc.text("3. ANALYSE TECHNIQUE DÉTAILLÉE", 15, 25);
  
  let gY = 35;
  aiResults?.analyses_par_garantie?.forEach(an => {
    if (gY > 240) { doc.addPage(); gY = 25; }
    doc.setFillColor(15, 23, 42);
    doc.rect(15, gY, 180, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9); doc.setFont(undefined, 'bold');
    doc.text(an.garantie.toUpperCase(), 20, gY + 4.5);
    
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(9); doc.text("Avis Souscription :", 15, gY + 14);
    doc.setFont(undefined, 'normal');
    const avisSplit = doc.splitTextToSize(an.avis_technique, 175);
    doc.text(avisSplit, 15, gY + 19);
    
    gY += (avisSplit.length * 5) + 24;
    const standardSplit = doc.splitTextToSize(`PRÉCONISATION : ${an.recommandations_standards}`, 170);
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(15, gY - 5, 180, (standardSplit.length * 5) + 5, 1, 1, 'F');
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(8); doc.text(standardSplit, 20, gY);
    gY += (standardSplit.length * 5) + 15;
  });

  // --- ANNEXES : RELEVÉS ---
  doc.addPage();
  doc.setFontSize(14); doc.setTextColor(15, 23, 42);
  doc.text("ANNEXE : RELEVÉS DÉTAILLÉS DE L'INSPECTION", 15, 25);
  const terrainRows = [];
  questionsConfig.forEach(s => {
    terrainRows.push([{ content: s.title.toUpperCase(), colSpan: 3, styles: { fillColor: [241, 245, 249], fontStyle: 'bold' } }]);
    s.questions.forEach(q => {
      const r = responses[q.id];
      if (r) terrainRows.push([q.label, r.value || r.score + '/5', r.comment || '-']);
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
    let pX = 15; let pY = 35;
    allPhotos.forEach((photo, index) => {
      if (index > 0 && index % 6 === 0) { doc.addPage(); pY = 20; }
      try {
        doc.addImage(photo.url, 'JPEG', pX, pY, 85, 60);
        doc.setFontSize(7); doc.setTextColor(100);
        doc.text(doc.splitTextToSize(photo.label, 85), pX, pY + 64);
      } catch (e) { console.error(e); }
      if ((index + 1) % 2 === 0) { pX = 15; pY += 85; } else { pX = 110; }
    });
  }

  // --- FOOTER & SAUVEGARDE ---
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(`Expertise confidentielle - ${auditorInfo?.company || 'Risk Management'} - Page ${i}/${totalPages}`, pageWidth / 2, 290, { align: 'center' });
  }

  doc.save(`RAPPORT_TECHNIQUE_${clientName.replace(/\s+/g, '_')}_${date.replace(/\//g, '-')}.pdf`);
};
