import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const exportToPdf = async (responses, questionsConfig, aiResults, auditorInfo) => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const clientName = responses['nomination']?.value || "SITE CLIENT";

    const COLORS = {
      SLATE: [51, 65, 85],
      STEEL: [100, 116, 139],
      SOFT: [248, 250, 252],
      SAGE: [101, 163, 139]
    };

    const FONT = "helvetica"; // Prêt pour Montserrat

    // 1. PAGE DE GARDE
    doc.setFillColor(...COLORS.SOFT);
    doc.rect(0, 0, pageWidth, 120, 'F');
    doc.setTextColor(...COLORS.SLATE);
    doc.setFont(FONT, 'bold');
    doc.setFontSize(28);
    doc.text("RAPPORT D'EXPERTISE", 20, 75);
    
    doc.setFontSize(14);
    doc.setFont(FONT, 'normal');
    doc.setTextColor(...COLORS.STEEL);
    doc.text(`ANALYSE DE RISQUE : ${clientName}`, 20, 88);

    // 2. RÉSUMÉ EXÉCUTIF
    doc.addPage();
    doc.setTextColor(...COLORS.SLATE);
    doc.setFontSize(18); doc.setFont(FONT, 'bold');
    doc.text("1. SYNTHÈSE GLOBALE", 20, 25);

    doc.setFillColor(...COLORS.SOFT);
    doc.roundedRect(20, 35, 170, 40, 5, 5, 'F');
    doc.setFontSize(32);
    doc.text(`${aiResults.score_global}%`, 35, 65);
    doc.setFontSize(9); doc.setTextColor(...COLORS.STEEL);
    doc.text("INDICE DE MAÎTRISE DU RISQUE", 35, 48);

    // 3. CORPS DU RAPPORT (Narrative IA)
    doc.addPage();
    doc.setTextColor(...COLORS.SLATE);
    doc.setFontSize(18); doc.setFont(FONT, 'bold');
    doc.text("2. EXAMEN TECHNIQUE", 20, 25);

    let currentY = 40;
    (aiResults.report_narrative || []).forEach((section) => {
      if (currentY > 240) { doc.addPage(); currentY = 25; }

      // Titre Section
      doc.setFillColor(...COLORS.SOFT);
      doc.rect(20, currentY, 170, 8, 'F');
      doc.setTextColor(...COLORS.STEEL);
      doc.setFontSize(10); doc.setFont(FONT, 'bold');
      doc.text(section.section_title.toUpperCase(), 25, currentY + 6);
      currentY += 15;

      section.questions_reformulees?.forEach((q) => {
        if (currentY > 260) { doc.addPage(); currentY = 25; }
        doc.setTextColor(...COLORS.SLATE);
        doc.setFontSize(9); doc.setFont(FONT, 'bold');
        doc.text(q.label, 20, currentY);
        currentY += 5;
        
        doc.setFont(FONT, 'normal');
        const splitText = doc.splitTextToSize(q.obs_pro, 170);
        doc.text(splitText, 20, currentY);
        currentY += (splitText.length * 5) + 8;
      });
      currentY += 5;
    });

    // 4. PHOTOS
    const allPhotos = [];
    Object.keys(responses).forEach(id => {
      if (responses[id]?.photos?.length > 0) {
        const q = questionsConfig.flatMap(s => s.questions).find(qu => qu.id === id);
        responses[id].photos.forEach(p => allPhotos.push({ url: p.url, label: q?.label || "Illustration" }));
      }
    });

    if (allPhotos.length > 0) {
      doc.addPage();
      doc.setFontSize(18); doc.text("3. ANNEXE PHOTOS", 20, 25);
      let pX = 20, pY = 40;
      allPhotos.forEach((photo, idx) => {
        if (pY > 240) { doc.addPage(); pY = 30; }
        try { doc.addImage(photo.url, 'JPEG', pX, pY, 80, 55); } catch (e) {}
        if ((idx + 1) % 2 === 0) { pX = 20; pY += 70; } else { pX = 110; }
      });
    }

    doc.save(`Rapport_RiskPro_${clientName.replace(/\s+/g, '_')}.pdf`);
  } catch (error) {
    console.error(error);
  }
};
