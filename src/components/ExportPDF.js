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
  if (y + h > PH - 22) {
    doc.addPage();
    if (addHeader) addHeader(doc, ...args);
    return 25; 
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
const sectionStyle = (doc, title, y) => {
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
    const adresse  = responses['adress']?.value          || '';
    const activite = responses['activite_nature']?.value || '';
    const expert   = auditorInfo?.name                  || 'Expert CIAR';
    const societe  = auditorInfo?.company               || 'CIAR';
    const dateExp  = auditorInfo?.inspectionDate        || new Date().toLocaleDateString('fr-FR');
    const today    = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
    const nbSites  = Object.keys(allSites).length;

    // PAGE 1 — COUVERTURE
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
      ['Expert', expert + (societe ? ` · ${societe}` : '')],
      ['Édité le', today],
    ];
    let iy = 120;
    infoRows.forEach(([lbl, val], i) => {
      if (i > 0) { stroke(doc, C.RULE); doc.setLineWidth(0.15); doc.line(ML + 14, iy - 2, MR - 4, iy - 2); }
      bold(doc, 7.5); rgb(doc, C.SUBTLE); doc.text(lbl, ML + 14, iy + 3);
      bold(doc, 8); rgb(doc, C.NAVY); 
      doc.text(val, ML + 52, iy + 3, { maxWidth: MR - 4 - (ML + 52) });
      iy += 12;
    });

    // PAGE 2 — RÉSUMÉ EXÉCUTIF
    doc.addPage();
    runningHeader(doc, client, 'Résumé Exécutif');
    let y = 22;
    y = chapter(doc, 1, 'Résumé Exécutif', y);

    if (aiResults || smpData) {
      const score = aiResults?.score_global ?? '—';
      const smp = smpData?.smpFinal ? fmt(smpData.smpFinal) : '—';
      const cardW = (CW - 10) / 3;
      metricCard(doc, ML, y, cardW, 32, 'Indice de Maîtrise', `${score}%`, 'Score global');
      metricCard(doc, ML + cardW + 5, y, cardW, 32, 'SMP Final', smp, 'Sinistre Max.', C.BLUE);
      metricCard(doc, ML + (cardW+5)*2, y, cardW, 32, 'Sites Audités', nbSites, 'Périmètre', C.ACCENT);
      y += 40;
    }

    if (aiResults?.synthese_executive) {
      bold(doc, 8.5); rgb(doc, C.NAVY); doc.text('Synthèse de l\'expert IA', ML, y); y += 6;
      const synth = doc.splitTextToSize(aiResults.synthese_executive, CW - 12);
      const synthH = synth.length * 5 + 10;
      y = needsPage(doc, y, synthH + 10, runningHeader, [client, 'Résumé Exécutif']);
      fill(doc, C.MIST); doc.roundedRect(ML, y, CW, synthH, 2, 2, 'F');
      fill(doc, C.BLUE); doc.rect(ML, y, 3, synthH, 'F');
      italic(doc, 9); rgb(doc, C.BODY); doc.text(synth, ML + 8, y + 7);
      y += synthH + 10;
    }

    // TABLEAUX AVEC MARGES FIXES
    if (smpData?.valeurs) {
      y = needsPage(doc, y, 60, runningHeader, [client, 'Résumé Exécutif']);
      bold(doc, 8.5); rgb(doc, C.NAVY); doc.text('Détail des capitaux exposés', ML, y); y += 5;
      doc.autoTable({
        startY: y,
        margin: { left: ML, right: ML },
        head: [['Poste de valeur', 'Montant estimé']],
        body: [
          ['Bâtiments & Génie Civil', fmt(smpData.valeurs.batiment)],
          ['Matériels & Équipements', fmt(smpData.valeurs.materiel)],
          ['Stocks', fmt(smpData.valeurs.stocks)],
          ['Pertes d\'Exploitation', fmt(smpData.valeurs.pe)],
        ],
        theme: 'grid',
        headStyles: { fillColor: C.NAVY, fontSize: 8 },
        columnStyles: { 1: { halign: 'right' } }
      });
      y = doc.lastAutoTable.finalY + 10;
    }

    // PAGES INSPECTION SITES (Correction majeure ici)
    let chapterNum = 2;
    for (const [siteId, site] of Object.entries(allSites)) {
      chapterNum++;
      const siteName = site.name || siteId;
      const siteResp = site.responses || {};
      doc.addPage();
      runningHeader(doc, client, siteName);
      y = 22;
      y = chapter(doc, chapterNum, `Inspection — ${siteName}`, y);

      for (const sec of questionsConfig) {
        const qList = (sec.questions || []).filter(q => {
          const r = siteResp[q.id];
          return r && (r.value || r.comment || r.score != null);
        });
        if (qList.length === 0) continue;

        y = needsPage(doc, y, 20, runningHeader, [client, siteName]);
        y = sectionStyle(doc, sec.title, y);

        for (const q of qList) {
          const r = siteResp[q.id];
          const hasScore = q.isScored && r.score != null;
          
          // 1. CALCUL ET AFFICHAGE DU LIBELLÉ (SPLIT SI TROP LONG)
          const labelMaxW = hasScore ? CW - 45 : CW - 5;
          const labelLines = doc.splitTextToSize(q.label, labelMaxW);
          const blockH = (labelLines.length * 5) + 12; // Estimation hauteur bloc question

          y = needsPage(doc, y, blockH, runningHeader, [client, siteName]);
          bold(doc, 7.5); rgb(doc, C.NAVY);
          doc.text(labelLines, ML + 2, y);

          // 2. SCORE (ALIGNÉ À DROITE)
          if (hasScore) {
            rgb(doc, scoreColor(r.score));
            doc.text(`${r.score}/5`, MR - 2, y, { align: 'right' });
          }
          
          y += (labelLines.length * 5);

          // 3. RÉPONSE ET COMMENTAIRE (SÉCURISÉ)
          if (r.value || r.comment) {
            const text = [r.value, r.comment?.trim()].filter(Boolean).join('  —  ');
            const responseLines = doc.splitTextToSize(text, CW - 12);
            y = needsPage(doc, y, responseLines.length * 5 + 5, runningHeader, [client, siteName]);
            normal(doc, 8); rgb(doc, C.BODY);
            doc.text(responseLines, ML + 4, y);
            y += (responseLines.length * 5) + 4;
          } else {
            y += 4;
          }

          hline(doc, y, ML + 2, MR, C.RULE, 0.15);
          y += 6;
        }
      }
    }

    // SCÉNARIO SMP FINAL
    if (smpData?.scenario) {
      doc.addPage();
      runningHeader(doc, client, 'Estimation SMP');
      y = 22;
      y = chapter(doc, ++chapterNum, 'Scénario & Estimation SMP', y);
      
      bold(doc, 8.5); rgb(doc, C.NAVY); doc.text('Scénario de sinistre retenu', ML, y); y += 6;
      const scLines = doc.splitTextToSize(smpData.scenario, CW - 12);
      const scH = scLines.length * 5.5 + 10;

      y = needsPage(doc, y, scH + 10, runningHeader, [client, 'Estimation SMP']);
      fill(doc, C.MIST); doc.roundedRect(ML, y, CW, scH, 2, 2, 'F');
      fill(doc, C.ACCENT); doc.rect(ML, y, 3, scH, 'F');
      italic(doc, 9); rgb(doc, C.BODY);
      doc.text(scLines, ML + 8, y + 8);
      y += scH + 15;
    }

    // PIED DE PAGE ET SAUVEGARDE
    const total = doc.internal.getNumberOfPages();
    for (let i = 2; i <= total; i++) {
      doc.setPage(i);
      runningFooter(doc, i, total, client);
    }

    doc.save(`AUDIT_CIAR_${client.replace(/\s+/g, '_')}.pdf`);
  } catch (err) {
    console.error('Erreur:', err);
    alert('Erreur lors de la génération : ' + err.message);
  }
};
