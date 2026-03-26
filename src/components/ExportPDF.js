import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useInspectionStore } from '../hooks/useInspectionStore';

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
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

// ─── UTILITIES ────────────────────────────────────────────────────────────────
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

// ─── RUNNING HEADER ───────────────────────────────────────────────────────────
const runningHeader = (doc, client, section = '') => {
  fill(doc, C.NAVY);
  doc.rect(0, 0, PW, 10, 'F');
  bold(doc, 6.5); rgb(doc, C.WHITE);
  doc.text('RAPPORT D\'AUDIT DE RISQUE  ·  CIAR', ML, 6.5);
  normal(doc, 6.5); rgb(doc, [180, 195, 220]);
  doc.text(client.toUpperCase(), PW / 2, 6.5, { align: 'center' });
  if (section) doc.text(section, MR, 6.5, { align: 'right' });
};

// ─── RUNNING FOOTER ───────────────────────────────────────────────────────────
const runningFooter = (doc, page, total, client) => {
  hline(doc, PH - 12, ML, MR, C.RULE, 0.2);
  normal(doc, 6.5); rgb(doc, C.SUBTLE);
  doc.text(`Confidentiel — ${client}`, ML, PH - 8, { maxWidth: CW / 2 - 5 });
  doc.text(`Page ${page} / ${total}`, MR, PH - 8, { align: 'right' });
};

// ─── CHAPTER HEADING ─────────────────────────────────────────────────────────
const chapter = (doc, num, title, y) => {
  fill(doc, C.NAVY);
  doc.roundedRect(ML, y, CW, 12, 1.5, 1.5, 'F');
  bold(doc, 9.5); rgb(doc, C.WHITE);
  doc.text(`${num}.  ${title.toUpperCase()}`, ML + 6, y + 8, { maxWidth: CW - 12 });
  return y + 18;
};

// ─── SECTION HEADING ─────────────────────────────────────────────────────────
const section = (doc, title, y) => {
  fill(doc, C.MIST);
  doc.roundedRect(ML, y, CW, 9, 1, 1, 'F');
  bold(doc, 8.5); rgb(doc, C.BLUE);
  doc.text(title, ML + 4, y + 6.2, { maxWidth: CW - 8 });
  return y + 14;
};

