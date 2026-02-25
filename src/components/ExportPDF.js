import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const exportToPdf = async (responses, questionsConfig, aiResults, auditorInfo) => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const clientName = responses['nomination']?.value || "SITE CLIENT";

    // --- PALETTE COULEURS CIAR ---
    const COLORS = {
      CIAR_BLUE: [0, 51, 153],    // Bleu institutionnel CIAR
      CIAR_RED: [227, 6, 19],     // Rouge CIAR
      NAVY: [15, 23, 42],
      TEXT: [31, 41, 55],
      STEEL: [100, 116, 139],
      SOFT_BG: [248, 250, 252]
    };

    const FONT = "helvetica";

    // --- 1. PAGE DE GARDE ---
    // Bandeau latéral décoratif aux couleurs CIAR
    doc.setFillColor(...COLORS.CIAR_BLUE);
    doc.rect(0, 0, 15, 297, 'F'); 
    
    // Logo CIAR (si présent dans auditorInfo ou via une URL/Base64)
    if (auditorInfo?.logo) {
      try {
        doc.addImage(auditorInfo.logo, 'PNG', 150, 20, 40, 20);
      } catch (e) { console.log("Logo introuvable"); }
    }

    doc.setTextColor(...COLORS.CIAR_BLUE);
    doc.setFont(FONT, 'bold');
    doc.setFontSize(28);
    doc.text("RAPPORT D'EXPERTISE", 25, 80);
    
    doc.setTextColor(...COLORS.CIAR_RED);
    doc.setFontSize(24);
    doc.text("ÉVALUATION DES RISQUES IARD", 25, 92);
    
    // Ligne de séparation
    doc.setDrawColor(...COLORS.CIAR_BLUE);
    doc.setLineWidth(1);
    doc.line(25, 105, 120, 105);

    // Informations clés
    doc.setFontSize(12);
    doc.setFont(FONT, 'bold');
    doc.setTextColor(...COLORS.TEXT);
    doc.text("ENTREPRISE / SITE :", 25, 125);
    doc.setFont(FONT, 'normal');
    doc.text(clientName.toUpperCase(), 75, 125);

    doc.setFont(FONT, 'bold');
    doc.text("DATE DE LA VISITE :", 25, 135);
    doc.setFont(FONT, 'normal');
    const visitDate = auditorInfo?.inspectionDate 
      ? new Date(auditorInfo.inspectionDate).toLocaleDateString('fr-FR')
      : "Non spécifiée";
    doc.text(visitDate, 75, 135);

    doc.setFont(FONT, 'bold');
    doc.text("EXPERT CHARGÉ :", 25, 145);
    doc.setFont(FONT, 'normal');
    doc.text((auditorInfo?.name || "Expert RiskPro").toUpperCase(), 75, 145);

    doc.setFont(FONT, 'bold');
    doc.text("ÉDITION DU RAPPORT :", 25, 155);
    doc.setFont(FONT, 'normal');
    doc.text(new Date().toLocaleDateString('fr-FR'), 75, 155);

    // --- 2. RÉSUMÉ EXÉCUTIF & SCORE CIAR ---
    doc.addPage();
    doc.setTextColor(...COLORS.CIAR_BLUE);
    doc.setFontSize(16); doc.setFont(FONT, 'bold');
    doc.text("1. SYNTHÈSE DÉCISIONNELLE", 20, 25);

    // Bloc Score Rouge CIAR
    doc.setFillColor(...COLORS.SOFT_BG);
    doc.roundedRect(20, 35, 170, 40, 4, 4, 'F');
    
    doc.setFontSize(42); doc.setTextColor(...COLORS.CIAR_RED);
    doc.text(`${aiResults.score_global}%`, 30, 65);
    
    doc.setFontSize(10); doc.setTextColor(...COLORS.CIAR_BLUE);
    doc.setFont(FONT, 'bold');
    doc.text("INDICE DE CONFORMITÉ & MAÎTRISE DU RISQUE", 30, 45);

    // Texte Synthèse
    doc.setTextColor(...COLORS.TEXT);
    doc.setFontSize(10); doc.setFont(FONT, 'normal');
    const splitSynth = doc.splitTextToSize(aiResults.synthese_executive, 165);
    doc.text(splitSynth, 20, 90);

    // --- 3. ANALYSE NAT-CAT ---
    let currentY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 20 : 140;
    doc.setTextColor(...COLORS.CIAR_BLUE);
    doc.setFontSize(14); doc.setFont(FONT, 'bold');
    doc.text("2. EXPOSITION AUX RISQUES NATURELS", 20, currentY);
    
    const natCatData = [
      ["Sismique (Zonage CRAAG)", aiResults.analyse_nat_cat?.exposition_sismique],
      ["Inondation / Hydrologie", aiResults.analyse_nat_cat?.exposition_hydrologique],
      ["Géologie & Sols", aiResults.analyse_nat_cat?.synthese_geologique]
    ];

    doc.autoTable({
      startY: currentY + 5,
      head: [['Périmètre', 'Analyse Technique CIAR']],
      body: natCatData,
      theme: 'grid',
      headStyles: { fillColor: COLORS.CIAR_BLUE },
      styles: { fontSize: 9, cellPadding: 5 }
    });

    // --- 4. ANALYSE PAR GARANTIE (STYLE CIAR) ---
    doc.addPage();
    doc.setTextColor(...COLORS.CIAR_BLUE);
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
      head: [['Garantie', 'Note Risque', 'Commentaire Souscription', 'Préconisations']],
      body: garantieRows,
      theme: 'striped',
      headStyles: { fillColor: COLORS.CIAR_BLUE },
      styles: { fontSize: 8, cellPadding: 4 },
      columnStyles: { 0: { fontStyle: 'bold' }, 3: { cellWidth: 70 } }
    });

    // --- 5. CONSTATATIONS DE TERRAIN ---
    doc.addPage();
    doc.setFontSize(14); doc.setFont(FONT, 'bold');
    doc.text("4. CONSTATATIONS DÉTAILLÉES DE L'EXPERT", 20, 25);
    
    currentY = 40;
    questionsConfig.forEach(section => {
      if (currentY > 250) { doc.addPage(); currentY = 25; }
      
      // En-tête de section style CIAR
      doc.setFillColor(...COLORS.SOFT_BG);
      doc.rect(20, currentY, 170, 8, 'F');
      doc.setDrawColor(...COLORS.CIAR_RED);
      doc.line(20, currentY, 20, currentY + 8); // Petite barre rouge latérale
      
      doc.setFontSize(9); doc.setTextColor(...COLORS.CIAR_BLUE); doc.setFont(FONT, 'bold');
      doc.text(section.title.toUpperCase(), 25, currentY + 6);
      currentY += 15;

      section.questions.forEach(q => {
        const resp = responses[q.id];
        if (resp?.comment && resp.comment !== 'RAS') {
          if (currentY > 250) { doc.addPage(); currentY = 25; }
          
          doc.setFontSize(9); doc.setFont(FONT, 'bold'); doc.setTextColor(...COLORS.CIAR_BLUE);
          doc.text(q.label, 20, currentY);
          currentY += 5;
          
          doc.setFont(FONT, 'normal'); doc.setTextColor(...COLORS.TEXT);
          const splitObs = doc.splitTextToSize(resp.comment, 160);
          doc.text(splitObs, 25, currentY);
          currentY += (splitObs.length * 5) + 8;
        }
      });
    });

    // --- 6. PHOTOS AVEC FILIGRANE ---
    const allPhotos = [];
    Object.keys(responses).forEach(id => {
      if (responses[id]?.photos?.length > 0) {
        const q = questionsConfig.flatMap(s => s.questions).find(qu => qu.id === id);
        responses[id].photos.forEach(p => allPhotos.push({ url: p.url, label: q?.label || "Preuve terrain" }));
      }
    });

    if (allPhotos.length > 0) {
      doc.addPage();
      doc.setTextColor(...COLORS.CIAR_BLUE);
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
// --- 7. SECTION SIGNATURES ---
    doc.addPage();
    doc.setTextColor(...COLORS.CIAR_BLUE);
    doc.setFontSize(14); doc.setFont(FONT, 'bold');
    doc.text("6. VALIDATION ET SIGNATURES", 20, 25);

    // Bloc Avis Final
    doc.setFillColor(...COLORS.SOFT_BG);
    doc.roundedRect(20, 35, 170, 40, 3, 3, 'F');
    doc.setFontSize(10); doc.setTextColor(...COLORS.CIAR_BLUE);
    doc.text("AVIS FINAL DU SOUSCRIPTEUR :", 25, 45);
    
    // On dessine des lignes pour une saisie manuelle si besoin ou on laisse vide
    doc.setDrawColor(...COLORS.STEEL);
    doc.setLineWidth(0.1);
    doc.line(25, 55, 180, 55);
    doc.line(25, 65, 180, 65);

    // Zones de signatures
    const signatureY = 100;
    
    // Expert
    doc.setFontSize(10); doc.setTextColor(...COLORS.CIAR_BLUE);
    doc.text("L'EXPERT CHARGÉ D'AUDIT", 20, signatureY);
    doc.setFont(FONT, 'normal'); doc.setTextColor(...COLORS.TEXT);
    doc.text(auditorInfo?.name || "Expert RiskPro", 20, signatureY + 7);
    
    doc.setDrawColor(...COLORS.CIAR_BLUE);
    doc.rect(20, signatureY + 12, 75, 40); // Cadre signature expert
    doc.setFontSize(7); doc.setTextColor(...COLORS.STEEL);
    doc.text("Cachet et signature", 25, signatureY + 50);

    // Représentant Site
    doc.setFontSize(10); doc.setTextColor(...COLORS.CIAR_BLUE); doc.setFont(FONT, 'bold');
    doc.text("LE REPRÉSENTANT DU SITE", 115, signatureY);
    doc.setFont(FONT, 'normal'); doc.setTextColor(...COLORS.TEXT);
    doc.text("Bon pour accord et constatations", 115, signatureY + 7);

    doc.setDrawColor(...COLORS.STEEL);
    doc.rect(115, signatureY + 12, 75, 40); // Cadre signature client
    doc.setFontSize(7); doc.setTextColor(...COLORS.STEEL);
    doc.text("Nom et signature du responsable", 120, signatureY + 50);

    // Mention légale CIAR en fin de page
    doc.setFontSize(8); doc.setFont(FONT, 'italic');
    const legalText = "Ce rapport d'expertise est un document technique destiné à la souscription. Il ne vaut pas engagement de garantie de la Compagnie sans validation formelle des services de production.";
    const splitLegal = doc.splitTextToSize(legalText, 160);
    doc.text(splitLegal, 20, signatureY + 80);
    
    // --- PIED DE PAGE ---
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setDrawColor(...COLORS.CIAR_BLUE);
      doc.line(20, 282, 190, 282);
      doc.setFontSize(8);
      doc.setTextColor(...COLORS.STEEL);
      doc.text(`Document Confidentiel - Expertise Risques IARD`, 20, 288);
      doc.text(`Page ${i} / ${pageCount}`, 190, 288, { align: 'right' });
    }

    doc.save(`Expertise_CIAR_${clientName.replace(/\s+/g, '_')}.pdf`);
  } catch (error) {
    console.error("Erreur Export PDF:", error);
    alert("Erreur lors de la génération du PDF.");
  }
};
