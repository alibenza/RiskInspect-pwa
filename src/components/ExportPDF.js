import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';

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
    ROSE_600: [225, 29, 72]
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

  // Infos site (milieu de page)
  doc.setTextColor(...COLORS.SLATE_900);
  doc.setFontSize(14); doc.setFont(undefined, 'bold');
  doc.text("INFORMATIONS DU SITE", 15, 140);
  
  doc.setFontSize(11); doc.setFont(undefined, 'normal');
  doc.text([
    `Nom du site : ${clientName}`,
    `Adresse : ${address}`,
    `Activité : ${responses['activite_nature']?.value || 'Non spécifiée'}`,
    `Date de visite : ${date}`,
    `Expert auditeur : ${auditorInfo?.name || 'Non spécifié'}`
  ], 15, 150, { lineHeightFactor: 1.5 });

  // Préambule (bas de page)
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
    "4. RELEVÉS DE TERRAIN & CONFORMITÉ",
    "5. DOCUMENTATION PHOTOGRAPHIQUE"
  ];
  
  doc.setFontSize(11); doc.setFont(undefined, 'normal');
  sections.forEach((s, i) => {
    doc.text(s, 20, 50 + (i * 12));
    doc.line(20, 53 + (i * 12), 190, 53 + (i * 12));
  });

  // ==========================================
  // 3. RÉSUMÉ EXÉCUTIF (DASHBOARD STYLE)
  // ==========================================
  doc.addPage();
  doc.setFontSize(14); doc.setFont(undefined, 'bold');
  doc.text("1. RÉSUMÉ EXÉCUTIF (DASHBOARD)", 15, 20);

  // Cartes de scores
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

  // Graphique Radar
  const chartElement = document.querySelector('canvas');
  if (chartElement) {
    const canvasImg = chartElement.toDataURL('image/png');
    doc.addImage(canvasImg, 'PNG', 55, 75, 100, 60);
  }

  // Points de vigilance (Box Rouge)
  if (aiResults?.points_vigilance_majeurs) {
    doc.setFillColor(255, 241, 242);
    doc.setDrawColor(...COLORS.ROSE_600);
    doc.roundedRect(15, 140, 180, 45, 3, 3, 'FD');
    doc.setTextColor(...COLORS.ROSE_600);
    doc.setFontSize(10); doc.setFont(undefined, 'bold');
    doc.text("POINTS DE VIGILANCE CRITIQUES", 20, 148);
    doc.setFontSize(8); doc.setFont(undefined, 'normal');
    doc.setTextColor(159, 18, 57);
    const points = aiResults.points_vigilance_majeurs.slice(0, 3).join(" / ");
    doc.text(doc.splitTextToSize(points, 170), 20, 155);
  }

  // ==========================================
  // 4. ANALYSE NAT-CAT
  // ==========================================
  doc.addPage();
  doc.setTextColor(...COLORS.SLATE_900);
  doc.setFontSize(14); doc.setFont(undefined, 'bold');
  doc.text("2. ANALYSE ENVIRONNEMENTALE (NAT-CAT)", 15, 25);

  doc.setFillColor(...COLORS.SLATE_100);
  doc.roundedRect(15, 35, 180, 40, 2, 2, 'F');
  doc.setFontSize(9); doc.setFont(undefined, 'normal');
  const geol = aiResults?.analyse_nat_cat?.synthese_geologique || "Analyse indisponible";
  doc.text(doc.splitTextToSize(geol, 170), 20, 45);

  // Grille Sismique/Hydrologique
  doc.autoTable({
    startY: 85,
    head: [['ALÉA NATUREL', 'EXPOSITION & RÉFÉRENCE']],
    body: [
      ['EXPOSITION SISMIQUE (CRAAG)', aiResults?.analyse_nat_cat?.exposition_sismique || 'N/A'],
      ['RISQUE HYDROLOGIQUE (ASAL)', aiResults?.analyse_nat_cat?.exposition_hydrologique || 'N/A'],
      ['SCORE GLOBAL CAT-NAT', `${aiResults?.analyse_nat_cat?.score_catnat || 0}/10`]
    ],
    theme: 'striped',
    headStyles: { fillColor: COLORS.SLATE_900 }
  });

  // ==========================================
  // 5. ANALYSE PAR BRANCHE (STYLE CONSOLE IA)
  // ==========================================
  doc.addPage();
  doc.setFontSize(14); doc.setFont(undefined, 'bold');
  doc.text("3. ANALYSE TECHNIQUE PAR BRANCHE", 15, 25);

  let currentY = 35;
  aiResults?.analyses_par_garantie?.forEach(an => {
    if (currentY > 240) { doc.addPage(); currentY = 25; }
    
    // Header branche
    doc.setFillColor(...COLORS.SLATE_900);
    doc.rect(15, currentY, 180, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10); doc.text(an.garantie.toUpperCase(), 20, currentY + 5.5);
    
    // Avis
    doc.setTextColor(...COLORS.TEXT_MAIN);
    doc.setFontSize(9); doc.setFont(undefined, 'normal');
    const avis = doc.splitTextToSize(`Expertise : ${an.avis_technique}`, 175);
    doc.text(avis, 15, currentY + 15);
    
    currentY += (avis.length * 5) + 18;
    
    // Préconisation
    doc.setFillColor(238, 242, 255);
    const preco = doc.splitTextToSize(`PRÉCONISATION : ${an.recommandations_standards}`, 170);
    doc.roundedRect(15, currentY - 5, 180, (preco.length * 5) + 6, 1, 1, 'F');
    doc.setTextColor(...COLORS.INDIGO_600); doc.setFont(undefined, 'bold');
    doc.text(preco, 20, currentY);
    
    currentY += (preco.length * 5) + 15;
  });

  // ==========================================
  // 6. RELEVÉS DE TERRAIN
  // ==========================================
  doc.addPage();
  doc.setTextColor(...COLORS.SLATE_900);
  doc.setFontSize(14); doc.setFont(undefined, 'bold');
  doc.text("4. RELEVÉS DE TERRAIN", 15, 25);

  const tableData = [];
  questionsConfig.forEach(section => {
    tableData.push([{ content: section.title, colSpan: 2, styles: { fillColor: COLORS.SLATE_100, fontStyle: 'bold' } }]);
    section.questions.forEach(q => {
      const r = responses[q.id];
      if (r) tableData.push([q.label, r.value || `${r.score}/5`]);
    });
  });

  doc.autoTable({
    startY: 35,
    body: tableData,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2 }
  });

  // ==========================================
  // 7. PHOTOS (GRID 2x2)
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
    doc.setFontSize(14); doc.text("5. DOCUMENTATION PHOTOGRAPHIQUE", 15, 25);
    let pX = 15; let pY = 40;
    allPhotos.forEach((photo, idx) => {
      if (idx > 0 && idx % 4 === 0) { doc.addPage(); pY = 25; }
      try {
        doc.addImage(photo.url, 'JPEG', pX, pY, 85, 60);
        doc.setFontSize(7); doc.text(doc.splitTextToSize(photo.label, 80), pX, pY + 65);
      } catch (e) {}
      if ((idx + 1) % 2 === 0) { pX = 15; pY += 80; } else { pX = 110; }
    });
  }

  // --- NUMÉROTATION DE PAGES ---
  const total = doc.internal.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setFontSize(8); doc.setTextColor(150);
    doc.text(`Page ${i} / ${total}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
  }

  doc.save(`RAPPORT_RISQUE_${clientName.replace(/\s+/g, '_')}.pdf`);
};
