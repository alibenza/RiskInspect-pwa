import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useInspectionStore } from '../hooks/useInspectionStore';

const COLORS = {
  CIAR_BLUE: [0, 51, 153],
  CIAR_RED: [227, 6, 19],
  NAVY: [15, 23, 42],
  TEXT: [31, 41, 55],
  STEEL: [100, 116, 139],
  SOFT_BG: [248, 250, 252],
  WHITE: [255, 255, 255],
  LIGHT_BLUE: [230, 238, 255],
  LIGHT_GRAY: [240, 242, 245],
};

const FONT = "helvetica";
const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 20;
const CONTENT_W = PAGE_W - MARGIN * 2;

const formatDZD = (val) => new Intl.NumberFormat('fr-DZ').format(val || 0) + " DZD";

const addPageHeader = (doc, clientName, siteLabel = "") => {
  doc.setFillColor(...COLORS.CIAR_BLUE);
  doc.rect(0, 0, 8, PAGE_H, 'F');
  if (siteLabel) {
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.STEEL);
    doc.setFont(FONT, 'normal');
    doc.text(`${clientName.toUpperCase()} — ${siteLabel}`, MARGIN, 10);
  }
};

const addPageFooter = (doc, pageNum, totalPages, clientName) => {
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.STEEL);
  doc.text(
    `Rapport d'Expertise CIAR — ${clientName} — Page ${pageNum} / ${totalPages}`,
    PAGE_W / 2,
    PAGE_H - 8,
    { align: 'center' }
  );
};

const ensureSpace = (doc, currentY, neededHeight, clientName, siteLabel = "") => {
  if (currentY + neededHeight > PAGE_H - 18) {
    doc.addPage();
    addPageHeader(doc, clientName, siteLabel);
    return MARGIN + 12;
  }
  return currentY;
};

const addSectionTitle = (doc, text, y) => {
  doc.setFillColor(...COLORS.LIGHT_BLUE);
  doc.roundedRect(MARGIN, y - 5, CONTENT_W, 10, 2, 2, 'F');
  doc.setFont(FONT, 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.CIAR_BLUE);
  doc.text(text.toUpperCase(), MARGIN + 4, y + 2);
  return y + 12;
};

const addPhoto = (doc, photoUrl, label, x, y, maxW, maxH) => {
  try {
    doc.addImage(photoUrl, 'JPEG', x, y, maxW, maxH);
    if (label) {
      doc.setFont(FONT, 'italic');
      doc.setFontSize(6);
      doc.setTextColor(...COLORS.STEEL);
      doc.text(label, x, y + maxH + 3, { maxWidth: maxW });
    }
    return y + maxH + 6;
  } catch (e) {
    return y;
  }
};

