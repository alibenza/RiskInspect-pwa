import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const exportToPdf = async (responses, questionsConfig, aiResults, auditorInfo) => {
  const doc = new jsPDF();
  const date = new Date().toLocaleDateString();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const clientName = responses['nomination']?.value || "SITE CLIENT";
  const address = responses['adress']?.value || "Non spécifiée";

  // --- HELPER : Styles de couleurs ---
  const COLORS = {
    SLATE_900: [15, 23, 42],
    INDIGO_600: [79, 70, 229],
    SLATE_100: [241, 245, 249],
    TEXT_MAIN: [51, 65, 85],
    ROSE_600: [225, 29, 72],
    EMERALD_600: [5, 150, 105],
    AMBER_600: [217, 119, 6]
  };

  // ==========================================
  // 1. PAGE DE GARDE
  // ==========================================
  doc.setFillColor(...COLORS.SLATE_900);
  doc.rect(0, 0, pageWidth, 110, 'F');

  if (auditorInfo?.logo) {
    try { doc.addImage(auditorInfo.logo, 'PNG', 15, 15, 40, 20); } catch (e) {}
  }

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28); doc.setFont(undefined, 'bold');
  doc.text("RAPPORT D'EXPERTISE", 15, 60);
  doc.text("TECHNIQUE & IA", 15, 75);

  doc.setFillColor(...COLORS.INDIGO_600);
  doc.rect(15, 85, 30, 2, 'F');

  doc.setFontSize(12); doc.setFont(undefined, 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text(`RÉF : ${auditorInfo?.company?.toUpperCase() || 'RISK'}-${new Date().getFullYear()}-001`, 15, 100);

  doc.setTextColor(...COLORS.SLATE_900);
  doc.setFontSize(14); doc.setFont(undefined, 'bold');
  doc.text("INFORMATIONS DU SITE", 15, 140);
  
  doc.setFontSize(11); doc.setFont(undefined, 'normal');
  doc.text([
    `Compagnie : ${auditorInfo?.company || 'Non spécifiée'}`,
    `Nom du site : ${clientName}`,
    `Adresse : ${address}`,
    `Activité : ${responses['activite_nature']?.value || 'Non spécifiée'}`,
    `Expert auditeur : ${auditorInfo?.name || 'Non spécifié'}`,
    `Date de visite : ${date}`
  ], 15, 150, { lineHeightFactor: 1.5 });

  const disclaimerText = `PRÉAMBULE : Ce document est une synthèse technique établie après visite de risque. L'analyse utilise des algorithmes d'IA pour évaluer l'exposition aux risques sismiques (CRAAG), hydrologiques (ASAL) et techniques. Ce rapport est strictement confidentiel.`;
  doc.setFillColor(...COLORS.SLATE_100);
  doc.roundedRect(15, 240, 180, 30, 2, 2, 'F');
  doc.setFontSize(8); doc.setTextColor(71, 85, 105);
  doc.text(doc.splitTextToSize(disclaimerText, 170), 20, 250);

  // ==========================================
  // 2. SOMMAIRE
  // ==========================================
  doc.addPage();
  doc.setTextColor(...COLORS.SLATE_900);
  doc.setFontSize(18); doc.setFont(undefined, 'bold');
  doc.text("SOMMAIRE", 15, 30);
  
  const sections = [
    "1. RÉSUMÉ EXÉCUTIF (DASHBOARD)",
    "2. ANALYSE ENVIRONNEMENTALE (NAT-CAT)",
    "3. ANALYSE TECHNIQUE DÉTAILLÉE PAR BRANCHE",
    "4. RELEVÉS DÉTAILLÉS DE TERRAIN",
    "5. DOCUMENTATION PHOTOGRAPHIQUE"
  ];
  
  doc.setFontSize(11); doc.setFont(undefined, 'normal');
  sections.forEach((s, i) => {
    doc.text(s, 20, 55 + (i * 15));
    doc.setDrawColor(230);
    doc.line(20, 58 + (i * 15), 190, 58 + (i * 15));
  });

  // ==========================================
  // 3. RÉSUMÉ EXÉCUTIF (DASHBOARD)
  // ==========================================
  doc.addPage();
  doc.setFontSize(14); doc.setFont(undefined, 'bold');
  doc.text("1. RÉSUMÉ EXÉCUTIF", 15, 20);

  const scoredQ = Object.values(responses).filter(r => r.isScored);
  const terrainScore = scoredQ.length ? Math.round((scoredQ.reduce((a, b) => a + (Number(b.score) || 0), 0) / (scoredQ.length * 5)) * 100) : 0;

  doc.setFillColor(...COLORS.SLATE_100);
  doc.roundedRect(15, 30, 85, 35, 4, 4, 'F');
  doc.setTextColor(...COLORS.TEXT_MAIN);
  doc.setFontSize(9); doc.text("CONFORMITÉ TERRAIN", 20, 40);
  doc.setFontSize(22); doc.text(`${terrainScore}%`, 20, 55);

  doc.setFillColor(...COLORS.SLATE_900);
  doc.roundedRect(110, 30, 85, 35, 4, 4, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9); doc.text("QUALITÉ RISQUE (IA)", 115, 40);
  doc.setFontSize(22); doc.text(`${aiResults?.score_global || '--'}%`, 115, 55);

  const chartElement = document.querySelector('canvas');
  if (chartElement) {
    const canvasImg = chartElement.toDataURL('image/png');
    doc.addImage(canvasImg, 'PNG', 55, 70, 100, 75);
  }

  if (aiResults?.synthese_executive) {
    doc.setFillColor(...COLORS.SLATE_100);
    const synthText = doc.splitTextToSize(aiResults.synthese_executive, 170);
    doc.roundedRect(15, 150, 180, (synthText.length * 5) + 15, 3, 3, 'F');
    doc.setTextColor(...COLORS.INDIGO_600); doc.setFontSize(9); doc.setFont(undefined, 'bold');
    doc.text("SYNTHÈSE GLOBALE", 20, 158);
    doc.setTextColor(...COLORS.TEXT_MAIN); doc.setFont(undefined, 'normal');
    doc.text(synthText, 20, 165);
  }

  // ==========================================
  // 4. NAT-CAT & BRANCHES (Analyses IA)
  // ==========================================
  doc.addPage();
  doc.setTextColor(...COLORS.SLATE_900);
  doc.setFontSize(14); doc.setFont(undefined, 'bold');
  doc.text("2. ANALYSE ENVIRONNEMENTALE & BRANCHES", 15, 25);

  doc.autoTable({
    startY: 35,
    head: [['ALÉA / BRANCHE', 'EXPOSITION', 'DIAGNOSTIC TECHNIQUE']],
    body: [
      ['Sismique (CRAAG)', aiResults?.analyse_nat_cat?.score_catnat + '/10', aiResults?.analyse_nat_cat?.exposition_sismique || 'N/A'],
      ['Hydrologie (ASAL)', '-', aiResults?.analyse_nat_cat?.exposition_hydrologique || 'N/A'],
      ...(aiResults?.analyses_par_garantie?.map(an => [an.garantie, `${an.exposition}/10`, an.avis_technique.substring(0, 80) + '...']) || [])
    ],
    theme: 'grid',
    headStyles: { fillColor: COLORS.SLATE_900, fontSize: 9 },
    styles: { fontSize: 8 }
  });

  // ==========================================
  // 5. RELEVÉS DE TERRAIN (RÉDACTIONNEL + BADGES)
  // ==========================================
  doc.addPage();
  doc.setFontSize(14); doc.setFont(undefined, 'bold');
  doc.text("3. RELEVÉS DÉTAILLÉS DE TERRAIN", 15, 25);
  
  let currentTY = 35;
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);

  questionsConfig.forEach(section => {
    if (currentTY > 260) { doc.addPage(); currentTY = 25; }

    doc.setFillColor(...COLORS.SLATE_100);
    doc.rect(margin, currentTY, contentWidth, 8, 'F');
    doc.setTextColor(...COLORS.INDIGO_600);
    doc.setFontSize(11); doc.setFont(undefined, 'bold');
    doc.text(section.title.toUpperCase(), margin + 3, currentTY + 6);
    currentTY += 15;

    section.questions.forEach(q => {
      const r = responses[q.id];
      if (r) {
        const fullText = `${r.value || ''}${r.comment ? ' — ' + r.comment : ''}`;
        const splitText = doc.splitTextToSize(fullText, contentWidth - 10);
        const neededHeight = (splitText.length * 5) + 12;

        if (currentTY + neededHeight > 280) { doc.addPage(); currentTY = 25; }

        // Badge de conformité (Score)
        let badgeColor = COLORS.EMERALD_600; // Vert par défaut
        if (r.score <= 2) badgeColor = COLORS.ROSE_600;
        else if (r.score <= 3) badgeColor = COLORS.AMBER_600;

        doc.setFillColor(...badgeColor);
        doc.circle(margin + 2, currentTY - 1, 1.5, 'F');

        doc.setTextColor(...COLORS.SLATE_900);
        doc.setFontSize(9); doc.setFont(undefined, 'bold');
        doc.text(q.label, margin + 6, currentTY);
        currentTY += 6;

        doc.setTextColor(...COLORS.TEXT_MAIN);
        doc.setFontSize(9); doc.setFont(undefined, 'normal');
        doc.text(splitText, margin + 6, currentTY);
        
        currentTY += (splitText.length * 5) + 6;
      }
    });
    currentTY += 5;
  });

  // ==========================================
  // 6. PHOTOS
  // ==========================================
  const allPhotos = [];
  Object.keys(responses).forEach(id => {
    if (responses[id]?.photos) {
      const q = questionsConfig.flatMap(s => s.questions).find(qu => qu.id === id);
      responses[id].photos.forEach(p => allPhotos.push({ ...p, label: q?.label || "Image" }));
    }
  });

  if (allPhotos.length > 0) {
    doc.addPage();
    doc.setFontSize(14); doc.setFont(undefined, 'bold');
    doc.text("4. DOCUMENTATION PHOTOGRAPHIQUE", 15, 25);
    let pX = 15; let pY = 40;
    allPhotos.forEach((photo, idx) => {
      if (idx > 0 && idx % 4 === 0) { doc.addPage(); pY = 25; }
      try {
        doc.addImage(photo.url, 'JPEG', pX, pY, 85, 60);
        doc.setFontSize(7); doc.setTextColor(100);
        doc.text(doc.splitTextToSize(photo.label, 80), pX, pY + 65);
      } catch (e) {}
      if ((idx + 1) % 2 === 0) { pX = 15; pY += 85; } else { pX = 110; }
    });
  }

  // --- FOOTER & SAUVEGARDE ---
  const total = doc.internal.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setFontSize(8); doc.setTextColor(150);
    doc.text(`Expertise ${clientName} - Page ${i} / ${total}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
  }

  doc.save(`RAPPORT_TECHNIQUE_${clientName.replace(/\s+/g, '_')}.pdf`);
};
