import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Exporte les résultats d'inspection en un rapport PDF structuré par l'IA.
 */
export const exportToPdf = async (responses, questionsConfig, aiResults, auditorInfo) => {
  const doc = new jsPDF();
  const date = new Date().toLocaleDateString('fr-FR');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const clientName = responses['nomination']?.value || "SITE CLIENT";
  
  // --- PALETTE DE COULEURS ---
  const COLORS = {
    SLATE_900: [15, 23, 42],     // Bleu nuit (Titres)
    INDIGO_600: [79, 70, 229],   // Indigo (Accents)
    SLATE_100: [241, 245, 249],  // Gris clair (Bandeaux)
    TEXT_MAIN: [51, 65, 85],     // Gris texte
    ROSE_600: [225, 29, 72],     // Rouge (Risque critique)
    EMERALD_600: [5, 150, 105],  // Vert (Conformité)
    AMBER_600: [217, 119, 6]      // Orange (Moyen)
  };

  // ==========================================
  // 1. PAGE DE GARDE
  // ==========================================
  doc.setFillColor(...COLORS.SLATE_900);
  doc.rect(0, 0, pageWidth, 110, 'F');

  if (auditorInfo?.logo) {
    try { doc.addImage(auditorInfo.logo, 'PNG', 15, 15, 40, 20); } catch (e) { console.error("Logo error:", e); }
  }

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(26); doc.setFont(undefined, 'bold');
  doc.text("RAPPORT D'EXPERTISE", 15, 65);
  doc.text("TECHNIQUE & IA", 15, 78);
  
  doc.setFillColor(...COLORS.INDIGO_600);
  doc.rect(15, 85, 40, 2, 'F');
  
  doc.setFontSize(11); doc.setFont(undefined, 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text(`RÉFÉRENCE : ${auditorInfo?.company?.toUpperCase() || 'RISK'}-${new Date().getFullYear()}-001`, 15, 100);

  // Infos Site
  doc.setTextColor(...COLORS.SLATE_900);
  doc.setFontSize(14); doc.setFont(undefined, 'bold');
  doc.text("INFORMATIONS DU SITE", 15, 140);
  
  doc.setFontSize(11); doc.setFont(undefined, 'normal');
  doc.setTextColor(...COLORS.TEXT_MAIN);
  const infoY = 152;
  doc.text(`Client : ${clientName}`, 15, infoY);
  doc.text(`Expert Auditeur : ${auditorInfo?.name || 'Non spécifié'}`, 15, infoY + 8);
  doc.text(`Localisation : ${responses['adress']?.value || 'Algérie'}`, 15, infoY + 16);
  doc.text(`Date de génération : ${date}`, 15, infoY + 24);

  // Disclaimer
  doc.setFillColor(...COLORS.SLATE_100);
  doc.roundedRect(15, 245, 180, 25, 2, 2, 'F');
  doc.setFontSize(8); doc.setTextColor(100);
  const disclaimer = "CONFIDENTIEL : Ce document contient des analyses basées sur des relevés terrain et des algorithmes d'IA. Il est destiné exclusivement à l'usage interne de souscription.";
  doc.text(doc.splitTextToSize(disclaimer, 170), 20, 255);

  // ==========================================
  // 2. RÉSUMÉ EXÉCUTIF (DASHBOARD)
  // ==========================================
  doc.addPage();
  doc.setTextColor(...COLORS.SLATE_900);
  doc.setFontSize(16); doc.setFont(undefined, 'bold');
  doc.text("1. RÉSUMÉ EXÉCUTIF ET IA", 15, 25);

  // Cartes de scores
  doc.setFillColor(...COLORS.SLATE_100);
  doc.roundedRect(15, 35, 85, 30, 3, 3, 'F');
  doc.setTextColor(...COLORS.TEXT_MAIN);
  doc.setFontSize(9); doc.text("SCORE DE MAÎTRISE GLOBAL", 20, 45);
  doc.setFontSize(22); doc.setTextColor(...COLORS.INDIGO_600);
  doc.text(`${aiResults?.score_global || '0'}%`, 20, 58);

  doc.setFillColor(...COLORS.SLATE_900);
  doc.roundedRect(110, 35, 85, 30, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9); doc.text("INDICE D'EXPOSITION NAT-CAT", 115, 45);
  doc.setFontSize(22); doc.text(`${aiResults?.analyse_nat_cat?.score_catnat || '0'}/10`, 115, 58);

  // Radar Chart
  const chartElement = document.querySelector('canvas');
  if (chartElement) {
    try {
      const canvasImg = chartElement.toDataURL('image/png');
      doc.addImage(canvasImg, 'PNG', 55, 80, 100, 70);
    } catch (e) { console.warn("Chart export failed", e); }
  }

  // Synthèse rédigée
  if (aiResults?.synthese_executive) {
    doc.setTextColor(...COLORS.SLATE_900);
    doc.setFontSize(11); doc.setFont(undefined, 'bold');
    doc.text("Commentaire de l'Expertise IA :", 15, 165);
    doc.setFontSize(10); doc.setFont(undefined, 'italic');
    doc.setTextColor(...COLORS.TEXT_MAIN);
    const synth = doc.splitTextToSize(aiResults.synthese_executive, 175);
    doc.text(synth, 15, 175);
  }

  // ==========================================
  // 3. RELEVÉS DÉTAILLÉS (ORGANISATION IA)
  // ==========================================
  doc.addPage();
  doc.setTextColor(...COLORS.SLATE_900);
  doc.setFontSize(16); doc.setFont(undefined, 'bold');
  doc.text("2. ANALYSE THÉMATIQUE DU TERRAIN", 15, 25);

  let currentY = 40;
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);

  // On utilise la structure narrative générée par l'IA
  const narrative = aiResults?.report_narrative || [];

  narrative.forEach((section) => {
    // Vérification saut de page
    if (currentY > 250) { doc.addPage(); currentY = 25; }

    // Titre de thématique (Ex: PROTECTION INCENDIE)
    doc.setFillColor(...COLORS.SLATE_100);
    doc.rect(margin, currentY, contentWidth, 10, 'F');
    doc.setTextColor(...COLORS.INDIGO_600);
    doc.setFontSize(11); doc.setFont(undefined, 'bold');
    doc.text(section.section_title.toUpperCase(), margin + 5, currentY + 7);
    currentY += 18;

    // Questions liées à cette thématique
    section.related_questions_ids.forEach((qId) => {
      const q = questionsConfig.flatMap(s => s.questions).find(qu => qu.id === qId);
      const r = responses[qId];

      if (r && q) {
        if (currentY > 270) { doc.addPage(); currentY = 25; }

        // Détermination couleur badge score
        let statusColor = COLORS.EMERALD_600;
        if (r.score <= 2) statusColor = COLORS.ROSE_600;
        else if (r.score <= 3) statusColor = COLORS.AMBER_600;

        // Petite puce de couleur
        doc.setFillColor(...statusColor);
        doc.circle(margin + 2, currentY - 1, 1.2, 'F');

        // Question
        doc.setTextColor(...COLORS.SLATE_900);
        doc.setFontSize(9); doc.setFont(undefined, 'bold');
        doc.text(q.label, margin + 6, currentY);
        currentY += 6;

        // Réponse et observation
        doc.setTextColor(...COLORS.TEXT_MAIN);
        doc.setFontSize(9); doc.setFont(undefined, 'normal');
        const rText = `${r.value || r.score + '/5'}${r.comment ? ' — ' + r.comment : ''}`;
        const splitRText = doc.splitTextToSize(rText, contentWidth - 10);
        doc.text(splitRText, margin + 6, currentY);
        
        currentY += (splitRText.length * 5) + 6;
      }
    });
    currentY += 5; // Espace entre sections
  });

  // ==========================================
  // 4. DOCUMENTATION PHOTOGRAPHIQUE
  // ==========================================
  const allPhotos = [];
  Object.keys(responses).forEach(id => {
    if (responses[id]?.photos) {
      const q = questionsConfig.flatMap(s => s.questions).find(qu => qu.id === id);
      responses[id].photos.forEach(p => allPhotos.push({ ...p, label: q?.label || "Illustration" }));
    }
  });

  if (allPhotos.length > 0) {
    doc.addPage();
    doc.setTextColor(...COLORS.SLATE_900);
    doc.setFontSize(16); doc.setFont(undefined, 'bold');
    doc.text("3. DOCUMENTATION PHOTOGRAPHIQUE", 15, 25);

    let pX = 15;
    let pY = 40;

    allPhotos.forEach((photo, idx) => {
      if (idx > 0 && idx % 4 === 0) { doc.addPage(); pY = 40; }
      
      try {
        doc.addImage(photo.url, 'JPEG', pX, pY, 85, 60);
        doc.setFontSize(7); doc.setTextColor(100);
        doc.text(doc.splitTextToSize(photo.label, 80), pX, pY + 65);
      } catch (e) { console.warn("Image error", e); }

      if ((idx + 1) % 2 === 0) {
        pX = 15;
        pY += 85;
      } else {
        pX = 110;
      }
    });
  }

  // --- PIED DE PAGE ET NUMÉROTATION ---
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Expertise : ${clientName} - Page ${i} sur ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
  }

  // Sauvegarde
  doc.save(`RAPPORT_IA_${clientName.replace(/\s+/g, '_')}.pdf`);
};