export const exportToPdf = async (responses, questionsConfig, aiResults, auditorInfo) => {
  try {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const { allSites, smpData, chatHistory } = useInspectionStore.getState();
    const clientName = responses['nomination']?.value || "ENTREPRISE ASSURÉE";
    const exportDate = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });

    // =============================================
    // PAGE 1 : COUVERTURE
    // =============================================
    doc.setFillColor(...COLORS.CIAR_BLUE);
    doc.rect(0, 0, 15, PAGE_H, 'F');
    doc.setFillColor(...COLORS.SOFT_BG);
    doc.rect(15, 0, PAGE_W - 15, PAGE_H, 'F');

    doc.setTextColor(...COLORS.CIAR_BLUE);
    doc.setFont(FONT, 'bold');
    doc.setFontSize(26);
    doc.text("RAPPORT D'AUDIT CONSOLIDÉ", 25, 80);
    doc.setTextColor(...COLORS.CIAR_RED);
    doc.setFontSize(18);
    doc.text("SYNTHÈSE MULTI-SITES CIAR", 25, 92);
    doc.setDrawColor(...COLORS.CIAR_BLUE);
    doc.setLineWidth(0.5);
    doc.line(25, 100, 140, 100);

    const infoRows = [
      ["ENTREPRISE", clientName.toUpperCase()],
      ["ADRESSE", responses['adress']?.value || "Non renseignée"],
      ["ACTIVITÉ", responses['activite_nature']?.value || "Non renseignée"],
      ["EXPERT RÉDACTEUR", (auditorInfo?.name || "Expert RiskPro").toUpperCase()],
      ["SOCIÉTÉ", (auditorInfo?.company || "CIAR").toUpperCase()],
      ["DATE D'INSPECTION", auditorInfo?.inspectionDate || exportDate],
      ["DATE D'EXPORT", exportDate],
      ["NOMBRE DE SITES", String(Object.keys(allSites).length)],
    ];

    let y = 115;
    infoRows.forEach(([label, val]) => {
      doc.setFont(FONT, 'bold'); doc.setFontSize(9); doc.setTextColor(...COLORS.STEEL);
      doc.text(label + " :", 25, y);
      doc.setFont(FONT, 'normal'); doc.setTextColor(...COLORS.TEXT);
      doc.text(val, 85, y);
      y += 10;
    });

    doc.setFontSize(8); doc.setTextColor(...COLORS.STEEL);
    doc.text("Document confidentiel — Usage interne CIAR uniquement", 25, 270);

    // =============================================
    // PAGE 2 : SYNTHÈSE IA & INDICE DE MAÎTRISE
    // =============================================
    doc.addPage();
    addPageHeader(doc, clientName);

    y = MARGIN + 8;
    doc.setFont(FONT, 'bold'); doc.setFontSize(14); doc.setTextColor(...COLORS.CIAR_BLUE);
    doc.text("1. SYNTHÈSE DÉCISIONNELLE & INDICE DE MAÎTRISE", MARGIN, y);
    y += 8;

    if (aiResults) {
      // Score global
      doc.setFillColor(...COLORS.NAVY);
      doc.roundedRect(MARGIN, y, 75, 38, 4, 4, 'F');
      doc.setTextColor(...COLORS.WHITE);
      doc.setFontSize(7); doc.setFont(FONT, 'bold');
      doc.text("INDICE DE MAÎTRISE GLOBAL", MARGIN + 4, y + 8);
      doc.setFontSize(30); doc.setTextColor(100, 200, 120);
      doc.text(`${aiResults.score_global || '--'}%`, MARGIN + 10, y + 28);

      // SMP
      doc.setFillColor(...COLORS.CIAR_BLUE);
      doc.roundedRect(MARGIN + 80, y, 110, 38, 4, 4, 'F');
      doc.setTextColor(...COLORS.WHITE);
      doc.setFontSize(7); doc.setFont(FONT, 'bold');
      doc.text("SINISTRE MAXIMUM POSSIBLE (SMP)", MARGIN + 84, y + 8);
      doc.setFontSize(14);
      doc.text(formatDZD(smpData?.smpFinal), MARGIN + 84, y + 22);
      doc.setFontSize(8);
      doc.text("Capitaux totaux exposés : " + formatDZD(smpData?.valeurs?.total), MARGIN + 84, y + 32);

      y += 46;

      // Synthèse executive
      if (aiResults.synthese_executive) {
        doc.setFont(FONT, 'bold'); doc.setFontSize(9); doc.setTextColor(...COLORS.TEXT);
        doc.text("SYNTHÈSE EXÉCUTIVE :", MARGIN, y);
        y += 6;
        doc.setFillColor(...COLORS.SOFT_BG);
        const lines = doc.splitTextToSize(aiResults.synthese_executive, CONTENT_W - 8);
        const blockH = lines.length * 4.5 + 8;
        doc.roundedRect(MARGIN, y, CONTENT_W, blockH, 3, 3, 'F');
        doc.setFont(FONT, 'italic'); doc.setFontSize(8.5); doc.setTextColor(...COLORS.TEXT);
        doc.text(lines, MARGIN + 4, y + 6);
        y += blockH + 8;
      }

      // Tableau des capitaux (VHR)
      doc.setFont(FONT, 'bold'); doc.setFontSize(9); doc.setTextColor(...COLORS.TEXT);
      doc.text("DÉTAIL DES VALEURS À NEUF :", MARGIN, y);
      y += 4;

      const vhrRows = [
        ["Bâtiments & Génie Civil", formatDZD(smpData?.valeurs?.batiment)],
        ["Matériels & Équipements", formatDZD(smpData?.valeurs?.materiel)],
        ["Stocks (MP / PF)", formatDZD(smpData?.valeurs?.stocks)],
        ["Pertes d'Exploitation (12 mois)", formatDZD(smpData?.valeurs?.pe)],
        [
          { content: "TOTAL DES CAPITAUX EXPOSÉS", styles: { fontStyle: 'bold', fillColor: COLORS.LIGHT_GRAY } },
          { content: formatDZD(smpData?.valeurs?.total), styles: { fontStyle: 'bold', fillColor: COLORS.LIGHT_GRAY, halign: 'right' } }
        ]
      ];

      doc.autoTable({
        startY: y,
        body: vhrRows,
        theme: 'grid',
        styles: { fontSize: 8.5, cellPadding: 3 },
        columnStyles: { 1: { halign: 'right', cellWidth: 60 } }
      });
      y = doc.lastAutoTable.finalY + 8;

      // Scénario SMP
      if (smpData?.scenario) {
        doc.setFont(FONT, 'bold'); doc.setFontSize(9); doc.setTextColor(...COLORS.TEXT);
        doc.text("SCÉNARIO DE SINISTRE RETENU :", MARGIN, y);
        y += 5;
        const scenarioLines = doc.splitTextToSize(smpData.scenario, CONTENT_W - 8);
        doc.setFont(FONT, 'italic'); doc.setFontSize(8); doc.setTextColor(...COLORS.STEEL);
        doc.text(scenarioLines, MARGIN + 4, y);
      }
    } else {
      doc.setFont(FONT, 'italic'); doc.setFontSize(10); doc.setTextColor(...COLORS.STEEL);
      doc.text("Aucune analyse IA générée pour ce rapport.", MARGIN, y + 10);
    }

    // =============================================
    // PAGE 3 : ÉVALUATION PAR GARANTIE
    // =============================================
    if (aiResults?.analyses_par_garantie?.length > 0) {
      doc.addPage();
      addPageHeader(doc, clientName);
      y = MARGIN + 8;

      doc.setFont(FONT, 'bold'); doc.setFontSize(14); doc.setTextColor(...COLORS.CIAR_BLUE);
      doc.text("2. ÉVALUATION TECHNIQUE DES RISQUES PAR GARANTIE", MARGIN, y);
      y += 6;

      const garantieRows = aiResults.analyses_par_garantie.map(g => [
        g.garantie || '',
        g.exposition != null ? `${g.exposition}/10` : '-',
        g.avis_technique || ''
      ]);

      doc.autoTable({
        startY: y,
        head: [['Garantie', 'Exposition', 'Avis Technique Consolidé']],
        body: garantieRows,
        theme: 'striped',
        headStyles: { fillColor: COLORS.CIAR_BLUE, textColor: 255, fontStyle: 'bold', fontSize: 8 },
        styles: { fontSize: 8, cellPadding: 3 },
        columnStyles: { 0: { cellWidth: 40 }, 1: { cellWidth: 20, halign: 'center' }, 2: { cellWidth: 'auto' } }
      });

      // Points forts / axes d'amélioration
      y = doc.lastAutoTable.finalY + 10;

      if (aiResults.points_forts?.length > 0) {
        y = ensureSpace(doc, y, 30, clientName);
        y = addSectionTitle(doc, "Points Forts Identifiés", y);
        aiResults.points_forts.forEach(p => {
          y = ensureSpace(doc, y, 8, clientName);
          doc.setFont(FONT, 'normal'); doc.setFontSize(8); doc.setTextColor(...COLORS.TEXT);
          doc.text(`✓  ${p}`, MARGIN + 4, y);
          y += 6;
        });
        y += 4;
      }

      if (aiResults.axes_amelioration?.length > 0) {
        y = ensureSpace(doc, y, 30, clientName);
        y = addSectionTitle(doc, "Axes d'Amélioration Prioritaires", y);
        aiResults.axes_amelioration.forEach(p => {
          y = ensureSpace(doc, y, 8, clientName);
          doc.setFont(FONT, 'normal'); doc.setFontSize(8); doc.setTextColor(...COLORS.TEXT);
          doc.text(`→  ${p}`, MARGIN + 4, y);
          y += 6;
        });
      }

      if (aiResults.recommandations?.length > 0) {
        y = ensureSpace(doc, y, 30, clientName);
        y += 4;
        y = addSectionTitle(doc, "Recommandations de l'Expert", y);
        aiResults.recommandations.forEach((r, i) => {
          y = ensureSpace(doc, y, 8, clientName);
          doc.setFont(FONT, 'normal'); doc.setFontSize(8); doc.setTextColor(...COLORS.TEXT);
          const lines = doc.splitTextToSize(`${i + 1}. ${r}`, CONTENT_W - 8);
          doc.text(lines, MARGIN + 4, y);
          y += lines.length * 4.5 + 3;
        });
      }
    }

    // =============================================
    // PAGES 4+ : DÉTAIL PAR SITE (Réponses + Photos)
    // =============================================
    const sectionIndex = aiResults?.analyses_par_garantie?.length > 0 ? 3 : 2;
    let globalSiteIndex = 0;

    for (const [siteId, site] of Object.entries(allSites)) {
      globalSiteIndex++;
      const siteResponses = site.responses || {};
      const siteName = site.name || siteId;

      doc.addPage();
      addPageHeader(doc, clientName, siteName);
      y = MARGIN + 8;

      // En-tête du site
      doc.setFillColor(...COLORS.NAVY);
      doc.roundedRect(MARGIN, y, CONTENT_W, 14, 3, 3, 'F');
      doc.setFont(FONT, 'bold'); doc.setFontSize(11); doc.setTextColor(...COLORS.WHITE);
      doc.text(`${sectionIndex + globalSiteIndex - 1}. SITE : ${siteName.toUpperCase()}`, MARGIN + 6, y + 9);
      y += 20;

      // Boucle par section de questionsConfig
      for (const section of (questionsConfig || [])) {
        const sectionQuestions = section.questions || [];
        const hasData = sectionQuestions.some(q => {
          const r = siteResponses[q.id];
          return r && (r.value || r.comment || r.score || (r.photos && r.photos.length > 0));
        });
        if (!hasData) continue;

        y = ensureSpace(doc, y, 20, clientName, siteName);
        y = addSectionTitle(doc, section.title, y);

        for (const question of sectionQuestions) {
          const resp = siteResponses[question.id];
          if (!resp) continue;

          const hasContent = resp.value || resp.comment || resp.score;
          const hasPhotos = resp.photos && resp.photos.length > 0;
          if (!hasContent && !hasPhotos) continue;

          y = ensureSpace(doc, y, 18, clientName, siteName);

          // Ligne de question
          doc.setFillColor(...COLORS.LIGHT_GRAY);
          doc.roundedRect(MARGIN, y - 4, CONTENT_W, 9, 1.5, 1.5, 'F');
          doc.setFont(FONT, 'bold'); doc.setFontSize(8); doc.setTextColor(...COLORS.NAVY);
          doc.text(question.label, MARGIN + 3, y + 1.5);

          // Score si applicable
          if (question.isScored && resp.score != null) {
            const scoreColor = resp.score >= 4 ? [34, 197, 94] : resp.score >= 2 ? [234, 179, 8] : [239, 68, 68];
            doc.setTextColor(...scoreColor);
            doc.setFont(FONT, 'bold');
            doc.text(`${resp.score}/5`, CONTENT_W + MARGIN - 10, y + 1.5);
          }
          y += 10;

          // Valeur
          if (resp.value) {
            y = ensureSpace(doc, y, 8, clientName, siteName);
            doc.setFont(FONT, 'bold'); doc.setFontSize(7.5); doc.setTextColor(...COLORS.STEEL);
            doc.text("Réponse :", MARGIN + 3, y);
            doc.setFont(FONT, 'normal'); doc.setTextColor(...COLORS.TEXT);
            const valLines = doc.splitTextToSize(String(resp.value), CONTENT_W - 30);
            doc.text(valLines, MARGIN + 22, y);
            y += valLines.length * 4.5 + 2;
          }

          // Commentaire / Observation
          if (resp.comment && resp.comment.trim()) {
            y = ensureSpace(doc, y, 10, clientName, siteName);
            doc.setFont(FONT, 'bold'); doc.setFontSize(7.5); doc.setTextColor(...COLORS.STEEL);
            doc.text("Observation :", MARGIN + 3, y);
            doc.setFont(FONT, 'italic'); doc.setTextColor(...COLORS.TEXT);
            const cmtLines = doc.splitTextToSize(resp.comment.trim(), CONTENT_W - 35);
            doc.text(cmtLines, MARGIN + 26, y);
            y += cmtLines.length * 4.5 + 2;
          }

          // Photos
          if (hasPhotos) {
            y = ensureSpace(doc, y, 6, clientName, siteName);
            doc.setFont(FONT, 'bold'); doc.setFontSize(7.5); doc.setTextColor(...COLORS.CIAR_BLUE);
            doc.text(`Photos (${resp.photos.length}) :`, MARGIN + 3, y);
            y += 5;

            // Grille de photos : 2 par ligne
            const photoW = (CONTENT_W - 6) / 2;
            const photoH = photoW * 0.65;

            for (let pi = 0; pi < resp.photos.length; pi++) {
              const photo = resp.photos[pi];
              const col = pi % 2;

              if (col === 0) {
                y = ensureSpace(doc, y, photoH + 12, clientName, siteName);
              }

              const photoX = MARGIN + col * (photoW + 6);
              const photoY = y;

              try {
                doc.addImage(photo.url, 'JPEG', photoX, photoY, photoW, photoH);
                // Légende sous la photo
                doc.setFont(FONT, 'italic'); doc.setFontSize(6); doc.setTextColor(...COLORS.STEEL);
                const caption = photo.fileName
                  ? `${photo.fileName} — ${new Date(photo.timestamp).toLocaleString('fr-FR')}`
                  : new Date(photo.timestamp).toLocaleString('fr-FR');
                doc.text(caption, photoX, photoY + photoH + 3.5, { maxWidth: photoW });
              } catch (imgErr) {
                doc.setFont(FONT, 'normal'); doc.setFontSize(7); doc.setTextColor(...COLORS.STEEL);
                doc.text("[Image non lisible]", photoX, photoY + photoH / 2);
              }

              if (col === 1 || pi === resp.photos.length - 1) {
                y += photoH + 9;
              }
            }
          }

          y += 3;
        }
        y += 4;
      }

      // Résultats IA spécifiques au site
      const siteAiResults = site.aiResults;
      if (siteAiResults) {
        y = ensureSpace(doc, y, 20, clientName, siteName);
        y = addSectionTitle(doc, `Analyse IA — ${siteName}`, y);

        if (siteAiResults.score_global != null) {
          doc.setFont(FONT, 'bold'); doc.setFontSize(9); doc.setTextColor(...COLORS.TEXT);
          doc.text(`Score : ${siteAiResults.score_global}%`, MARGIN + 4, y);
          y += 7;
        }
        if (siteAiResults.synthese_executive) {
          const lines = doc.splitTextToSize(siteAiResults.synthese_executive, CONTENT_W - 8);
          y = ensureSpace(doc, y, lines.length * 4.5 + 4, clientName, siteName);
          doc.setFont(FONT, 'italic'); doc.setFontSize(8); doc.setTextColor(...COLORS.TEXT);
          doc.text(lines, MARGIN + 4, y);
          y += lines.length * 4.5 + 6;
        }
      }

      // SMP du site
      const siteSmp = site.smpData;
      if (siteSmp?.smpFinal > 0) {
        y = ensureSpace(doc, y, 20, clientName, siteName);
        y = addSectionTitle(doc, `SMP — ${siteName}`, y);
        doc.setFont(FONT, 'bold'); doc.setFontSize(9); doc.setTextColor(...COLORS.CIAR_BLUE);
        doc.text(`SMP Final : ${formatDZD(siteSmp.smpFinal)}`, MARGIN + 4, y);
        y += 7;
        if (siteSmp.scenario) {
          const lines = doc.splitTextToSize(siteSmp.scenario, CONTENT_W - 8);
          doc.setFont(FONT, 'italic'); doc.setFontSize(8); doc.setTextColor(...COLORS.TEXT);
          doc.text(lines, MARGIN + 4, y);
          y += lines.length * 4.5 + 4;
        }
      }
    }

    // =============================================
    // PAGE : HISTORIQUE CO-RÉDACTION IA (Chat SMP)
    // =============================================
    const allChatMessages = [];
    Object.entries(allSites).forEach(([, site]) => {
      if (site.chatHistory?.length > 0) {
        allChatMessages.push(...site.chatHistory);
      }
    });
    if (chatHistory?.length > 0) allChatMessages.push(...chatHistory);

    if (allChatMessages.length > 0) {
      doc.addPage();
      addPageHeader(doc, clientName);
      y = MARGIN + 8;

      doc.setFont(FONT, 'bold'); doc.setFontSize(14); doc.setTextColor(...COLORS.CIAR_BLUE);
      doc.text("CONCLUSION IA — CO-RÉDACTION SMP", MARGIN, y);
      y += 12;

      doc.setFont(FONT, 'normal'); doc.setFontSize(8); doc.setTextColor(...COLORS.STEEL);
      doc.text(`${allChatMessages.length} échange(s) enregistré(s) avec l'assistant IA.`, MARGIN, y);
      y += 10;

      for (const msg of allChatMessages) {
        const isUser = msg.role === 'user';
        const lines = doc.splitTextToSize(msg.content || '', CONTENT_W - 14);
        const blockH = lines.length * 4.5 + 8;

        y = ensureSpace(doc, y, blockH + 6, clientName);

        // En-tête du message
        doc.setFont(FONT, 'bold'); doc.setFontSize(7);
        if (isUser) {
          doc.setTextColor(...COLORS.CIAR_BLUE);
          doc.text("EXPERT :", MARGIN, y);
        } else {
          doc.setTextColor(...COLORS.CIAR_RED);
          doc.text("ASSISTANT IA :", MARGIN, y);
        }

        // Timestamp
        if (msg.timestamp) {
          doc.setFont(FONT, 'normal'); doc.setFontSize(6); doc.setTextColor(...COLORS.STEEL);
          doc.text(new Date(msg.timestamp).toLocaleString('fr-FR'), PAGE_W - MARGIN, y, { align: 'right' });
        }
        y += 4;

        // Corps du message
        doc.setFillColor(isUser ? 230 : 240, isUser ? 238 : 240, isUser ? 255 : 240);
        doc.roundedRect(MARGIN, y, CONTENT_W, blockH, 2, 2, 'F');
        doc.setFont(FONT, isUser ? 'normal' : 'italic'); doc.setFontSize(8);
        doc.setTextColor(...COLORS.TEXT);
        doc.text(lines, MARGIN + 5, y + 5);
        y += blockH + 5;
      }
    }

    // =============================================
    // PAGE FINALE : VALIDATION & SIGNATURES
    // =============================================
    doc.addPage();
    addPageHeader(doc, clientName);
    y = MARGIN + 8;

    doc.setFont(FONT, 'bold'); doc.setFontSize(14); doc.setTextColor(...COLORS.CIAR_BLUE);
    doc.text("VALIDATION ET SIGNATURES", MARGIN, y);
    y += 15;

    doc.setFont(FONT, 'normal'); doc.setFontSize(8.5); doc.setTextColor(...COLORS.TEXT);
    doc.text(
      `Le présent rapport d'audit a été établi le ${exportDate} par ${auditorInfo?.name || "l'expert désigné"} ` +
      `(${auditorInfo?.company || "CIAR"}) suite à la visite de risque du site de ${clientName}.`,
      MARGIN, y, { maxWidth: CONTENT_W }
    );
    y += 20;

    // Cadres de signature
    const sigY = y + 20;
    doc.setDrawColor(...COLORS.CIAR_BLUE);
    doc.setLineWidth(0.5);

    doc.rect(MARGIN, sigY, 75, 45);
    doc.setFont(FONT, 'bold'); doc.setFontSize(8); doc.setTextColor(...COLORS.CIAR_BLUE);
    doc.text("L'EXPERT CIAR", MARGIN + 4, sigY - 4);
    doc.setFont(FONT, 'normal'); doc.setFontSize(7); doc.setTextColor(...COLORS.STEEL);
    doc.text(auditorInfo?.name || "Expert RiskPro", MARGIN + 4, sigY + 6);
    doc.text("Cachet & Signature :", MARGIN + 4, sigY + 12);

    doc.rect(MARGIN + 110, sigY, 75, 45);
    doc.setFont(FONT, 'bold'); doc.setFontSize(8); doc.setTextColor(...COLORS.CIAR_BLUE);
    doc.text("REPRÉSENTANT CLIENT", MARGIN + 114, sigY - 4);
    doc.setFont(FONT, 'normal'); doc.setFontSize(7); doc.setTextColor(...COLORS.STEEL);
    doc.text(clientName, MARGIN + 114, sigY + 6);
    doc.text("Cachet & Signature :", MARGIN + 114, sigY + 12);

    doc.setFont(FONT, 'italic'); doc.setFontSize(7.5); doc.setTextColor(...COLORS.STEEL);
    doc.text(
      "Ce document est confidentiel et destiné exclusivement aux parties désignées ci-dessus.",
      PAGE_W / 2, sigY + 65, { align: 'center' }
    );

    // =============================================
    // NUMÉROTATION DE TOUTES LES PAGES
    // =============================================
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      addPageFooter(doc, i, totalPages, clientName);
    }

    doc.save(`RAPPORT_CIAR_${clientName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);

  } catch (error) {
    console.error("Erreur Export PDF:", error);
    alert("Erreur lors de la génération du rapport PDF : " + error.message);
  }
};
