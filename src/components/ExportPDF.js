import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useInspectionStore } from '../hooks/useInspectionStore';

export const exportToPdf = async (responses, questionsConfig, aiResults, auditorInfo) => {
  try {
    const doc = new jsPDF();
    const { allSites } = useInspectionStore.getState(); // Récupération de tous les sites
    const clientName = responses['nomination']?.value || "ENTREPRISE ASSURÉE";

    const COLORS = {
      CIAR_BLUE: [0, 51, 153],
      CIAR_RED: [227, 6, 19],
      NAVY: [15, 23, 42],
      TEXT: [31, 41, 55],
      STEEL: [100, 116, 139],
      SOFT_BG: [248, 250, 252]
    };

    const FONT = "helvetica";

    // --- 1. PAGE DE GARDE CORPORATE ---
    doc.setFillColor(...COLORS.CIAR_BLUE);
    doc.rect(0, 0, 15, 297, 'F'); 

    doc.setTextColor(...COLORS.CIAR_BLUE);
    doc.setFont(FONT, 'bold');
    doc.setFontSize(26);
    doc.text("RAPPORT D'AUDIT CONSOLIDÉ", 25, 70);
    
    doc.setTextColor(...COLORS.CIAR_RED);
    doc.setFontSize(20);
    doc.text("SYNTHÈSE MULTI-SITES CIAR", 25, 82);
    
    doc.setDrawColor(...COLORS.CIAR_BLUE);
    doc.line(25, 95, 120, 95);

    doc.setFontSize(12);
    doc.setTextColor(...COLORS.TEXT);
    doc.text("ENTREPRISE :", 25, 115);
    doc.setFont(FONT, 'normal');
    doc.text(clientName.toUpperCase(), 75, 115);

    doc.setFont(FONT, 'bold');
    doc.text("NOMBRE DE SITES :", 25, 125);
    doc.setFont(FONT, 'normal');
    doc.text(`${Object.keys(allSites).length} Unités Inspectées`, 75, 125);

    doc.setFont(FONT, 'bold');
    doc.text("EXPERT RÉDACTEUR :", 25, 135);
    doc.setFont(FONT, 'normal');
    doc.text((auditorInfo?.name || "Expert RiskPro").toUpperCase(), 75, 135);

    // --- 2. ANALYSE IA CONSOLIDÉE (GROUPE) ---
    doc.addPage();
    doc.setTextColor(...COLORS.CIAR_BLUE);
    doc.setFontSize(16); doc.setFont(FONT, 'bold');
    doc.text("1. SYNTHÈSE DÉCISIONNELLE GROUPE", 20, 25);

    doc.setFillColor(...COLORS.SOFT_BG);
    doc.roundedRect(20, 35, 170, 40, 4, 4, 'F');
    
    doc.setFontSize(42); doc.setTextColor(...COLORS.CIAR_RED);
    doc.text(`${aiResults.score_global}%`, 30, 65);
    
    doc.setFontSize(10); doc.setTextColor(...COLORS.CIAR_BLUE);
    doc.text("INDICE DE MAÎTRISE DU RISQUE (CONSOLIDÉ)", 30, 45);

    doc.setTextColor(...COLORS.TEXT);
    doc.setFontSize(10); doc.setFont(FONT, 'normal');
    const splitSynth = doc.splitTextToSize(aiResults.synthese_executive, 165);
    doc.text(splitSynth, 20, 90);

    // Table des Garanties Groupe
    const garantieRows = aiResults.analyses_par_garantie?.map(g => [
      g.garantie,
      `${g.exposition}/10`,
      g.avis_technique
    ]);

    doc.autoTable({
      startY: 140,
      head: [['Garantie', 'Exposition', 'Avis Technique Consolidé']],
      body: garantieRows,
      theme: 'striped',
      headStyles: { fillColor: COLORS.CIAR_BLUE },
      styles: { fontSize: 8 }
    });

    // --- 3. BOUCLE SUR CHAQUE SITE (FICHES DÉTAILLÉES) ---
    Object.entries(allSites).forEach(([siteId, siteData], index) => {
      doc.addPage();
      
      // En-tête de Site
      doc.setFillColor(...COLORS.CIAR_BLUE);
      doc.rect(0, 0, 210, 20, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.text(`ANNEXE ${index + 1} : FICHE TECHNIQUE - ${siteData.name.toUpperCase()}`, 20, 13);

      let currentY = 35;

      // Parcours des sections pour ce site spécifique
      questionsConfig.forEach(section => {
        if (currentY > 260) { doc.addPage(); currentY = 25; }

        doc.setFillColor(...COLORS.SOFT_BG);
        doc.rect(20, currentY, 170, 8, 'F');
        doc.setDrawColor(...COLORS.CIAR_RED);
        doc.line(20, currentY, 20, currentY + 8);
        
        doc.setFontSize(9); doc.setTextColor(...COLORS.CIAR_BLUE); doc.setFont(FONT, 'bold');
        doc.text(section.title.toUpperCase(), 25, currentY + 6);
        currentY += 15;

        section.questions.forEach(q => {
          const resp = siteData.responses[q.id];
          if (resp?.comment || resp?.score || resp?.value) {
            if (currentY > 260) { doc.addPage(); currentY = 25; }
            
            doc.setFontSize(8); doc.setFont(FONT, 'bold'); doc.setTextColor(...COLORS.TEXT);
            doc.text(q.label, 20, currentY);
            
            const valStr = resp.value || (resp.score ? `${resp.score}/5` : "N/A");
            doc.setTextColor(...COLORS.CIAR_BLUE);
            doc.text(`: ${valStr}`, 130, currentY);

            if (resp.comment && resp.comment !== 'RAS') {
              currentY += 5;
              doc.setFont(FONT, 'italic'); doc.setTextColor(...COLORS.STEEL);
              const splitObs = doc.splitTextToSize(`Obs: ${resp.comment}`, 160);
              doc.text(splitObs, 25, currentY);
              currentY += (splitObs.length * 4);
            }
            currentY += 7;
          }
        });
      });

      // Photos du site
      const sitePhotos = [];
      Object.keys(siteData.responses).forEach(qId => {
        if (siteData.responses[qId]?.photos?.length > 0) {
          siteData.responses[qId].photos.forEach(p => sitePhotos.push(p.url));
        }
      });

      if (sitePhotos.length > 0) {
        doc.addPage();
        doc.setTextColor(...COLORS.CIAR_BLUE);
        doc.setFontSize(12); doc.text(`GALERIE PHOTOS : ${siteData.name}`, 20, 20);
        let pX = 20, pY = 30;
        sitePhotos.forEach((url, pIdx) => {
          if (pY > 240) { doc.addPage(); pY = 20; }
          try { doc.addImage(url, 'JPEG', pX, pY, 80, 50); } catch(e){}
          if ((pIdx + 1) % 2 === 0) { pX = 20; pY += 60; } else { pX = 110; }
        });
      }
    });

    // --- 4. SIGNATURES ET BAS DE PAGE ---
    doc.addPage();
    doc.setTextColor(...COLORS.CIAR_BLUE);
    doc.setFontSize(14); doc.text("VALIDATION ET SIGNATURES", 20, 25);
    
    const signatureY = 100;
    doc.setDrawColor(...COLORS.CIAR_BLUE);
    doc.rect(20, signatureY, 75, 40); 
    doc.rect(115, signatureY, 75, 40);
    doc.setFontSize(8);
    doc.text("L'EXPERT (Cachet & Signature)", 20, signatureY - 5);
    doc.text("LE CLIENT (Bon pour accord)", 115, signatureY - 5);

    // Numérotation globale
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8); doc.setTextColor(...COLORS.STEEL);
      doc.text(`Rapport Groupe CIAR - ${clientName} - Page ${i} / ${pageCount}`, 105, 290, { align: 'center' });
    }

    doc.save(`RAPPORT_DE_VISITE_${clientName.replace(/\s+/g, '_')}.pdf`);
  } catch (error) {
    console.error("Erreur Export PDF:", error);
    alert("Erreur lors de la génération du rapport multi-sites.");
  }
};