// ─── METRIC CARD ─────────────────────────────────────────────────────────────
const metricCard = (doc, x, y, w, h, label, value, sub, bg = C.NAVY, fg = C.WHITE) => {
  fill(doc, bg); doc.roundedRect(x, y, w, h, 3, 3, 'F');
  bold(doc, 6.5); rgb(doc, bg === C.NAVY ? [150, 175, 220] : C.SUBTLE);
  doc.text(label.toUpperCase(), x + 5, y + 7, { maxWidth: w - 8 });
  bold(doc, 13);  rgb(doc, fg);
  doc.text(String(value), x + 5, y + 19, { maxWidth: w - 8 });
  if (sub) { normal(doc, 6.5); rgb(doc, bg === C.NAVY ? [150, 175, 220] : C.SUBTLE); doc.text(sub, x + 5, y + 27, { maxWidth: w - 8 }); }
};

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────
export const exportToPdf = async (responses, questionsConfig, aiResults, auditorInfo) => {
  try {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const { allSites, smpData } = useInspectionStore.getState();
    const client   = responses['nomination']?.value     || 'Entreprise Assurée';
    const adresse  = responses['adress']?.value         || '';
    const activite = responses['activite_nature']?.value || '';
    const expert   = auditorInfo?.name                  || 'Expert RiskPro';
    const societe  = auditorInfo?.company               || 'CIAR';
    const dateExp  = auditorInfo?.inspectionDate        || new Date().toLocaleDateString('fr-FR');
    const today    = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
    const nbSites  = Object.keys(allSites).length;

    // ══════════════════════════════════════════════════════════════════════════
    // PAGE 1 — COUVERTURE
    // ══════════════════════════════════════════════════════════════════════════
    fill(doc, C.NAVY); doc.rect(0, 0, PW, PH, 'F');
    // Bande décorative
    fill(doc, C.ACCENT); doc.rect(0, 0, 6, PH, 'F');
    fill(doc, C.GOLD);   doc.rect(6, 0, 2.5, PH, 'F');

    // Titre du rapport
    bold(doc, 9); rgb(doc, C.GOLD);
    doc.text('RAPPORT D\'AUDIT DE RISQUE', ML + 10, 68);
    bold(doc, 28); rgb(doc, C.WHITE);
    doc.text('VISITE DE RISQUE', ML + 10, 82);
    bold(doc, 14); rgb(doc, [150, 175, 220]);
    doc.text('& EXPERTISE CIAR', ML + 10, 92);

    // Ligne dorée
    fill(doc, C.GOLD); doc.rect(ML + 10, 98, 80, 0.8, 'F');

    // Bloc infos client (carte blanche)
    fill(doc, [255, 255, 255]); doc.roundedRect(ML + 10, 112, CW - 10, 78, 3, 3, 'F');

    const infoRows = [
      ['Entreprise',    client.toUpperCase()],
      ['Adresse',       adresse || '—'],
      ['Activité',      activite || '—'],
      ['Date de visite', dateExp],
      ['Expert',        expert + (societe ? `  ·  ${societe}` : '')],
      ['Édité le',      today],
    ];
    let iy = 120;
    infoRows.forEach(([lbl, val], i) => {
      if (i > 0) { stroke(doc, C.RULE); doc.setLineWidth(0.15); doc.line(ML + 14, iy - 2, MR - 4, iy - 2); }
      bold(doc, 7.5); rgb(doc, C.SUBTLE); doc.text(lbl, ML + 14, iy + 3);
      bold(doc, 8);   rgb(doc, C.NAVY);   doc.text(val, ML + 52, iy + 3, { maxWidth: MR - 4 - (ML + 52) });
      iy += 12;
    });

    // Nombre de sites badge
    fill(doc, C.ACCENT);
    doc.roundedRect(ML + 10, 198, 40, 14, 2, 2, 'F');
    bold(doc, 7); rgb(doc, C.WHITE);
    doc.text(`${nbSites} SITE(S) AUDITÉ(S)`, ML + 14, 206.5);

    // Pied de couverture
    normal(doc, 6.5); rgb(doc, [90, 110, 150]);
    doc.text('Document confidentiel — Usage exclusif CIAR et client désigné', ML + 10, PH - 14);

    // ══════════════════════════════════════════════════════════════════════════
    // PAGE 2 — RÉSUMÉ EXÉCUTIF
    // ══════════════════════════════════════════════════════════════════════════
    doc.addPage();
    runningHeader(doc, client, 'Résumé Exécutif');
    let y = 22;

    y = chapter(doc, 1, 'Résumé Exécutif', y);

    // Cartes métriques
    if (aiResults || smpData) {
      const score = aiResults?.score_global ?? '—';
      const smp   = smpData?.smpFinal ? fmt(smpData.smpFinal) : '—';
      const cardW = (CW - 10) / 3;

      metricCard(doc, ML,              y, cardW, 32, 'Indice de Maîtrise', `${score}%`, 'Score global consolidé');
      metricCard(doc, ML + cardW + 5,  y, cardW, 32, 'SMP Final', smp.length > 14 ? smp.substring(0, 14) : smp, 'Sinistre Max. Possible', C.BLUE);
      metricCard(doc, ML + (cardW+5)*2, y, cardW, 32, 'Sites Audités', nbSites, 'Périmètre de la mission', C.ACCENT);
      y += 40;
    }

    // Synthèse exécutive IA
    if (aiResults?.synthese_executive) {
      bold(doc, 8.5); rgb(doc, C.NAVY); doc.text('Synthèse de l\'expert IA', ML, y); y += 6;
      fill(doc, C.MIST); doc.roundedRect(ML, y, CW, 1, 1, 1, 'F');

      const synth  = doc.splitTextToSize(aiResults.synthese_executive, CW - 10);
      const synthH = synth.length * 5 + 10;
      fill(doc, C.MIST); doc.roundedRect(ML, y, CW, synthH, 2, 2, 'F');
      fill(doc, C.BLUE); doc.rect(ML, y, 3, synthH, 'F');
      italic(doc, 9); rgb(doc, C.BODY);
      doc.text(synth, ML + 8, y + 7);
      y += synthH + 10;
    }

    // Capitaux exposés
    if (smpData?.valeurs) {
      y = needsPage(doc, y, 60, runningHeader, [client, 'Résumé Exécutif']);
      bold(doc, 8.5); rgb(doc, C.NAVY); doc.text('Détail des capitaux exposés (estimation)', ML, y); y += 5;

      doc.autoTable({
        startY: y,
        margin: { left: ML, right: PW - MR },
        head: [['Poste de valeur', 'Montant estimé']],
        body: [
          ['Bâtiments & Génie Civil',      fmt(smpData.valeurs.batiment)],
          ['Matériels & Équipements',       fmt(smpData.valeurs.materiel)],
          ['Stocks (Matières & Produits)',  fmt(smpData.valeurs.stocks)],
          ['Pertes d\'Exploitation (12 m)', fmt(smpData.valeurs.pe)],
          [
            { content: 'Total des capitaux exposés', styles: { fontStyle: 'bold' } },
            { content: fmt(smpData.valeurs.total ?? (
              (smpData.valeurs.batiment || 0) + (smpData.valeurs.materiel || 0) +
              (smpData.valeurs.stocks || 0)   + (smpData.valeurs.pe || 0)
            )), styles: { fontStyle: 'bold' } }
          ],
        ],
        theme: 'grid',
        headStyles: { fillColor: C.NAVY, textColor: 255, fontSize: 8, fontStyle: 'bold' },
        bodyStyles: { fontSize: 8.5, textColor: C.BODY },
        columnStyles: { 1: { halign: 'right', cellWidth: 65 } },
        alternateRowStyles: { fillColor: [249, 250, 253] },
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

    // ══════════════════════════════════════════════════════════════════════════
    // PAGE 3 — ANALYSE DES RISQUES PAR GARANTIE
    // ══════════════════════════════════════════════════════════════════════════
    if (aiResults?.analyses_par_garantie?.length > 0) {
      doc.addPage();
      runningHeader(doc, client, 'Analyse des Risques');
      y = 22;
      y = chapter(doc, 2, 'Évaluation des risques par garantie', y);

      const garRows = aiResults.analyses_par_garantie.map(g => {
        const expo = Number(g.exposition) || 0;
        const bar  = '█'.repeat(Math.round(expo)) + '░'.repeat(10 - Math.round(expo));
        return [g.garantie || '', `${expo}/10`, bar, g.avis_technique || ''];
      });

      doc.autoTable({
        startY: y,
        margin: { left: ML, right: PW - MR },
        head: [['Garantie', 'Niveau', 'Exposition', 'Avis technique']],
        body: garRows,
        theme: 'striped',
        headStyles: { fillColor: C.NAVY, textColor: 255, fontSize: 8, fontStyle: 'bold' },
        bodyStyles: { fontSize: 8, textColor: C.BODY },
        columnStyles: {
          0: { cellWidth: 38, fontStyle: 'bold' },
          1: { cellWidth: 16, halign: 'center' },
          2: { cellWidth: 28, font: 'courier', fontSize: 7 },
          3: { cellWidth: 'auto' },
        },
        alternateRowStyles: { fillColor: [249, 250, 253] },
        didParseCell: (data) => {
          if (data.column.index === 1 && data.section === 'body') {
            const v = parseFloat(data.cell.raw);
            if (v >= 7)       data.cell.styles.textColor = C.RED;
            else if (v >= 4)  data.cell.styles.textColor = C.ORANGE;
            else              data.cell.styles.textColor = C.GREEN;
          }
        }
      });
      y = doc.lastAutoTable.finalY + 12;

      // Points forts
      if (aiResults.points_forts?.length > 0) {
        y = needsPage(doc, y, 30, runningHeader, [client, 'Analyse des Risques']);
        y = section(doc, 'Points forts identifiés', y);
        aiResults.points_forts.forEach(p => {
          y = needsPage(doc, y, 8, runningHeader, [client, 'Analyse des Risques']);
          fill(doc, C.GREEN); doc.circle(ML + 3, y + 1, 1.2, 'F');
          normal(doc, 8); rgb(doc, C.BODY);
          const ls = doc.splitTextToSize(p, CW - 10);
          doc.text(ls, ML + 7, y + 2);
          y += ls.length * 5 + 3;
        });
        y += 4;
      }

      // Axes d'amélioration
      if (aiResults.axes_amelioration?.length > 0) {
        y = needsPage(doc, y, 30, runningHeader, [client, 'Analyse des Risques']);
        y = section(doc, 'Axes d\'amélioration prioritaires', y);
        aiResults.axes_amelioration.forEach(p => {
          y = needsPage(doc, y, 8, runningHeader, [client, 'Analyse des Risques']);
          fill(doc, C.ORANGE); doc.circle(ML + 3, y + 1, 1.2, 'F');
          normal(doc, 8); rgb(doc, C.BODY);
          const ls = doc.splitTextToSize(p, CW - 10);
          doc.text(ls, ML + 7, y + 2);
          y += ls.length * 5 + 3;
        });
        y += 4;
      }

      // Recommandations
      if (aiResults.recommandations?.length > 0) {
        y = needsPage(doc, y, 30, runningHeader, [client, 'Analyse des Risques']);
        y = section(doc, 'Recommandations', y);
        aiResults.recommandations.forEach((r, i) => {
          y = needsPage(doc, y, 10, runningHeader, [client, 'Analyse des Risques']);
          bold(doc, 8); rgb(doc, C.BLUE); doc.text(`${i + 1}.`, ML + 2, y + 2);
          normal(doc, 8); rgb(doc, C.BODY);
          const ls = doc.splitTextToSize(r, CW - 10);
          doc.text(ls, ML + 9, y + 2);
          y += ls.length * 5 + 4;
        });
      }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // PAGES SITE — RAPPORT DE VISITE PAR SITE
    // ══════════════════════════════════════════════════════════════════════════
    let chapterNum = aiResults?.analyses_par_garantie?.length > 0 ? 3 : 2;

    for (const [siteId, site] of Object.entries(allSites)) {
      chapterNum++;
      const siteName  = site.name || siteId;
      const siteResp  = site.responses || {};
      const headerFn  = (d, c, s) => runningHeader(d, c, s);

      doc.addPage();
      runningHeader(doc, client, siteName);
      y = 22;
      y = chapter(doc, chapterNum, `Inspection — ${siteName}`, y);

      // Fiche identité du site
      const siteInfo = [
        ['Superficie totale',  siteResp['superficie_totale']?.value],
        ['Superficie bâtie',   siteResp['superficie_batie']?.value],
        ['Compartimentage',    siteResp['compartimentage']?.value],
        ['Date de création',   siteResp['date_creation']?.value],
      ].filter(([, v]) => v);

      if (siteInfo.length > 0) {
        bold(doc, 8); rgb(doc, C.SUBTLE);
        doc.text('FICHE SITE', ML, y); y += 5;

        doc.autoTable({
          startY: y,
          margin: { left: ML, right: PW - MR },
          body: siteInfo,
          theme: 'plain',
          bodyStyles: { fontSize: 8, cellPadding: { top: 2, bottom: 2, left: 3, right: 3 } },
          columnStyles: {
            0: { fontStyle: 'bold', textColor: C.NAVY, cellWidth: 50 },
            1: { textColor: C.BODY },
          },
          tableLineColor: C.RULE,
          tableLineWidth: 0.15,
        });
        y = doc.lastAutoTable.finalY + 10;
      }

      // ── Sections thématiques ──────────────────────────────────────────────
      const skipIds = new Set(['nomination', 'adress', 'activite_nature', 'date_creation', 'superficie_totale', 'superficie_batie']);

      for (const sec of (questionsConfig || [])) {
        const qList = (sec.questions || []).filter(q => !skipIds.has(q.id));
        const scored = qList.filter(q => q.isScored && siteResp[q.id]?.score != null);
        const hasData = qList.some(q => {
          const r = siteResp[q.id];
          return r && (r.value || r.comment || r.score != null);
        });
        if (!hasData) continue;

        y = needsPage(doc, y, 20, runningHeader, [client, siteName]);
        y = section(doc, sec.title, y);

        // Score moyen de section (si questions scorées)
        if (scored.length > 0) {
          const avg = scored.reduce((a, q) => a + siteResp[q.id].score, 0) / scored.length;
          const col = scoreColor(avg);
          fill(doc, col); doc.roundedRect(MR - 36, y - 14, 36, 8, 1.5, 1.5, 'F');
          bold(doc, 6.5); rgb(doc, C.WHITE);
          doc.text(`Moy. ${avg.toFixed(1)}/5 — ${scoreLabel(avg)}`, MR - 34, y - 9.5, { maxWidth: 32 });
        }

        for (const q of qList) {
          const r = siteResp[q.id];
          if (!r) continue;
          const hasContent = r.value || r.comment?.trim();
          const hasScore   = q.isScored && r.score != null;
          const hasPhotos  = r.photos?.length > 0;
          if (!hasContent && !hasScore && !hasPhotos) continue;

          y = needsPage(doc, y, 14, runningHeader, [client, siteName]);

          // Libellé de la question (largeur réduite si score présent pour éviter la collision)
          const labelMaxW = hasScore ? CW - 38 : CW - 6;
          bold(doc, 7.5); rgb(doc, C.NAVY);
          doc.text(q.label, ML + 2, y, { maxWidth: labelMaxW });

          // Score visuel (5 pastilles + valeur, alignées à droite)
          if (hasScore) {
            const sc  = r.score;
            const col = scoreColor(sc);
            for (let d = 4; d >= 0; d--) {
              fill(doc, d < sc ? col : C.RULE);
              doc.circle(MR - 3 - (4 - d) * 5, y - 0.5, 1.8, 'F');
            }
            bold(doc, 6.5); rgb(doc, col);
            doc.text(`${sc}/5`, MR - 30, y + 4.5);
          }
          y += 6;

          // Observation / valeur
          if (r.value || r.comment?.trim()) {
            const text = [r.value, r.comment?.trim()].filter(Boolean).join('  —  ');
            const ls = doc.splitTextToSize(text, CW - 14);
            normal(doc, 8); rgb(doc, C.BODY);
            doc.text(ls, ML + 4, y);
            y += ls.length * 5 + 2;
          }

          hline(doc, y, ML + 2, MR, C.RULE, 0.15); y += 5;
        }

        y += 4;
      }

      // ── Galerie photos du site ────────────────────────────────────────────
      const photoItems = [];
      for (const q of (questionsConfig || []).flatMap(s => s.questions)) {
        const r = siteResp[q.id];
        if (r?.photos?.length > 0) {
          r.photos.forEach(ph => photoItems.push({ ...ph, questionLabel: q.label }));
        }
      }

      if (photoItems.length > 0) {
        y = needsPage(doc, y, 20, runningHeader, [client, siteName]);
        y = section(doc, `Galerie photographique (${photoItems.length} photo${photoItems.length > 1 ? 's' : ''})`, y);

        const cols   = 2;
        const gap    = 5;
        const imgW   = (CW - gap) / cols;
        const imgH   = imgW * 0.65;
        const capH   = 10;
        const cellH  = imgH + capH;

        let col = 0;
        let rowY = y;

        for (let pi = 0; pi < photoItems.length; pi++) {
          const ph  = photoItems[pi];
          const px  = ML + col * (imgW + gap);

          if (col === 0) {
            rowY = needsPage(doc, rowY, cellH + 4, runningHeader, [client, siteName]);
            if (pi > 0) rowY += 4;
          }

          // Cadre photo
          fill(doc, C.MIST); doc.roundedRect(px, rowY, imgW, imgH, 1.5, 1.5, 'F');
          try {
            doc.addImage(ph.url, 'JPEG', px, rowY, imgW, imgH);
          } catch {
            normal(doc, 7); rgb(doc, C.SUBTLE);
            doc.text('[Image non disponible]', px + 4, rowY + imgH / 2);
          }

          // Légende structurée
          bold(doc, 6.5); rgb(doc, C.NAVY);
          doc.text(
            ph.questionLabel ? doc.splitTextToSize(ph.questionLabel, imgW - 2)[0] : 'Photo',
            px, rowY + imgH + 4
          );
          normal(doc, 6); rgb(doc, C.SUBTLE);
          doc.text(
            ph.timestamp ? new Date(ph.timestamp).toLocaleString('fr-FR') : '',
            px, rowY + imgH + 8
          );

          col++;
          if (col >= cols) { col = 0; rowY += cellH + 10; }
        }
        if (col > 0) rowY += cellH + 10;
        y = rowY;
      }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // PAGE — RAPPORT DE SCÉNARIO SMP
    // ══════════════════════════════════════════════════════════════════════════
    const hasSmpContent = smpData?.scenario || smpData?.smpFinal > 0 ||
      Object.values(smpData?.valeurs || {}).some(v => v > 0) ||
      smpData?.hypotheses?.length > 0;

    if (hasSmpContent) {
      chapterNum++;
      doc.addPage();
      runningHeader(doc, client, 'Rapport de Scénario SMP');
      y = 22;
      y = chapter(doc, chapterNum, 'Rapport de Scénario — Estimation SMP', y);

      // Carte SMP Final
      const totalExp = (smpData.valeurs?.batiment || 0) + (smpData.valeurs?.materiel || 0) +
                       (smpData.valeurs?.stocks || 0) + (smpData.valeurs?.pe || 0);
      const smpPct = totalExp > 0 ? ((smpData.smpFinal || 0) / totalExp * 100) : 0;
      const cardW = (CW - 12) / 3;
      metricCard(doc, ML,                  y, cardW, 28, 'Sinistre Maximum Possible', fmt(smpData.smpFinal || 0), 'Montant SMP validé expert IA', C.NAVY);
      metricCard(doc, ML + cardW + 6,      y, cardW, 28, 'Valeur Totale Assurée (VTA)', fmt(totalExp), 'Somme des capitaux assurés', C.BLUE);
      metricCard(doc, ML + (cardW + 6) * 2, y, cardW, 28, 'Taux SMP / VTA', `${smpPct.toFixed(1)} %`, 'Part du sinistre sur la VTA', C.ACCENT);
      y += 36;

      // Scénario de référence
      if (smpData.scenario) {
        y = needsPage(doc, y, 30, runningHeader, [client, 'Rapport de Scénario SMP']);
        y = section(doc, 'Scénario de sinistre retenu', y);
        const scLines = doc.splitTextToSize(smpData.scenario, CW - 12);
        const scH = scLines.length * 5.2 + 12;
        fill(doc, C.MIST); doc.roundedRect(ML, y, CW, scH, 2, 2, 'F');
        fill(doc, C.ACCENT); doc.rect(ML, y, 3.5, scH, 'F');
        italic(doc, 9); rgb(doc, C.BODY);
        doc.text(scLines, ML + 8, y + 8);
        y += scH + 10;
      }

      // Ventilation des valeurs
      y = needsPage(doc, y, 50, runningHeader, [client, 'Rapport de Scénario SMP']);
      y = section(doc, 'Ventilation des Valeurs Totales Assurées (VTA)', y);

      doc.autoTable({
        startY: y,
        margin: { left: ML, right: PW - MR },
        head: [['Poste de valeur', 'Montant estimé (DZD)']],
        body: [
          ['Bâtiments & Génie Civil',       fmt(smpData.valeurs?.batiment)],
          ['Matériels & Équipements',        fmt(smpData.valeurs?.materiel)],
          ['Stocks (Matières & Produits)',   fmt(smpData.valeurs?.stocks)],
          ["Pertes d'Exploitation (12 mois)", fmt(smpData.valeurs?.pe)],
          [
            { content: 'Total des capitaux exposés', styles: { fontStyle: 'bold' } },
            { content: fmt(totalExp), styles: { fontStyle: 'bold' } }
          ],
        ],
        theme: 'grid',
        headStyles: { fillColor: C.NAVY, textColor: 255, fontSize: 8, fontStyle: 'bold' },
        bodyStyles: { fontSize: 9, textColor: C.BODY },
        columnStyles: { 1: { halign: 'right', cellWidth: 68 } },
        alternateRowStyles: { fillColor: [249, 250, 253] },
      });
      y = doc.lastAutoTable.finalY + 12;

      // Hypothèses techniques
      if (smpData.hypotheses?.length > 0) {
        y = needsPage(doc, y, 30, runningHeader, [client, 'Rapport de Scénario SMP']);
        y = section(doc, 'Hypothèses techniques retenues', y);
        smpData.hypotheses.forEach((h, i) => {
          y = needsPage(doc, y, 10, runningHeader, [client, 'Rapport de Scénario SMP']);
          fill(doc, C.BLUE); doc.roundedRect(ML, y - 3, 5, 5, 1, 1, 'F');
          bold(doc, 7); rgb(doc, C.WHITE);
          doc.text(String(i + 1), ML + 1.5, y + 0.5);
          normal(doc, 8.5); rgb(doc, C.BODY);
          const hLines = doc.splitTextToSize(h, CW - 12);
          doc.text(hLines, ML + 9, y);
          y += hLines.length * 5 + 4;
        });
      }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // PAGE FINALE — SIGNATURES
    // ══════════════════════════════════════════════════════════════════════════
    doc.addPage();
    runningHeader(doc, client, 'Validation');
    y = 22;
    chapterNum++;
    y = chapter(doc, chapterNum, 'Validation & Signatures', y);

    normal(doc, 9); rgb(doc, C.BODY);
    const attestation =
      `Le présent rapport d'audit de risque a été établi le ${today} par ${expert} (${societe}) ` +
      `à l'issue de la visite de risque du site de ${client}${adresse ? ', situé à ' + adresse : ''}. ` +
      `Il constitue un document confidentiel et ne peut être divulgué à des tiers sans accord préalable de CIAR.`;
    const attLines = doc.splitTextToSize(attestation, CW);
    doc.text(attLines, ML, y); y += attLines.length * 6 + 16;

    hline(doc, y, ML, MR, C.NAVY, 0.4); y += 12;

    // Deux cadres de signature côte à côte
    const sigW = (CW - 10) / 2;
    const sigH = 48;
    const sigY = y;

    const drawSigBox = (x, label, name, role) => {
      fill(doc, C.MIST); doc.roundedRect(x, sigY, sigW, sigH, 2, 2, 'F');
      stroke(doc, C.NAVY); doc.setLineWidth(0.4);
      doc.roundedRect(x, sigY, sigW, sigH, 2, 2, 'S');
      fill(doc, C.NAVY); doc.roundedRect(x, sigY, sigW, 10, 2, 2, 'F');
      doc.rect(x, sigY + 8, sigW, 2, 'F');
      bold(doc, 8); rgb(doc, C.WHITE); doc.text(label, x + 4, sigY + 7);
      bold(doc, 8); rgb(doc, C.NAVY); doc.text(name, x + 4, sigY + 17);
      normal(doc, 7); rgb(doc, C.SUBTLE); doc.text(role, x + 4, sigY + 23);
      normal(doc, 7); rgb(doc, C.SUBTLE); doc.text('Cachet & Signature :', x + 4, sigY + 31);
      hline(doc, sigY + sigH - 8, x + 4, x + sigW - 4, C.RULE, 0.3);
    };

    drawSigBox(ML,             "L'EXPERT CIAR",        expert,  societe);
    drawSigBox(ML + sigW + 10, "LE CLIENT",             client,  "Représentant habilité");

    normal(doc, 6.5); rgb(doc, C.SUBTLE);
    doc.text(
      'Document établi conformément aux procédures d\'audit CIAR.',
      PW / 2, sigY + sigH + 14, { align: 'center' }
    );

    // ══════════════════════════════════════════════════════════════════════════
    // NUMÉROTATION FINALE
    // ══════════════════════════════════════════════════════════════════════════
    const total = doc.internal.getNumberOfPages();
    for (let i = 2; i <= total; i++) {
      doc.setPage(i);
      runningFooter(doc, i, total, client);
    }

    const fileName = `AUDIT_CIAR_${client.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);

  } catch (err) {
    console.error('PDF Export error:', err);
    alert('Erreur lors de la génération du rapport : ' + err.message);
  }
};
