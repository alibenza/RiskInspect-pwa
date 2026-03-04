import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useInspectionStore } from '../hooks/useInspectionStore';

export const exportToPdf = async (responses, questionsConfig, aiResults, auditorInfo) => {
  try {
    const doc = new jsPDF();
    const { allSites, smpData } = useInspectionStore.getState(); 
    const clientName = responses['nomination']?.value || "ENTREPRISE ASSURÉE";

    const COLORS = {
      CIAR_BLUE: [0, 51, 153],
      CIAR_RED: [227, 6, 19],
      NAVY: [15, 23, 42],
      TEXT: [31, 41, 55],
      STEEL: [100, 116, 139],
      SOFT_BG: [248, 250, 252],
      WHITE: [255, 255, 255]
    };

    const FONT = "helvetica";
    const formatDZD = (val) => new Intl.NumberFormat('fr-DZ').format(val || 0) + " DZD";

    // --- 1. PAGE DE GARDE CORPORATE (Inchangée) ---
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
    doc.text("EXPERT RÉDACTEUR :", 25, 135);
    doc.setFont(FONT, 'normal');
    doc.text((auditorInfo?.name || "Expert RiskPro").toUpperCase(), 75, 135);

    // --- 2. ANALYSE IA & SMP (NOUVELLE SECTION) ---
    doc.addPage();
    doc.setTextColor(...COLORS.CIAR_BLUE);
    doc.setFontSize(16); doc.setFont(FONT, 'bold');
    doc.text("1. SYNTHÈSE DÉCISIONNELLE & SMP", 20, 25);

    // Bloc Score Global
    doc.setFillColor(...COLORS.SOFT_BG);
    doc.roundedRect(20, 35, 80, 40, 4, 4, 'F');
    doc.setFontSize(32); doc.setTextColor(...COLORS.CIAR_RED);
    doc.text(`${aiResults.score_global}%`, 30, 65);
    doc.setFontSize(8); doc.setTextColor(...COLORS.CIAR_BLUE);
    doc.text("INDICE DE MAÎTRISE", 30, 45);

    // Bloc SMP Final (Mis en avant)
    doc.setFillColor(...COLORS.CIAR_BLUE);
    doc.roundedRect(105, 35, 85, 40, 4, 4, 'F');
    doc.setTextColor(...COLORS.WHITE);
    doc.setFontSize(8); doc.text("SINISTRE MAXIMUM POSSIBLE (SMP)", 112, 45);
    doc.setFontSize(14); doc.text(formatDZD(smpData.smpFinal), 112, 60);

    // Tableau des Capitaux Exposés (VHR)
    doc.setTextColor(...COLORS.TEXT);
    doc.setFontSize(11); doc.text("DÉTAIL DES VALEURS À NEUF (ESTIMATION IA)", 20, 90);
    
    const vhrRows = [
      ["Bâtiments & Génie Civil", formatDZD(smpData.valeurs?.batiment)],
      ["Matériels & Équipements", formatDZD(smpData.valeurs?.materiel)],
      ["Stocks (MP / PF)", formatDZD(smpData.valeurs?.stocks)],
      ["Pertes d'Exploitation (12 mois)", formatDZD(smpData.valeurs?.pe)],
      [{ content: "TOTAL DES CAPITAUX EXPOSÉS", styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } }, 
       { content: formatDZD(smpData.valeurs?.total), styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } }]
    ];

    doc.autoTable({
      startY: 95,
      body: vhrRows,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 4 },
      columnStyles: { 1: { halign: 'right' } }
    });

    // Scénario de Sinistre
    let currentY = doc.lastAutoTable.finalY + 15;
    doc.setFont(FONT, 'bold'); doc.text("SCÉNARIO DE SINISTRE RETENU :", 20, currentY);
    doc.setFont(FONT, 'italic'); doc.setFontSize(9);
    const splitScenario = doc.splitTextToSize(smpData.scenario || "Non défini par l'expert.", 170);
    doc.text(splitScenario, 20, currentY + 7);

    // --- 3. ANALYSE PAR GARANTIE (Inchangée) ---
    doc.addPage();
    doc.setTextColor(...COLORS.CIAR_BLUE);
    doc.setFontSize(14); doc.text("2. ÉVALUATION TECHNIQUE DES RISQUES", 20, 25);
    
    const garantieRows = aiResults.analyses_par_garantie?.map(g => [
      g.garantie,
      `${g.exposition}/10`,
      g.avis_technique
    ]);

    doc.autoTable({
      startY: 35,
      head: [['Garantie', 'Expo.', 'Avis Technique Consolidé']],
      body: garantieRows,
      theme: 'striped',
      headStyles: { fillColor: COLORS.CIAR_BLUE },
      styles: { fontSize: 8 }
    });

    // --- 4. BOUCLE SUR LES SITES ET PHOTOS (Inchangée) ---
    // (Le reste de ta boucle Object.entries(allSites) reste identique)
    // ... code précédent ...

    // --- 5. SIGNATURES ---
    doc.addPage();
    doc.setTextColor(...COLORS.CIAR_BLUE);
    doc.setFontSize(14); doc.text("VALIDATION ET SIGNATURES", 20, 25);
    
    const signatureY = 100;
    doc.setDrawColor(...COLORS.CIAR_BLUE);
    doc.rect(20, signatureY, 75, 40); 
    doc.rect(115, signatureY, 75, 40);
    doc.setFontSize(8);
    doc.text("L'EXPERT CIAR (Cachet)", 20, signatureY - 5);
    doc.text("REPRÉSENTANT CLIENT", 115, signatureY - 5);

    // Numérotation
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8); doc.setTextColor(...COLORS.STEEL);
      doc.text(`Rapport Expertise CIAR - ${clientName} - Page ${i} / ${pageCount}`, 105, 290, { align: 'center' });
    }

    doc.save(`RAPPORT_CIAR_${clientName.replace(/\s+/g, '_')}.pdf`);
  } catch (error) {
    console.error("Erreur Export PDF:", error);
    alert("Erreur lors de la génération du rapport.");
  }
};
