import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useInspectionStore } from '../hooks/useInspectionStore';

// ─── DESIGN TOKENS (VOS ORIGINAUX) ────────────────────────────────────────────
const C = {
  NAVY:    [10,  25,  60],
  BLUE:    [0,   70,  173],
  ACCENT:  [220, 40,  40],
  GOLD:    [193, 154, 68],
  MIST:    [245, 247, 252],
  RULE:    [210, 216, 230],
  BODY:    [40,  48,  65],
  SUBTLE:  [110, 122, 145],
  WHITE:   [255, 255, 255],
  GREEN:   [30,  160, 95],
  ORANGE:  [230, 130, 20],
  RED:     [210, 45,  45],
};

const F   = 'helvetica';
const PW  = 210;
const PH  = 297;
const ML  = 18;
const MR  = 192;
const CW  = MR - ML;

const fmt = (n) => {
  const rounded = Math.round(n || 0);
  return rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' DZD';
};

// ─── UTILITIES (VOS ORIGINAUX) ────────────────────────────────────────────────
const rgb    = (doc, col) => doc.setTextColor(...col);
const fill   = (doc, col) => doc.setFillColor(...col);
const stroke = (doc, col) => doc.setDrawColor(...col);
const bold   = (doc, size) => { doc.setFont(F, 'bold');   if (size) doc.setFontSize(size); };
const normal = (doc, size) => { doc.setFont(F, 'normal'); if (size) doc.setFontSize(size); };
const italic = (doc, size) => { doc.setFont(F, 'italic'); if (size) doc.setFontSize(size); };

const hline = (doc, y, x1 = ML, x2 = MR, color = C.RULE, w = 0.25) => {
  stroke(doc, color);
  doc.setLineWidth(w);
  doc.line(x1, y, x2, y);
};

const needsPage = (doc, y, h, addHeader, args) => {
  if (y + h > PH - 20) {
    doc.addPage();
    if (addHeader) addHeader(doc, ...args);
    return ML + 6;
  }
  return y;
};

const scoreColor = (s) => s >= 4 ? C.GREEN : s >= 2.5 ? C.ORANGE : C.RED;
const scoreLabel = (s) => s >= 4 ? 'Satisfaisant' : s >= 2.5 ? 'À améliorer' : 'Insuffisant';

const runningHeader = (doc, client, section = '') => {
  fill(doc, C.NAVY);
  doc.rect(0, 0, PW, 10, 'F');
  bold(doc, 6.5); rgb(doc, C.WHITE);
  doc.text('RAPPORT D\'AUDIT DE RISQUE  ·  CIAR', ML, 6.5);
  normal(doc, 6.5); rgb(doc, [180, 195, 220]);
  doc.text(client.toUpperCase(), PW / 2, 6.5, { align: 'center' });
  if (section) doc.text(section, MR, 6.5, { align: 'right' });
};

const runningFooter = (doc, page, total, client) => {
  hline(doc, PH - 12, ML, MR, C.RULE, 0.2);
  normal(doc, 6.5); rgb(doc, C.SUBTLE);
  doc.text(`Confidentiel — ${client}`, ML, PH - 8, { maxWidth: CW / 2 - 5 });
  doc.text(`Page ${page} / ${total}`, MR, PH - 8, { align: 'right' });
};

const chapter = (doc, num, title, y) => {
  fill(doc, C.NAVY);
  doc.roundedRect(ML, y, CW, 12, 1.5, 1.5, 'F');
  bold(doc, 9.5); rgb(doc, C.WHITE);
  doc.text(`${num}.  ${title.toUpperCase()}`, ML + 6, y + 8, { maxWidth: CW - 12 });
  return y + 18;
};

const section = (doc, title, y) => {
  fill(doc, C.MIST);
  doc.roundedRect(ML, y, CW, 9, 1, 1, 'F');
  bold(doc, 8.5); rgb(doc, C.BLUE);
  doc.text(title, ML + 4, y + 6.2, { maxWidth: CW - 8 });
  return y + 14;
};

