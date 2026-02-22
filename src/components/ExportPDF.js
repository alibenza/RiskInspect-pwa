import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const exportToPdf = async (responses, questionsConfig, aiResults, auditorInfo) => {
  const doc = new jsPDF();
  const date = new Date().toLocaleDateString();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const clientName = responses['nomination']?.value || "SITE CLIENT";
  
  const COLORS = {
    SLATE_900: [15, 23, 42],
    INDIGO_600: [79, 70, 229],
    SLATE_100: [241, 245, 249],
    TEXT_MAIN: [51, 65, 85],
    ROSE_600: [225, 29, 72],
    EMERALD_600: [5, 150, 105],
    AMBER_600: [217, 119, 6]
  };

  // 1. PAGE DE GARDE
  doc.setFillColor(...COLORS.SLATE_900);
  doc.rect(0, 0, pageWidth, 110, 'F');
  if (auditorInfo?.logo) try { doc.addImage(auditorInfo.logo, 'PNG', 15, 15, 40, 20); } catch (e) {}

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(26); doc.setFont(undefined, 'bold');
  doc.text("RAPPORT D'EXPERTISE TECHNIQUE", 15, 65);
  doc.setFillColor(...COLORS.INDIGO_600); doc.rect(15, 75, 40, 2, 'F');
  
  doc.setFontSize(12); doc.setFont(undefined, 'normal');
  doc.text(`RÉF : RISK-${new Date().getFullYear()}-001`, 15, 95);

  doc.setTextColor(...COLORS.SLATE_900);
  doc.setFontSize(14); doc.setFont(undefined, 'bold');
  doc.text("INFORMATIONS GÉNÉRALES", 15, 140);
  doc.setFontSize(10); doc.setFont(undefined, 'normal');
  doc.text([
    `Site : ${clientName}`,
    `Expert : ${auditorInfo?.name || 'Non spécifié'}`,
    `Date : ${date}`,
    `Localisation : ${responses['adress']?.value || 'Algérie'}`
  ], 15, 150, { lineHeightFactor: 1.5 });

  // 2. RÉSUMÉ IA (DASHBOARD STYLE)
  doc.addPage();
  doc.setFontSize(14); doc.setFont(undefined, 'bold');
  doc.text("1. SYNTHÈSE DES RISQUES (IA)", 15, 25);
  
  doc.setFillColor(...COLORS.SLATE_100); doc.roundedRect(15, 35, 85, 30, 3, 3, 'F');
  doc.setTextColor(...COLORS.TEXT_MAIN); doc.setFontSize(9); doc.text("SCORE MAÎTRISE", 20, 45);
  doc.setFontSize(20); doc.text(`${aiResults.score_global}%`, 20, 58);

  doc.setFillColor(...COLORS.SLATE_900); doc.roundedRect(110, 35, 85, 30, 3, 3, 'F');
  doc.setTextColor(255, 255, 255); doc.setFontSize(9); doc.text("INDICE CATNAT", 115, 45);
  doc.setFontSize(20); doc.text(`${aiResults.analyse_nat_cat?.score_catnat || 0}/10`, 115, 58);

  const chartElement = document.querySelector('canvas');
  if (chartElement) {
    const canvasImg = chartElement.toDataURL('image/png');
    doc.addImage(canvasImg, 'PNG', 55, 75, 100, 70);
  }

  // 3. ANALYSE THÉMATIQUE (L'IA ORGANISE LES PARAGRAPHES)
  doc.addPage();
  doc.setTextColor(...COLORS.SLATE_900);
  doc.setFontSize(14); doc.setFont(undefined, 'bold');
  doc.text("2. ANALYSE DÉTAILLÉE DU TERRAIN", 15, 25);
  
  let currentY = 35;
  aiResults.report_narrative.forEach(section => {
    if (currentY > 240) { doc.addPage(); currentY = 25; }
    
    doc.setFillColor(...COLORS.SLATE_100);
    doc.rect(15, currentY, 180, 8, 'F');
    doc.setTextColor(...COLORS.INDIGO_600);
    doc.setFontSize(10); doc.text(section.section_title.toUpperCase(), 20, currentY + 5.5);
    currentY += 15;

    section.related_questions_ids.forEach(qId => {
      const q = questionsConfig.flatMap(s => s.questions).find(qu => qu.id === qId);
      const r = responses[qId];
      if (r && q) {
        if (currentY > 260) { doc.addPage(); currentY = 25; }
        
        // Badge de score
        const color = r.score >= 4 ? COLORS.EMERALD_600 : (r.score === 3 ? COLORS.AMBER_600 : COLORS.ROSE_600);
        doc.setFillColor(...color); doc.circle(18, currentY - 1, 1.2, 'F');

        doc.setTextColor(...COLORS.SLATE_900); doc.setFont(undefined, 'bold');
        doc.setFontSize(9); doc.text(q.label, 23, currentY);
        currentY += 5;
        
        doc.setTextColor(...COLORS.TEXT_MAIN); doc.setFont(undefined, 'normal');
        const desc = doc.splitTextToSize(`${r.value || r.score + '/5'} — ${r.comment || ''}`, 165);
        doc.text(desc, 23, currentY);
        currentY += (desc.length * 5) + 6;
      }
    });
    currentY += 5;
  });

  // 4. PHOTOS
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
    doc.text("3. DOCUMENTATION PHOTOGRAPHIQUE", 15, 25);
    let pX = 15, pY = 40;
    allPhotos.forEach((photo, idx) => {
      if (idx > 0 && idx % 4 === 0) { doc.addPage(); pY = 40; }
      try {
        doc.addImage(photo.url, 'JPEG', pX, pY, 85, 60);
        doc.setFontSize(7); doc.text(doc.splitTextToSize(photo.label, 80), pX, pY + 65);
      } catch (e) {}
      if ((idx + 1) % 2 === 0) { pX = 15; pY += 80; } else { pX = 110; }
    });
  }

  // FOOTER
  const total = doc.internal.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setFontSize(8); doc.setTextColor(150);
    doc.text(`Page ${i} / ${total} - Confidentiel ${clientName}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
  }

  doc.save(`RAPPORT_${clientName.replace(/\s+/g, '_')}.pdf`);
};
