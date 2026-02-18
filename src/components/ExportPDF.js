import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const exportToPdf = (responses, questionsConfig, aiResults, auditorInfo) => {
  const doc = new jsPDF();
  const date = new Date().toLocaleDateString();
  const pageWidth = doc.internal.pageSize.getWidth();

  // --- LOGIQUE DE CALCUL ---
  const scoredQ = Object.values(responses).filter(r => r.isScored);
  const terrainScore = scoredQ.length ? Math.round((scoredQ.reduce((a, b) => a + (Number(b.score) || 0), 0) / (scoredQ.length * 5)) * 100) : 0;

  // --- PAGE 1 : HEADER & DASHBOARD ---
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(0, 0, 210, 65, 'F');

  if (auditorInfo?.logo) {
    try { doc.addImage(auditorInfo.logo, 'PNG', 165, 12, 30, 15); } catch (e) { console.error(e); }
  }

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont(undefined, 'bold');
  doc.text("RAPPORT D'EXPERTISE TECHNIQUE", 15, 25);
  
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(148, 163, 184); 
  doc.text(`RÉFÉRENCE : ${auditorInfo?.company?.toUpperCase() || 'RISK'}-${new Date().getFullYear()}-001`, 15, 32);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text(`EXPERT : ${auditorInfo?.name || 'Non spécifié'}`, 15, 42);
  doc.text(`ACTIVITÉ : ${responses['activite_nature']?.value || 'Non spécifiée'}`, 15, 47);
  doc.text(`LOCALISATION : ${responses['adress']?.value || 'Algérie'}`, 15, 52);
  doc.text(`DATE D'INSPECTION : ${date}`, 15, 57);

  // SECTION SCORES (Double Badge Premium)
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(15, 75, 85, 30, 3, 3, 'F');
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(8); doc.text("CONFORMITÉ TERRAIN", 20, 85);
  doc.setFontSize(16); doc.text(`${terrainScore}%`, 20, 95);

  doc.setFillColor(79, 70, 229);
  doc.roundedRect(110, 75, 85, 30, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8); doc.text("QUALITÉ RISQUE (IA)", 115, 85);
  doc.setFontSize(16); doc.text(`${aiResults?.score_global || '--'}%`, 115, 95);

  // TABLEAU D'EXPOSITION
  if (aiResults?.analyses_par_garantie) {
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text("ÉVALUATION TECHNIQUE PAR BRANCHE", 15, 120);

    const exposureRows = aiResults.analyses_par_garantie.map(an => [
      an.garantie, 
      `${an.exposition}/10`, 
      an.exposition > 7 ? "CRITIQUE" : (an.exposition > 4 ? "MODÉRÉ" : "SOUS CONTRÔLE")
    ]);

    doc.autoTable({
      startY: 125,
      head: [['Branche', 'Indice d\'Exposition', 'Statut Souscription']],
      body: exposureRows,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], fontSize: 9 },
      styles: { fontSize: 8.5 },
      didParseCell: function(data) {
        if (data.column.index === 2) {
          if (data.cell.text[0] === 'CRITIQUE') data.cell.styles.textColor = [190, 18, 60];
          if (data.cell.text[0] === 'SOUS CONTRÔLE') data.cell.styles.textColor = [5, 150, 105];
        }
      }
    });

    // SYNTHÈSE EXÉCUTIVE (Encadré dynamique sous le tableau)
    let yPos = doc.lastAutoTable.finalY + 12;
    const splitSynth = doc.splitTextToSize(aiResults.synthese_executive, 170);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(79, 70, 229);
    doc.roundedRect(15, yPos, 180, (splitSynth.length * 5) + 12, 2, 2, 'FD');
    doc.setTextColor(79, 70, 229);
    doc.setFontSize(9); doc.setFont(undefined, 'bold');
    doc.text("SYNTHÈSE DE L'INGÉNIEUR CONSEIL", 22, yPos + 8);
    doc.setTextColor(51, 65, 85); doc.setFont(undefined, 'normal');
    doc.text(splitSynth, 22, yPos + 15);
  }

  // --- PAGE 2 : ALÉAS & SUGGESTIONS ---
  doc.addPage();
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(14); doc.setFont(undefined, 'bold');
  doc.text("1. ANALYSE ENVIRONNEMENTALE & NAT-CAT", 15, 25);
  doc.setDrawColor(6, 182, 212); doc.line(15, 28, 60, 28);

  doc.setFontSize(9.5); doc.setFont(undefined, 'normal');
  const catNatText = doc.splitTextToSize(aiResults?.analyse_nat_cat || "Non disponible", 180);
  doc.text(catNatText, 15, 38, { lineHeightFactor: 1.4 });

  let currentY = 38 + (catNatText.length * 6) + 15;

  // SUGGESTIONS DE GARANTIES (L'ajout intelligent)
  if (aiResults?.suggestions_complementaires?.length > 0) {
    doc.setFontSize(14); doc.setFont(undefined, 'bold');
    doc.text("2. EXTENSIONS DE GARANTIES RECOMMANDÉES", 15, currentY);
    doc.setDrawColor(79, 70, 229); doc.line(15, currentY + 3, 60, currentY + 3);
    currentY += 12;

    aiResults.suggestions_complementaires.forEach(sug => {
      const sugTxt = doc.splitTextToSize(`${sug.nom} : ${sug.justification_technique}`, 170);
      doc.setFillColor(245, 243, 255);
      doc.roundedRect(15, currentY, 180, (sugTxt.length * 5) + 4, 1, 1, 'F');
      doc.setTextColor(67, 56, 202);
      doc.setFontSize(8.5);
      doc.text(sugTxt, 20, currentY + 5);
      currentY += (sugTxt.length * 5) + 8;
    });
  }

  // --- PAGE 3 : DÉTAIL PAR BRANCHE ---
  doc.addPage();
  doc.setFontSize(14); doc.setTextColor(15, 23, 42);
  doc.text("3. ANALYSE TECHNIQUE DÉTAILLÉE", 15, 25);
  
  let gY = 35;
  aiResults?.analyses_par_garantie?.forEach(an => {
    if (gY > 240) { doc.addPage(); gY = 25; }
    
    doc.setFillColor(15, 23, 42);
    doc.rect(15, gY, 180, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9); doc.setFont(undefined, 'bold');
    doc.text(an.garantie.toUpperCase(), 20, gY + 4.5);
    
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(9); doc.text("Avis Souscription :", 15, gY + 14);
    doc.setFont(undefined, 'normal');
    const avisSplit = doc.splitTextToSize(an.avis_technique, 175);
    doc.text(avisSplit, 15, gY + 19);
    
    gY += (avisSplit.length * 5) + 24;

    const standardSplit = doc.splitTextToSize(`PRÉCONISATION : ${an.recommandations_standards}`, 170);
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(15, gY - 5, 180, (standardSplit.length * 5) + 5, 1, 1, 'F');
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(8); doc.text(standardSplit, 20, gY);

    gY += (standardSplit.length * 5) + 15;
  });

  // --- PAGE ANNEXES (TABLEAUX & PHOTOS) ---
  // On utilise autoTable pour les relevés terrain (déjà optimisé dans ton script)
  // ... (Ton code autoTable terrainRows ici) ...

  // --- FOOTER SUR TOUTES LES PAGES ---
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(`Expertise confidentielle - ${auditorInfo?.company || 'Risk Management'} - Page ${i}/${totalPages}`, pageWidth / 2, 290, { align: 'center' });
  }

  doc.save(`RAPPORT_TECHNIQUE_${responses['activite_nature']?.value || 'SITE'}_${date.replace(/\//g, '-')}.pdf`);
};