const metricCard = (doc, x, y, w, h, label, value, sub, bg = C.NAVY, fg = C.WHITE) => {
  fill(doc, bg); doc.roundedRect(x, y, w, h, 3, 3, 'F');
  bold(doc, 6.5); rgb(doc, bg === C.NAVY ? [150, 175, 220] : C.SUBTLE);
  doc.text(label.toUpperCase(), x + 5, y + 7, { maxWidth: w - 8 });
  bold(doc, 13);  rgb(doc, fg);
  doc.text(String(value), x + 5, y + 19, { maxWidth: w - 8 });
  if (sub) { normal(doc, 6.5); rgb(doc, bg === C.NAVY ? [150, 175, 220] : C.SUBTLE); doc.text(sub, x + 5, y + 27, { maxWidth: w - 8 }); }
};

// ─── MAIN EXPORT (VOTRE STRUCTURE EXACTE) ─────────────────────────────────────
export const exportToPdf = async (responses, questionsConfig, aiResults, auditorInfo) => {
  try {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const { allSites, smpData } = useInspectionStore.getState();
    const client   = responses['nomination']?.value     || 'Entreprise Assurée';
    const adresse  = responses['adress']?.value          || '';
    const activite = responses['activite_nature']?.value || '';
    const expert   = auditorInfo?.name                  || 'Expert RiskPro';
    const societe  = auditorInfo?.company               || 'CIAR';
    const dateExp  = auditorInfo?.inspectionDate        || new Date().toLocaleDateString('fr-FR');
    const today    = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
    const nbSites  = Object.keys(allSites).length;

    // PAGE 1 — COUVERTURE (ORIGINALE)
    fill(doc, C.NAVY); doc.rect(0, 0, PW, PH, 'F');
    fill(doc, C.ACCENT); doc.rect(0, 0, 6, PH, 'F');
    fill(doc, C.GOLD);   doc.rect(6, 0, 2.5, PH, 'F');
    bold(doc, 9); rgb(doc, C.GOLD); doc.text('RAPPORT D\'AUDIT DE RISQUE', ML + 10, 68);
    bold(doc, 28); rgb(doc, C.WHITE); doc.text('VISITE DE RISQUE', ML + 10, 82);
    bold(doc, 14); rgb(doc, [150, 175, 220]); doc.text('& EXPERTISE CIAR', ML + 10, 92);
    fill(doc, C.GOLD); doc.rect(ML + 10, 98, 80, 0.8, 'F');
    fill(doc, [255, 255, 255]); doc.roundedRect(ML + 10, 112, CW - 10, 78, 3, 3, 'F');

    const infoRows = [
      ['Entreprise', client.toUpperCase()],
      ['Adresse', adresse || '—'],
      ['Activité', activite || '—'],
      ['Date de visite', dateExp],
      ['Expert', expert + (societe ? `  ·  ${societe}` : '')],
      ['Édité le', today],
    ];
    let iy = 120;
    infoRows.forEach(([lbl, val], i) => {
      if (i > 0) { stroke(doc, C.RULE); doc.setLineWidth(0.15); doc.line(ML + 14, iy - 2, MR - 4, iy - 2); }
      bold(doc, 7.5); rgb(doc, C.SUBTLE); doc.text(lbl, ML + 14, iy + 3);
      bold(doc, 8); rgb(doc, C.NAVY); doc.text(val, ML + 52, iy + 3, { maxWidth: MR - 4 - (ML + 52) });
      iy += 12;
    });

    fill(doc, C.ACCENT); doc.roundedRect(ML + 10, 198, 40, 14, 2, 2, 'F');
    bold(doc, 7); rgb(doc, C.WHITE); doc.text(`${nbSites} SITE(S) AUDITÉ(S)`, ML + 14, 206.5);
    normal(doc, 6.5); rgb(doc, [90, 110, 150]); doc.text('Document confidentiel — Usage exclusif CIAR et client désigné', ML + 10, PH - 14);

    // PAGE 2 — RÉSUMÉ EXÉCUTIF (ORIGINAL)
    doc.addPage();
    runningHeader(doc, client, 'Résumé Exécutif');
    let y = 22;
    y = chapter(doc, 1, 'Résumé Exécutif', y);

    if (aiResults || smpData) {
      const score = aiResults?.score_global ?? '—';
      const smp   = smpData?.smpFinal ? fmt(smpData.smpFinal) : '—';
      const cardW = (CW - 10) / 3;
      metricCard(doc, ML, y, cardW, 32, 'Indice de Maîtrise', `${score}%`, 'Score global consolidé');
      metricCard(doc, ML + cardW + 5, y, cardW, 32, 'SMP Final', smp.length > 14 ? smp.substring(0, 14) : smp, 'Sinistre Max. Possible', C.BLUE);
      metricCard(doc, ML + (cardW+5)*2, y, cardW, 32, 'Sites Audités', nbSites, 'Périmètre de la mission', C.ACCENT);
      y += 40;
    }

    if (aiResults?.synthese_executive) {
      bold(doc, 8.5); rgb(doc, C.NAVY); doc.text('Synthèse de l\'expert IA', ML, y); y += 6;
      const synth = doc.splitTextToSize(aiResults.synthese_executive, CW - 10);
      const synthH = synth.length * 5 + 10;
      fill(doc, C.MIST); doc.roundedRect(ML, y, CW, synthH, 2, 2, 'F');
      fill(doc, C.BLUE); doc.rect(ML, y, 3, synthH, 'F');
      italic(doc, 9); rgb(doc, C.BODY); doc.text(synth, ML + 8, y + 7);
      y += synthH + 10;
    }

    if (smpData?.valeurs) {
      y = needsPage(doc, y, 60, runningHeader, [client, 'Résumé Exécutif']);
      bold(doc, 8.5); rgb(doc, C.NAVY); doc.text('Détail des capitaux exposés (estimation)', ML, y); y += 5;
      doc.autoTable({
        startY: y,
        margin: { left: ML, right: PW - MR },
        head: [['Poste de valeur', 'Montant estimé']],
        body: [
          ['Bâtiments & Génie Civil', fmt(smpData.valeurs.batiment)],
          ['Matériels & Équipements', fmt(smpData.valeurs.materiel)],
          ['Stocks (Matières & Produits)', fmt(smpData.valeurs.stocks)],
          ['Pertes d\'Exploitation (12 m)', fmt(smpData.valeurs.pe)],
          [{ content: 'Total des capitaux exposés', styles: { fontStyle: 'bold' } }, { content: fmt(smpData.valeurs.total || 0), styles: { fontStyle: 'bold' } }],
        ],
        theme: 'grid',
        headStyles: { fillColor: C.NAVY, fontSize: 8 },
        columnStyles: { 1: { halign: 'right', cellWidth: 65 } }
      });
      y = doc.lastAutoTable.finalY + 8;
      if (smpData.scenario) {
        y = needsPage(doc, y, 25, runningHeader, [client, 'Résumé Exécutif']);
        bold(doc, 8); rgb(doc, C.NAVY); doc.text('Scénario de sinistre retenu', ML, y); y += 5;
        const sc = doc.splitTextToSize(smpData.scenario, CW - 6);
        italic(doc, 8); rgb(doc, C.BODY); doc.text(sc, ML + 4, y);
        y += sc.length * 5 + 8;
      }
    }

    // ANALYSE DES RISQUES (ORIGINAL)
    if (aiResults?.analyses_par_garantie?.length > 0) {
      doc.addPage();
      runningHeader(doc, client, 'Analyse des Risques');
      y = 22; y = chapter(doc, 2, 'Évaluation des risques par garantie', y);
      const garRows = aiResults.analyses_par_garantie.map(g => [g.garantie || '', `${g.exposition}/10`, '█'.repeat(Math.round(g.exposition)) + '░'.repeat(10 - Math.round(g.exposition)), g.avis_technique || '']);
      doc.autoTable({
        startY: y,
        margin: { left: ML, right: PW - MR },
        head: [['Garantie', 'Niveau', 'Exposition', 'Avis technique']],
        body: garRows,
        theme: 'striped',
        headStyles: { fillColor: C.NAVY, fontSize: 8 },
        columnStyles: { 0: { cellWidth: 38, fontStyle: 'bold' }, 1: { cellWidth: 16, halign: 'center' }, 2: { cellWidth: 28, font: 'courier' } },
      });
      y = doc.lastAutoTable.finalY + 12;

      const drawList = (title, items, color) => {
        if (!items?.length) return;
        y = section(doc, title, y);
        items.forEach(p => {
          y = needsPage(doc, y, 8, runningHeader, [client, 'Analyse des Risques']);
          fill(doc, color); doc.circle(ML + 3, y + 1, 1.2, 'F');
          normal(doc, 8); rgb(doc, C.BODY);
          const ls = doc.splitTextToSize(p, CW - 10);
          doc.text(ls, ML + 7, y + 2);
          y += ls.length * 5 + 3;
        });
        y += 4;
      };
      drawList('Points forts identifiés', aiResults.points_forts, C.GREEN);
      drawList('Axes d\'amélioration prioritaires', aiResults.axes_amelioration, C.ORANGE);
    }

    // PAGES SITES (VOS PAGES ORIGINALES AVEC CORRECTIF MARGE)
    let chapterNum = aiResults?.analyses_par_garantie?.length > 0 ? 3 : 2;
    for (const [siteId, site] of Object.entries(allSites)) {
      chapterNum++;
      const siteName = site.name || siteId;
      const siteResp = site.responses || {};
      doc.addPage(); runningHeader(doc, client, siteName); y = 22;
      y = chapter(doc, chapterNum, `Inspection — ${siteName}`, y);

      const skipIds = new Set(['nomination', 'adress', 'activite_nature', 'date_creation', 'superficie_totale', 'superficie_batie']);
      for (const sec of (questionsConfig || [])) {
        const qList = (sec.questions || []).filter(q => !skipIds.has(q.id) && siteResp[q.id]);
        if (qList.length === 0) continue;

        y = needsPage(doc, y, 20, runningHeader, [client, siteName]);
        y = section(doc, sec.title, y);

        for (const q of qList) {
          const r = siteResp[q.id];
          const hasScore = q.isScored && r.score != null;
          
          // --- SEULE MODIFICATION : DÉCOUPAGE DU TEXTE ---
          const labelMaxW = hasScore ? CW - 38 : CW - 6;
          const splitLabel = doc.splitTextToSize(q.label, labelMaxW);
          y = needsPage(doc, y, (splitLabel.length * 5) + 10, runningHeader, [client, siteName]);
          
          bold(doc, 7.5); rgb(doc, C.NAVY);
          doc.text(splitLabel, ML + 2, y); // Utilise splitLabel au lieu de q.label

          if (hasScore) {
            const col = scoreColor(r.score);
            for (let d = 4; d >= 0; d--) { fill(doc, d < r.score ? col : C.RULE); doc.circle(MR - 3 - (4 - d) * 5, y - 0.5, 1.8, 'F'); }
            bold(doc, 6.5); rgb(doc, col); doc.text(`${r.score}/5`, MR - 30, y + 4.5);
          }
          y += (splitLabel.length * 5) + 1; // Ajustement dynamique de y

          if (r.value || r.comment?.trim()) {
            const text = [r.value, r.comment?.trim()].filter(Boolean).join('  —  ');
            const ls = doc.splitTextToSize(text, CW - 14);
            normal(doc, 8); rgb(doc, C.BODY); doc.text(ls, ML + 4, y);
            y += ls.length * 5 + 2;
          }
          hline(doc, y, ML + 2, MR, C.RULE, 0.15); y += 5;
        }
      }

      // GALERIE PHOTOS SITE (ORIGINALE)
      const photoItems = [];
      for (const q of (questionsConfig || []).flatMap(s => s.questions)) {
        const r = siteResp[q.id];
        if (r?.photos?.length > 0) r.photos.forEach(ph => photoItems.push({ ...ph, questionLabel: q.label }));
      }
      if (photoItems.length > 0) {
        y = needsPage(doc, y, 20, runningHeader, [client, siteName]);
        y = section(doc, `Galerie photographique (${photoItems.length} photos)`, y);
        let col = 0; let rowY = y;
        const imgW = (CW - 5) / 2; const imgH = imgW * 0.65;
        for (let pi = 0; pi < photoItems.length; pi++) {
          const px = ML + col * (imgW + 5);
          if (col === 0) rowY = needsPage(doc, rowY, imgH + 15, runningHeader, [client, siteName]);
          fill(doc, C.MIST); doc.roundedRect(px, rowY, imgW, imgH, 1.5, 1.5, 'F');
          try { doc.addImage(photoItems[pi].url, 'JPEG', px, rowY, imgW, imgH); } catch { doc.text('[Erreur Image]', px + 5, rowY + 10); }
          bold(doc, 6.5); rgb(doc, C.NAVY); doc.text(doc.splitTextToSize(photoItems[pi].questionLabel || 'Photo', imgW - 2)[0], px, rowY + imgH + 4);
          col++; if (col >= 2) { col = 0; rowY += imgH + 15; }
        }
        y = rowY + 10;
      }
    }

    // PAGE SMP FINALE (VOTRE PAGE 10 ORIGINALE)
    if (smpData?.scenario || smpData?.smpFinal > 0) {
      chapterNum++; doc.addPage(); runningHeader(doc, client, 'Rapport de Scénario SMP');
      y = 22; y = chapter(doc, chapterNum, 'Rapport de Scénario — Estimation SMP', y);
      const totalExp = (smpData.valeurs?.batiment || 0) + (smpData.valeurs?.materiel || 0) + (smpData.valeurs?.stocks || 0) + (smpData.valeurs?.pe || 0);
      const cardW = (CW - 12) / 3;
      metricCard(doc, ML, y, cardW, 28, 'Sinistre Maximum Possible', fmt(smpData.smpFinal || 0), 'Montant SMP validé', C.NAVY);
      metricCard(doc, ML + cardW + 6, y, cardW, 28, 'Valeur Totale Assurée', fmt(totalExp), 'Somme des capitaux', C.BLUE);
      metricCard(doc, ML + (cardW+6)*2, y, cardW, 28, 'Taux SMP / VTA', `${(totalExp > 0 ? (smpData.smpFinal/totalExp*100) : 0).toFixed(1)}%`, 'Part du sinistre', C.ACCENT);
      y += 36;
      if (smpData.scenario) {
        y = section(doc, 'Scénario de sinistre retenu', y);
        const scLines = doc.splitTextToSize(smpData.scenario, CW - 12);
        const scH = scLines.length * 5.2 + 12;
        fill(doc, C.MIST); doc.roundedRect(ML, y, CW, scH, 2, 2, 'F');
        fill(doc, C.ACCENT); doc.rect(ML, y, 3.5, scH, 'F');
        italic(doc, 9); rgb(doc, C.BODY); doc.text(scLines, ML + 8, y + 8);
        y += scH + 10;
      }
      doc.autoTable({ startY: y, margin: { left: ML, right: PW - MR }, head: [['Poste de valeur', 'Montant estimé (DZD)']], body: [['Bâtiments', fmt(smpData.valeurs?.batiment)], ['Matériels', fmt(smpData.valeurs?.materiel)], ['Stocks', fmt(smpData.valeurs?.stocks)], ['P.E.', fmt(smpData.valeurs?.pe)], [{content:'Total', styles:{fontStyle:'bold'}}, {content:fmt(totalExp), styles:{fontStyle:'bold'}}]], theme:'grid' });
    }

    // PAGE SIGNATURES (ORIGINALE)
    doc.addPage(); runningHeader(doc, client, 'Validation'); y = 22;
    y = chapter(doc, ++chapterNum, 'Validation & Signatures', y);
    const attLines = doc.splitTextToSize(`Le présent rapport a été établi le ${today} par ${expert} (${societe})...`, CW);
    doc.text(attLines, ML, y); y += 30;
    const drawSig = (x, title, name) => {
      fill(doc, C.MIST); doc.roundedRect(x, y, (CW-10)/2, 45, 2, 2, 'F');
      bold(doc, 8); rgb(doc, C.NAVY); doc.text(title, x + 5, y + 7);
      doc.text(name, x + 5, y + 17);
    };
    drawSig(ML, "L'EXPERT CIAR", expert); drawSig(ML + (CW-10)/2 + 10, "LE CLIENT", client);

    // NUMÉROTATION
    const total = doc.internal.getNumberOfPages();
    for (let i = 2; i <= total; i++) { doc.setPage(i); runningFooter(doc, i, total, client); }
    doc.save(`AUDIT_CIAR_${client.replace(/\s+/g, '_')}.pdf`);
  } catch (err) { console.error(err); }
};
