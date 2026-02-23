import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const exportToPdf = async (responses, questionsConfig, aiResults, auditorInfo) => {
  try {
    const doc = new jsPDF();
    const date = new Date().toLocaleDateString('fr-FR');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const clientName = responses['nomination']?.value || "SITE CLIENT";

    // --- PALETTE DE COULEURS "TENDRES" ---
    const COLORS = {
      PRIMARY: [51, 65, 85],      // Ardoise douce (Slate 700)
      ACCENT: [100, 116, 139],    // Bleu Acier (Slate 500)
      BG_SOFT: [248, 250, 252],   // Fond très clair
      SUCCESS: [101, 163, 139],   // Sauge (Vert doux)
      WARNING: [214, 137, 85],    // Terre de Sienne (Orange doux)
      DANGER: [180, 83, 9],       // Terracotta (Rouge terreux)
      TEXT_LIGHT: [148, 163, 184] // Gris bleuté pour détails
    };

    const FONT_MAIN = "helvetica"; // Remplacez par "Montserrat" si vous avez chargé le .ttf

    // ==========================================
    // 1. PAGE DE GARDE (DESIGN ÉPURÉ)
    // ==========================================
    // Bandeau décoratif latéral ou supérieur
    doc.setFillColor(...COLORS.BG_SOFT);
    doc.rect(0, 0, pageWidth, 120, 'F');
    
    // Ligne d'accent subtile
    doc.setFillColor(...COLORS.ACCENT);
    doc.rect(0, 118, pageWidth, 2, 'F');

    if (auditorInfo?.logo) {
      try { doc.addImage(auditorInfo.logo, 'PNG', 15, 15, 35, 15); } catch (e) { }
    }

    doc.setTextColor(...COLORS.PRIMARY);
    doc.setFont(FONT_MAIN, 'bold');
    doc.setFontSize(28);
    doc.text("RAPPORT D'EXPERTISE", 20, 75);
    doc.setFont(FONT_MAIN, 'normal');
    doc.setFontSize(22);
    doc.text("Analyse de Risque Augmentée", 20, 88);
    
    // Référence
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.TEXT_LIGHT);
    doc.text(`Réf : ${clientName.toUpperCase()}-${new Date().getFullYear()}`, 20, 105);

    // Bloc Infos Client
    doc.setTextColor(...COLORS.PRIMARY);
    doc.setFontSize(14); doc.setFont(FONT_MAIN, 'bold');
    doc.text("DÉTAILS DU SITE", 20, 145);
    
    doc.setFontSize(11); doc.setFont(FONT_MAIN, 'normal');
    let infoY = 158;
    const details = [
      ["Établissement :", clientName],
      ["Activité :", responses['activite_nature']?.value || 'Industrie'],
      ["Adresse :", responses['adress']?.value || 'Algérie'],
      ["Auditeur :", auditorInfo?.name || 'Expert RiskPro']
    ];

    details.forEach(row => {
      doc.setTextColor(...COLORS.TEXT_LIGHT);
      doc.text(row[0], 20, infoY);
      doc.setTextColor(...COLORS.PRIMARY);
      doc.text(row[1], 60, infoY);
      infoY += 10;
    });

    // ==========================================
    // 2. DASHBOARD (VISUEL TENDRE)
    // ==========================================
    doc.addPage();
    doc.setTextColor(...COLORS.PRIMARY);
    doc.setFontSize(18); doc.setFont(FONT_MAIN, 'bold');
    doc.text("1. SYNTHÈSE DE LA MAÎTRISE", 20, 25);

    // Carte de score principal
    doc.setFillColor(...COLORS.BG_SOFT);
    doc.roundedRect(20, 35, 170, 40, 4, 4, 'F');
    
    doc.setFontSize(10); doc.setTextColor(...COLORS.ACCENT);
    doc.text("SCORE GLOBAL DE PRÉVENTION", 30, 50);
    
    doc.setFontSize(32); doc.setTextColor(...COLORS.PRIMARY);
    doc.text(`${aiResults?.score_global || '0'}%`, 30, 65);

    // Indice NAT-CAT avec badge de couleur
    let catScore = aiResults?.analyse_nat_cat?.score_catnat || 0;
    doc.setFillColor(...(catScore > 7 ? COLORS.DANGER : COLORS.SUCCESS));
    doc.roundedRect(130, 45, 50, 20, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8); doc.text("INDICE NAT-CAT", 135, 52);
    doc.setFontSize(14); doc.text(`${catScore}/10`, 135, 60);

    // Synthèse IA avec bordure douce
    if (aiResults?.synthese_executive) {
      doc.setDrawColor(...COLORS.BG_SOFT);
      doc.setLineWidth(0.5);
      doc.line(20, 85, 190, 85);
      
      doc.setTextColor(...COLORS.PRIMARY);
      doc.setFontSize(11); doc.setFont(FONT_MAIN, 'bold');
      doc.text("Analyse Contextuelle :", 20, 100);
      
      doc.setFontSize(10); doc.setFont(FONT_MAIN, 'normal');
      doc.setTextColor(...COLORS.PRIMARY);
      const synth = doc.splitTextToSize(aiResults.synthese_executive, 170);
      doc.text(synth, 20, 110);
    }

    // ==========================================
    // 3. ANALYSE DÉTAILLÉE (REFORMULÉE)
    // ==========================================
    doc.addPage();
    doc.setFontSize(16); doc.setFont(FONT_MAIN, 'bold');
    doc.text("2. EXAMEN THÉMATIQUE", 20, 25);

    let currentY = 40;
    const narrative = aiResults?.report_narrative || [];

    narrative.forEach((section) => {
      if (currentY > 240) { doc.addPage(); currentY = 25; }

      // Header de section "Tendre"
      doc.setFillColor(...COLORS.BG_SOFT);
      doc.rect(20, currentY, 170, 8, 'F');
      doc.setTextColor(...COLORS.ACCENT);
      doc.setFontSize(10); doc.setFont(FONT_MAIN, 'bold');
      doc.text(section.section_title.toUpperCase(), 25, currentY + 6);
      currentY += 15;

      (section.questions_reformulees || []).forEach((qObj) => {
        if (currentY > 260) { doc.addPage(); currentY = 25; }

        doc.setTextColor(...COLORS.PRIMARY);
        doc.setFontSize(9); doc.setFont(FONT_MAIN, 'bold');
        doc.text(qObj.label, 20, currentY);
        currentY += 5;

        doc.setTextColor(...COLORS.PRIMARY);
        doc.setFontSize(9); doc.setFont(FONT_MAIN, 'normal');
        const text = qObj.obs_pro || "RAS.";
        const splitText = doc.splitTextToSize(text, 170);
        doc.text(splitText, 20, currentY);
        
        currentY += (splitText.length * 5) + 8;
      });
      currentY += 5;
    });

    // ==========================================
    // 4. PHOTOS (GRILLE MODERNE)
    // ==========================================
    // ... (Logique photo identique à la précédente mais avec COLORS.TEXT_LIGHT pour les labels)
    const allPhotos = [];
    Object.keys(responses).forEach(id => {
      if (responses[id]?.photos?.length > 0) {
        const q = questionsConfig.flatMap(s => s.questions).find(qu => qu.id === id);
        responses[id].photos.forEach(p => allPhotos.push({ url: p.url, label: q?.label || "Illustration" }));
      }
    });

    if (allPhotos.length > 0) {
      doc.addPage();
      doc.setTextColor(...COLORS.PRIMARY);
      doc.setFontSize(16); doc.text("3. ANNEXE PHOTOGRAPHIQUE", 20, 25);
      
      let pX = 20, pY = 40;
      allPhotos.forEach((photo, idx) => {
        if (pY > 240) { doc.addPage(); pY = 30; }
        try {
          doc.addImage(photo.url, 'JPEG', pX, pY, 80, 55, undefined, 'FAST');
          doc.setFontSize(7); doc.setTextColor(...COLORS.TEXT_LIGHT);
          doc.text(doc.splitTextToSize(photo.label, 80), pX, pY + 60);
        } catch (e) { }
        
        if ((idx + 1) % 2 === 0) { pX = 20; pY += 75; } else { pX = 110; }
      });
    }

    // --- FOOTER ---
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8); doc.setTextColor(...COLORS.TEXT_LIGHT);
      doc.text(`Expertise ${clientName} — Page ${i}/${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    }

    doc.save(`Expertise_${clientName.replace(/\s+/g, '_')}.pdf`);

  } catch (error) {
    console.error("Erreur PDF:", error);
    alert("Erreur lors de la génération du PDF.");
  }
};
