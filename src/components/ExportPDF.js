import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const exportToPdf = async (responses, questionsConfig, aiResults, auditorInfo) => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const clientName = responses['nomination']?.value || "SITE CLIENT";

    const COLORS = {
      SLATE: [51, 65, 85],   // Slate 700
      NAVY: [15, 23, 42],    // Slate 900
      STEEL: [100, 116, 139],
      INDIGO: [79, 70, 229],
      SOFT: [248, 250, 252],
      ROSE: [225, 29, 72]
    };

    const FONT = "helvetica";

    // --- 1. PAGE DE GARDE ---
    doc.setFillColor(...COLORS.NAVY);
    doc.rect(0, 0, pageWidth, 140, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont(FONT, 'bold');
    doc.setFontSize(32);
    doc.text("RAPPORT D'EXPERTISE", 20, 80);
    doc.setFontSize(28);
    doc.text("RISQUES IARD", 20, 95);
    
    doc.setFontSize(14);
    doc.setFont(FONT, 'normal');
    doc.setTextColor(...COLORS.STEEL);
    doc.text(`CLIENT : ${clientName.toUpperCase()}`, 20, 115);
    doc.text(`DATE : ${new Date().toLocaleDateString()}`, 20, 122);

    // --- 2. RÉSUMÉ EXÉCUTIF & SCORE ---
    doc.addPage();
    doc.setTextColor(...COLORS.NAVY);
    doc.setFontSize(18); doc.setFont(FONT, 'bold');
    doc.text("1. SYNTHÈSE DÉCISIONNELLE", 20, 25);

    // Bloc Score
    doc.setFillColor(...COLORS.SOFT);
    doc.roundedRect(20, 35, 170, 35, 3, 3, 'F');
    doc.setFontSize(36); doc.setTextColor(...COLORS.INDIGO);
    doc.text(`${aiResults.score_global}%`, 30, 62);
    doc.setFontSize(10); doc.setTextColor(...COLORS.STEEL);
    doc.text("INDICE DE MAÎTRISE GLOBALE", 30, 45);

    // Texte Synthèse
    doc.setTextColor(...COLORS.SLATE);
    doc.setFontSize(10); doc.setFont(FONT, 'normal');
    const splitSynth = doc.splitTextToSize(aiResults.synthese_executive, 160);
    doc.text(splitSynth, 20, 85);

    // --- 3. ANALYSE NAT-CAT (SPÉCIFIQUE ALGÉRIE) ---
    let currentY = 130;
    doc.setFontSize(14); doc.setFont(FONT, 'bold');
    doc.text("2. ANALYSE DES RISQUES NATURELS (CAT-NAT)", 20, currentY);
    
    const natCatData = [
      ["Sismique (CRAAG/RPA)", aiResults.analyse_nat_cat?.exposition_sismique],
      ["Hydrologique (Oueds)", aiResults.analyse_nat_cat?.exposition_hydrologique],
      ["Géologie/Sols", aiResults.analyse_nat_cat?.synthese_geologique]
    ];

    doc.autoTable({
      startY: currentY + 5,
      head: [['Périmètre', 'Analyse Technique de l\'Expert']],
      body: natCatData,
      theme: 'grid',
      headStyles: { fillColor: COLORS.NAVY },
      styles: { fontSize: 9, cellPadding: 4 }
    });

    // --- 4. ANALYSE PAR GARANTIE ---
    doc.addPage();
    doc.setFontSize(14); doc.setFont(FONT, 'bold');
    doc.text("3. ANALYSE DÉTAILLÉE PAR GARANTIE", 20, 25);

    const garantieRows = aiResults.analyses_par_garantie?.map(g => [
      g.garantie,
      `${g.exposition}/10`,
      g.avis_technique,
      g.recommandations.join('\n• ')
    ]);

    doc.autoTable({
      startY: 35,
      head: [['Garantie', 'Exp.', 'Analyse du Sousripteur', 'Mesures de Prévention']],
      body: garantieRows,
      theme: 'striped',
      headStyles: { fillColor: COLORS.INDIGO },
      styles: { fontSize: 8, cellPadding: 3 },
      columnStyles: { 3: { cellWidth: 60 } }
    });

    // --- 5. CONSTATATIONS DE TERRAIN (RÉPONSES PERFECTIONNÉES) ---
    doc.addPage();
    doc.setFontSize(14); doc.setFont(FONT, 'bold');
    doc.text("4. CONSTATATIONS DÉTAILLÉES", 20, 25);
    
    currentY = 40;
    questionsConfig.forEach(section => {
      // Titre de section
      if (currentY > 260) { doc.addPage(); currentY = 25; }
      doc.setFillColor(...COLORS.SOFT);
      doc.rect(20, currentY, 170, 7, 'F');
      doc.setFontSize(9); doc.setTextColor(...COLORS.STEEL);
      doc.text(section.title.toUpperCase(), 25, currentY + 5);
      currentY += 15;

      section.questions.forEach(q => {
        const resp = responses[q.id];
        if (resp?.comment && resp.comment !== 'RAS') {
          if (currentY > 260) { doc.addPage(); currentY = 25; }
          doc.setFontSize(9); doc.setFont(FONT, 'bold'); doc.setTextColor(...COLORS.NAVY);
          doc.text(q.label, 20, currentY);
          currentY += 5;
          
          doc.setFont(FONT, 'normal'); doc.setTextColor(...COLORS.SLATE);
          const splitObs = doc.splitTextToSize(resp.comment, 165);
          doc.text(splitObs, 25, currentY);
          currentY += (splitObs.length * 5) + 7;
        }
      });
    });

    // --- 6. ANNEXE PHOTOS ---
    const allPhotos = [];
    Object.keys(responses).forEach(id => {
      if (responses[id]?.photos?.length > 0) {
        const q = questionsConfig.flatMap(s => s.questions).find(qu => qu.id === id);
        responses[id].photos.forEach(p => allPhotos.push({ url: p.url, label: q?.label || "Illustration" }));
      }
    });

    if (allPhotos.length > 0) {
      doc.addPage();
      doc.setTextColor(...COLORS.NAVY);
      doc.setFontSize(14); doc.setFont(FONT, 'bold');
      doc.text("5. ANNEXE PHOTOGRAPHIQUE", 20, 25);
      
      let pX = 20, pY = 40;
      allPhotos.forEach((photo, idx) => {
        if (pY > 230) { doc.addPage(); pY = 30; }
        
        try { 
          doc.addImage(photo.url, 'JPEG', pX, pY, 80, 55); 
          doc.setFontSize(7); doc.setTextColor(...COLORS.STEEL);
          doc.text(photo.label, pX, pY + 60);
        } catch (e) { console.error("Erreur image PDF", e); }

        if ((idx + 1) % 2 === 0) { pX = 20; pY += 75; } else { pX = 110; }
      });
    }

    // --- PIED DE PAGE ---
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(...COLORS.STEEL);
      doc.text(`Expertise RiskPro AI - Confidentiel - Page ${i} / ${pageCount}`, pageWidth / 2, 285, { align: 'center' });
    }

    doc.save(`Expertise_${clientName.replace(/\s+/g, '_')}.pdf`);
  } catch (error) {
    console.error("Erreur Export PDF:", error);
    alert("Erreur lors de la génération du PDF.");
  }
};
