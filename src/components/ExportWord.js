import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  ImageRun, AlignmentType, BorderStyle, WidthType, HeadingLevel,
  Header, Footer, PageBreak, ShadingType, TableLayoutType,
  TableOfContents, StyleLevel,
} from 'docx';
import { useInspectionStore } from '../hooks/useInspectionStore';

// ─── COULEURS ─────────────────────────────────────────────────────────────────
const C = {
  NAVY:   '0A193C',
  BLUE:   '0046AD',
  ACCENT: 'DC2828',
  GOLD:   'C19A44',
  MIST:   'F5F7FC',
  RULE:   'D2D8E6',
  BODY:   '283041',
  SUBTLE: '6E7A91',
  WHITE:  'FFFFFF',
  GREEN:  '1EA05F',
  ORANGE: 'E68214',
  RED:    'D22D2D',
};

const twip = (mm) => Math.round(mm * 56.7);

const fmt = (n) =>
  Math.round(n || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' DZD';

const scoreLabel = (s) => {
  if (s >= 4.5) return 'Excellent';
  if (s >= 3.5) return 'Bon';
  if (s >= 2.5) return 'Moyen';
  if (s >= 1.5) return 'Faible';
  return 'Critique';
};

const scoreColorHex = (s) => {
  if (s >= 4)   return C.GREEN;
  if (s >= 2.5) return C.ORANGE;
  return C.RED;
};

const dataUrlToBuffer = (dataUrl) => {
  try {
    const base64 = dataUrl.split(',')[1];
    const binary = atob(base64);
    const buf    = new ArrayBuffer(binary.length);
    const view   = new Uint8Array(buf);
    for (let i = 0; i < binary.length; i++) view[i] = binary.charCodeAt(i);
    return buf;
  } catch { return null; }
};

// ─── STYLES WORD PERSONNALISÉS ────────────────────────────────────────────────
const wordStyles = {
  paragraphStyles: [
    {
      id: 'Heading1',
      name: 'heading 1',
      basedOn: 'Normal',
      next: 'Normal',
      quickFormat: true,
      run: { color: C.NAVY, bold: true, size: 32, font: 'Calibri' },
      paragraph: {
        spacing: { before: 480, after: 160 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 10, color: C.NAVY } },
      },
    },
    {
      id: 'Heading2',
      name: 'heading 2',
      basedOn: 'Normal',
      next: 'Normal',
      quickFormat: true,
      run: { color: C.BLUE, bold: true, size: 26, font: 'Calibri' },
      paragraph: {
        spacing: { before: 320, after: 120 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: C.RULE } },
      },
    },
    {
      id: 'Heading3',
      name: 'heading 3',
      basedOn: 'Normal',
      next: 'Normal',
      quickFormat: true,
      run: { color: C.BODY, bold: true, size: 22, font: 'Calibri' },
      paragraph: { spacing: { before: 200, after: 80 } },
    },
  ],
};

// ─── PRIMITIVES ───────────────────────────────────────────────────────────────
const pageBreak = () => new Paragraph({ children: [new PageBreak()] });
const spacer    = (h = 120) => new Paragraph({ spacing: { after: h } });

const h1 = (text) => new Paragraph({ text, heading: HeadingLevel.HEADING_1 });
const h2 = (text) => new Paragraph({ text, heading: HeadingLevel.HEADING_2 });
const h3 = (text) => new Paragraph({ text, heading: HeadingLevel.HEADING_3 });

const body = (text, opts = {}) => new Paragraph({
  children: [new TextRun({
    text: String(text || ''),
    color:  opts.color  || C.BODY,
    size:   opts.size   || 20,
    bold:   opts.bold   || false,
    italic: opts.italic || false,
    font:   'Calibri',
  })],
  spacing: { before: opts.before || 60, after: opts.after || 60 },
  alignment: opts.align || AlignmentType.LEFT,
  indent:    opts.indent ? { left: twip(opts.indent) } : undefined,
  shading:   opts.bg ? { type: ShadingType.SOLID, color: opts.bg, fill: opts.bg } : undefined,
  border:    opts.leftBorder
    ? { left: { style: BorderStyle.SINGLE, size: 18, color: opts.leftBorder } }
    : undefined,
});

// ─── TABLEAUX ─────────────────────────────────────────────────────────────────
const thin   = { style: BorderStyle.SINGLE, size: 1, color: C.RULE };
const allB   = (b) => ({ top: b, bottom: b, left: b, right: b });
const margins = { top: 60, bottom: 60, left: 120, right: 80 };

const kvRow = (key, val) => new TableRow({
  children: [
    new TableCell({
      children: [new Paragraph({ children: [new TextRun({ text: String(key), bold: true, color: C.NAVY, size: 18, font: 'Calibri' })] })],
      shading:  { type: ShadingType.SOLID, color: 'EEF2FA', fill: 'EEF2FA' },
      borders:  allB(thin),
      width:    { size: 35, type: WidthType.PERCENTAGE },
      margins,
    }),
    new TableCell({
      children: [new Paragraph({ children: [new TextRun({ text: String(val || '—'), color: C.BODY, size: 18, font: 'Calibri' })] })],
      borders:  allB(thin),
      width:    { size: 65, type: WidthType.PERCENTAGE },
      margins,
    }),
  ],
});

const dataTable = (rows, headers = null) => {
  const tableRows = [];

  if (headers) {
    tableRows.push(new TableRow({
      tableHeader: true,
      children: headers.map((h) => new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, color: C.WHITE, size: 18, font: 'Calibri' })] })],
        shading:  { type: ShadingType.SOLID, color: C.NAVY, fill: C.NAVY },
        borders:  allB({ style: BorderStyle.SINGLE, size: 2, color: C.NAVY }),
        margins,
      })),
    }));
  }

  rows.forEach((row, ri) => {
    const bg = ri % 2 === 0 ? 'FFFFFF' : 'F5F7FC';
    tableRows.push(new TableRow({
      children: row.map((cell) => {
        const isObj  = cell && typeof cell === 'object' && !Array.isArray(cell);
        const text   = isObj ? String(cell.content ?? '') : String(cell ?? '');
        const bold   = isObj ? (cell.bold   || false)     : false;
        const color  = isObj ? (cell.color  || C.BODY)    : C.BODY;
        const align  = isObj && cell.align === 'right' ? AlignmentType.RIGHT : AlignmentType.LEFT;
        return new TableCell({
          children: [new Paragraph({
            children: [new TextRun({ text, bold, color, size: 18, font: 'Calibri' })],
            alignment: align,
          })],
          shading: { type: ShadingType.SOLID, color: bg, fill: bg },
          borders: allB(thin),
          margins,
        });
      }),
    }));
  });

  return new Table({
    rows: tableRows,
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
  });
};

// ─── EXPORT PRINCIPAL ─────────────────────────────────────────────────────────
export const exportToWord = async (responses, questionsConfig, aiResults, auditorInfo) => {
  try {
    const { allSites, smpData } = useInspectionStore.getState();
    const client   = responses['nomination']?.value      || 'Entreprise Assurée';
    const adresse  = responses['adress']?.value          || '';
    const activite = responses['activite_nature']?.value || '';
    const expert   = auditorInfo?.name                   || 'Expert RiskPro';
    const societe  = auditorInfo?.company                || 'CIAR';
    const dateExp  = auditorInfo?.inspectionDate         || new Date().toLocaleDateString('fr-FR');
    const today    = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
    const nbSites  = Object.keys(allSites).length;

    const children = [];

    // ══════════════════════════════════════════════════════════════════════════
    // PAGE DE COUVERTURE
    // ══════════════════════════════════════════════════════════════════════════
    children.push(
      new Paragraph({
        children: [new TextRun({ text: 'RAPPORT D\'AUDIT DE RISQUE', bold: true, color: C.ACCENT, size: 24, allCaps: true, font: 'Calibri' })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 1200, after: 80 },
      }),
      new Paragraph({
        children: [new TextRun({ text: 'VISITE DE RISQUE', bold: true, color: C.NAVY, size: 56, font: 'Calibri' })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 40, after: 40 },
      }),
      new Paragraph({
        children: [new TextRun({ text: '& EXPERTISE CIAR', bold: true, color: C.NAVY, size: 40, font: 'Calibri' })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 40, after: 80 },
      }),
      new Paragraph({
        children: [new TextRun({ text: '─────────────────────────────────────', color: C.GOLD, size: 18, font: 'Calibri' })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 60, after: 360 },
      }),
      new Table({
        rows: [
          kvRow('Entreprise',     client.toUpperCase()),
          kvRow('Adresse',        adresse  || '—'),
          kvRow('Activité',       activite || '—'),
          kvRow('Date de visite', dateExp),
          kvRow('Expert',         `${expert}${societe ? '  ·  ' + societe : ''}`),
          kvRow('Sites audités',  `${nbSites} site(s)`),
          kvRow('Édité le',       today),
        ],
        width: { size: 80, type: WidthType.PERCENTAGE },
        layout: TableLayoutType.FIXED,
      }),
      new Paragraph({
        children: [new TextRun({ text: 'Document confidentiel — Usage exclusif CIAR et client désigné', italic: true, color: C.SUBTLE, size: 16, font: 'Calibri' })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 640, after: 60 },
      }),
      pageBreak(),
    );

    // ══════════════════════════════════════════════════════════════════════════
    // TABLE DES MATIÈRES (Word la génère automatiquement à l'ouverture)
    // ══════════════════════════════════════════════════════════════════════════
    children.push(
      new Paragraph({
        children: [new TextRun({ text: 'TABLE DES MATIÈRES', bold: true, color: C.NAVY, size: 28, allCaps: true, font: 'Calibri' })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 320 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: C.NAVY } },
      }),
      new TableOfContents('Table des matières', {
        hyperlink: true,
        headingStyleRange: '1-2',
        stylesWithLevels: [
          new StyleLevel('heading 1', 1),
          new StyleLevel('heading 2', 2),
        ],
      }),
      pageBreak(),
    );

    // ══════════════════════════════════════════════════════════════════════════
    // 1. RÉSUMÉ EXÉCUTIF
    // ══════════════════════════════════════════════════════════════════════════
    children.push(h1('1. Résumé Exécutif'));

    if (aiResults || smpData) {
      const score = aiResults?.score_global ?? '—';
      const smp   = smpData?.smpFinal ? fmt(smpData.smpFinal) : '—';
      children.push(
        dataTable([[
          { content: `Indice de Maîtrise : ${score}%`, bold: true },
          { content: `SMP Final : ${smp}`,             bold: true },
          { content: `Sites Audités : ${nbSites}`,     bold: true },
        ]]),
        spacer(160),
      );
    }

    if (aiResults?.synthese_executive) {
      children.push(
        h2('Synthèse de l\'expert IA'),
        body(aiResults.synthese_executive, { italic: true, indent: 8, bg: 'EEF2FA', leftBorder: C.BLUE, before: 60, after: 160 }),
      );
    }

    if (smpData?.valeurs) {
      const totalExp =
        (smpData.valeurs.batiment || 0) + (smpData.valeurs.materiel || 0) +
        (smpData.valeurs.stocks   || 0) + (smpData.valeurs.pe       || 0);
      children.push(
        h2('Valeur Totale Assurée (VTA)'),
        dataTable(
          [
            ['Bâtiments & Génie Civil',      { content: fmt(smpData.valeurs.batiment), align: 'right' }],
            ['Matériels & Équipements',       { content: fmt(smpData.valeurs.materiel), align: 'right' }],
            ['Stocks (Matières & Produits)',  { content: fmt(smpData.valeurs.stocks),   align: 'right' }],
            ['Pertes d\'Exploitation (12 m)', { content: fmt(smpData.valeurs.pe),       align: 'right' }],
            [{ content: 'Total VTA', bold: true }, { content: fmt(totalExp), bold: true, align: 'right' }],
          ],
          ['Poste de valeur', 'Montant estimé (DZD)'],
        ),
        spacer(80),
      );
      if (smpData.scenario) {
        children.push(
          h2('Scénario de sinistre retenu'),
          body(smpData.scenario, { italic: true, indent: 6, before: 60, after: 160 }),
        );
      }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 2. ÉVALUATION DES RISQUES PAR GARANTIE
    // ══════════════════════════════════════════════════════════════════════════
    let chapterNum = 1;

    if (aiResults?.analyses_par_garantie?.length > 0) {
      chapterNum++;
      children.push(pageBreak(), h1(`${chapterNum}. Évaluation des risques par garantie`));

      children.push(
        dataTable(
          aiResults.analyses_par_garantie.map((g) => {
            const expo = Number(g.exposition) || 0;
            const col  = expo >= 7 ? C.RED : expo >= 4 ? C.ORANGE : C.GREEN;
            return [
              { content: g.garantie || '', bold: true },
              { content: `${expo}/10`, bold: true, color: col },
              { content: g.avis_technique || '' },
            ];
          }),
          ['Garantie', 'Exposition', 'Avis technique'],
        ),
        spacer(160),
      );

      if (aiResults.points_forts?.length > 0) {
        children.push(h2('Points forts identifiés'));
        aiResults.points_forts.forEach((p) => children.push(
          new Paragraph({
            children: [
              new TextRun({ text: '✓  ', bold: true, color: C.GREEN, size: 20, font: 'Calibri' }),
              new TextRun({ text: p, color: C.BODY, size: 20, font: 'Calibri' }),
            ],
            spacing: { before: 40, after: 40 },
            indent:  { left: twip(5) },
          })
        ));
        children.push(spacer());
      }

      if (aiResults.axes_amelioration?.length > 0) {
        children.push(h2('Axes d\'amélioration prioritaires'));
        aiResults.axes_amelioration.forEach((p) => children.push(
          new Paragraph({
            children: [
              new TextRun({ text: '►  ', bold: true, color: C.ORANGE, size: 20, font: 'Calibri' }),
              new TextRun({ text: p, color: C.BODY, size: 20, font: 'Calibri' }),
            ],
            spacing: { before: 40, after: 40 },
            indent:  { left: twip(5) },
          })
        ));
        children.push(spacer());
      }

      if (aiResults.recommandations?.length > 0) {
        children.push(h2('Recommandations'));
        aiResults.recommandations.forEach((r, i) => children.push(
          new Paragraph({
            children: [
              new TextRun({ text: `${i + 1}.  `, bold: true, color: C.BLUE, size: 20, font: 'Calibri' }),
              new TextRun({ text: r, color: C.BODY, size: 20, font: 'Calibri' }),
            ],
            spacing: { before: 60, after: 60 },
            indent:  { left: twip(5) },
          })
        ));
      }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // SECTIONS PAR SITE  (sans photos — déplacées en annexe)
    // ══════════════════════════════════════════════════════════════════════════
    const skipIds = new Set([
      'nomination', 'adress', 'activite_nature', 'date_creation',
      'superficie_totale', 'superficie_batie',
    ]);

    // Collecte de toutes les photos pour l'annexe
    const allPhotosBySite = [];

    for (const [, site] of Object.entries(allSites)) {
      chapterNum++;
      const siteName = site.name || 'Site';
      const siteResp = site.responses || {};

      children.push(pageBreak(), h1(`${chapterNum}. Inspection — ${siteName}`));

      // Fiche site
      const siteInfo = [
        ['Superficie totale',  siteResp['superficie_totale']?.value],
        ['Superficie bâtie',   siteResp['superficie_batie']?.value],
        ['Compartimentage',    siteResp['compartimentage']?.value],
        ['Date de création',   siteResp['date_creation']?.value],
      ].filter(([, v]) => v);

      if (siteInfo.length > 0) {
        children.push(
          h2('Fiche d\'identité du site'),
          new Table({
            rows: siteInfo.map(([k, v]) => kvRow(k, v)),
            width: { size: 70, type: WidthType.PERCENTAGE },
            layout: TableLayoutType.FIXED,
          }),
          spacer(200),
        );
      }

      // Collecte photos pour annexe
      const sitePhotos = [];

      // Sections thématiques
      for (const sec of (questionsConfig || [])) {
        const qList  = (sec.questions || []).filter((q) => !skipIds.has(q.id));
        const scored = qList.filter((q) => q.isScored && siteResp[q.id]?.score != null);
        const hasData = qList.some((q) => {
          const r = siteResp[q.id];
          return r && (r.value || r.comment || r.score != null || r.photos?.length > 0);
        });
        if (!hasData) continue;

        // Titre de section = Heading 2
        let sectionLabel = sec.title;
        if (scored.length > 0) {
          const avg = scored.reduce((a, q) => a + siteResp[q.id].score, 0) / scored.length;
          sectionLabel += `   —   Moyenne ${avg.toFixed(1)}/5 (${scoreLabel(avg)})`;
        }
        children.push(h2(sectionLabel));

        for (const q of qList) {
          const r = siteResp[q.id];
          if (!r) continue;
          const hasContent = r.value || r.comment?.trim();
          const hasScore   = q.isScored && r.score != null;
          const hasPhotos  = r.photos?.length > 0;
          if (!hasContent && !hasScore && !hasPhotos) continue;

          // Intitulé question = Heading 3
          const questionTitle = hasScore
            ? `${q.label}   [${r.score}/5 — ${scoreLabel(r.score)}]`
            : q.label;
          children.push(h3(questionTitle));

          // Observation
          if (hasContent) {
            const text = [r.value, r.comment?.trim()].filter(Boolean).join('  —  ');
            children.push(body(text, { indent: 6, before: 40, after: 80 }));
          }

          // Collecte photos (sans les afficher ici)
          if (hasPhotos) {
            r.photos.forEach((ph) => sitePhotos.push({ ...ph, questionLabel: q.label }));
          }
        }
      }

      if (sitePhotos.length > 0) {
        allPhotosBySite.push({ siteName, photos: sitePhotos });
      }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // RAPPORT DE SCÉNARIO SMP
    // ══════════════════════════════════════════════════════════════════════════
    const hasSmp =
      smpData?.scenario || (smpData?.smpFinal > 0) ||
      Object.values(smpData?.valeurs || {}).some((v) => v > 0);

    if (hasSmp) {
      chapterNum++;
      children.push(pageBreak(), h1(`${chapterNum}. Rapport de Scénario — Estimation SMP`));

      const totalExp =
        (smpData.valeurs?.batiment || 0) + (smpData.valeurs?.materiel || 0) +
        (smpData.valeurs?.stocks   || 0) + (smpData.valeurs?.pe       || 0);
      const smpPct = totalExp > 0
        ? ((smpData.smpFinal || 0) / totalExp * 100).toFixed(1)
        : '0.0';

      children.push(
        dataTable([[
          { content: `SMP : ${fmt(smpData.smpFinal || 0)}`, bold: true },
          { content: `VTA : ${fmt(totalExp)}`,              bold: true },
          { content: `Taux SMP / VTA : ${smpPct} %`,       bold: true },
        ]]),
        spacer(160),
      );

      if (smpData.scenario) {
        children.push(
          h2('Scénario de sinistre retenu'),
          body(smpData.scenario, { italic: true, indent: 8, bg: 'FAF0F0', leftBorder: C.ACCENT, before: 60, after: 160 }),
        );
      }

      children.push(
        h2('Ventilation des Valeurs Totales Assurées (VTA)'),
        dataTable(
          [
            ['Bâtiments & Génie Civil',         { content: fmt(smpData.valeurs?.batiment), align: 'right' }],
            ['Matériels & Équipements',          { content: fmt(smpData.valeurs?.materiel), align: 'right' }],
            ['Stocks (Matières & Produits)',     { content: fmt(smpData.valeurs?.stocks),   align: 'right' }],
            ['Pertes d\'Exploitation (12 mois)', { content: fmt(smpData.valeurs?.pe),       align: 'right' }],
            [{ content: 'Total des capitaux assurés', bold: true }, { content: fmt(totalExp), bold: true, align: 'right' }],
          ],
          ['Poste de valeur', 'Montant estimé (DZD)'],
        ),
        spacer(160),
      );

      if (smpData.hypotheses?.length > 0) {
        children.push(h2('Hypothèses techniques retenues'));
        smpData.hypotheses.forEach((h, i) => children.push(
          new Paragraph({
            children: [
              new TextRun({ text: `${i + 1}.  `, bold: true, color: C.BLUE, size: 20, font: 'Calibri' }),
              new TextRun({ text: h, color: C.BODY, size: 20, font: 'Calibri' }),
            ],
            spacing: { before: 60, after: 60 },
            indent:  { left: twip(5) },
          })
        ));
      }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // VALIDATION & SIGNATURES
    // ══════════════════════════════════════════════════════════════════════════
    chapterNum++;
    children.push(
      pageBreak(),
      h1(`${chapterNum}. Validation & Signatures`),
      body(
        `Le présent rapport d'audit de risque a été établi le ${today} par ${expert} (${societe}) ` +
        `à l'issue de la visite de risque du site de ${client}` +
        `${adresse ? ', situé à ' + adresse : ''}. ` +
        `Il constitue un document confidentiel et ne peut être divulgué à des tiers sans accord préalable de CIAR.`,
        { before: 160, after: 320 },
      ),
      new Table({
        rows: [
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: 'L\'EXPERT CIAR', bold: true, color: C.WHITE, size: 20, font: 'Calibri' })], alignment: AlignmentType.CENTER })],
                shading:  { type: ShadingType.SOLID, color: C.NAVY, fill: C.NAVY },
                borders:  allB({ style: BorderStyle.SINGLE, size: 2, color: C.NAVY }),
                width:    { size: 50, type: WidthType.PERCENTAGE },
                margins:  { top: 80, bottom: 80, left: 120, right: 80 },
              }),
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: 'LE CLIENT', bold: true, color: C.WHITE, size: 20, font: 'Calibri' })], alignment: AlignmentType.CENTER })],
                shading:  { type: ShadingType.SOLID, color: C.NAVY, fill: C.NAVY },
                borders:  allB({ style: BorderStyle.SINGLE, size: 2, color: C.NAVY }),
                width:    { size: 50, type: WidthType.PERCENTAGE },
                margins:  { top: 80, bottom: 80, left: 120, right: 80 },
              }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({
                children: [
                  new Paragraph({ children: [new TextRun({ text: expert, bold: true, color: C.NAVY, size: 20, font: 'Calibri' })], spacing: { before: 80 } }),
                  new Paragraph({ children: [new TextRun({ text: societe, color: C.SUBTLE, size: 18, font: 'Calibri' })], spacing: { after: 80 } }),
                  new Paragraph({ children: [new TextRun({ text: 'Cachet & Signature :', color: C.SUBTLE, size: 16, font: 'Calibri' })], spacing: { before: 500, after: 60 } }),
                  new Paragraph({ children: [new TextRun({ text: '________________________________', color: C.RULE, size: 20, font: 'Calibri' })], spacing: { after: 80 } }),
                ],
                borders: allB(thin),
                width:   { size: 50, type: WidthType.PERCENTAGE },
                margins: { top: 80, bottom: 80, left: 120, right: 80 },
              }),
              new TableCell({
                children: [
                  new Paragraph({ children: [new TextRun({ text: client, bold: true, color: C.NAVY, size: 20, font: 'Calibri' })], spacing: { before: 80 } }),
                  new Paragraph({ children: [new TextRun({ text: 'Représentant habilité', color: C.SUBTLE, size: 18, font: 'Calibri' })], spacing: { after: 80 } }),
                  new Paragraph({ children: [new TextRun({ text: 'Cachet & Signature :', color: C.SUBTLE, size: 16, font: 'Calibri' })], spacing: { before: 500, after: 60 } }),
                  new Paragraph({ children: [new TextRun({ text: '________________________________', color: C.RULE, size: 20, font: 'Calibri' })], spacing: { after: 80 } }),
                ],
                borders: allB(thin),
                width:   { size: 50, type: WidthType.PERCENTAGE },
                margins: { top: 80, bottom: 80, left: 120, right: 80 },
              }),
            ],
          }),
        ],
        width: { size: 100, type: WidthType.PERCENTAGE },
        layout: TableLayoutType.FIXED,
      }),
      new Paragraph({
        children: [new TextRun({ text: 'Document établi conformément aux procédures d\'audit CIAR.', italic: true, color: C.SUBTLE, size: 16, font: 'Calibri' })],
        alignment: AlignmentType.CENTER,
        spacing:   { before: 280 },
      }),
    );

    // ══════════════════════════════════════════════════════════════════════════
    // ANNEXE PHOTOGRAPHIQUE (en dernier)
    // ══════════════════════════════════════════════════════════════════════════
    if (allPhotosBySite.length > 0) {
      chapterNum++;
      children.push(pageBreak(), h1(`Annexe — Documentation Photographique`));

      children.push(
        body(
          `Cette annexe regroupe l'ensemble des photographies prises lors de la visite de risque du ${dateExp}. ` +
          `Chaque photo est accompagnée de son contexte et de son horodatage.`,
          { italic: true, color: C.SUBTLE, before: 60, after: 240 },
        ),
      );

      for (const { siteName, photos } of allPhotosBySite) {
        children.push(h2(`Site : ${siteName}`));

        for (const ph of photos) {
          // Titre de la rubrique photo = Heading 3
          children.push(h3(ph.questionLabel || 'Photographie'));

          const buf = dataUrlToBuffer(ph.url);
          if (buf) {
            children.push(
              new Paragraph({
                children: [new ImageRun({
                  data: buf,
                  transformation: { width: 400, height: 260 },
                  type: 'jpg',
                })],
                alignment: AlignmentType.CENTER,
                spacing:   { before: 80, after: 40 },
              }),
            );
          }

          if (ph.timestamp || ph.fileName) {
            children.push(
              body(
                [
                  ph.fileName ? `Fichier : ${ph.fileName}` : null,
                  ph.timestamp ? `Date : ${new Date(ph.timestamp).toLocaleString('fr-FR')}` : null,
                ].filter(Boolean).join('   |   '),
                { italic: true, color: C.SUBTLE, size: 16, align: AlignmentType.CENTER, before: 20, after: 160 },
              ),
            );
          }
        }
      }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // GÉNÉRATION DU FICHIER
    // ══════════════════════════════════════════════════════════════════════════
    const doc = new Document({
      creator:     societe,
      title:       `Rapport Audit CIAR — ${client}`,
      description: `Rapport de visite de risque — ${dateExp}`,
      styles:      { paragraphStyles: wordStyles.paragraphStyles },
      sections: [{
        properties: {
          page: {
            margin: { top: 1134, bottom: 1134, left: 1418, right: 1020 },
          },
        },
        headers: {
          default: new Header({
            children: [new Paragraph({
              children: [
                new TextRun({ text: `CIAR — Rapport d'audit`, bold: true, color: C.NAVY, size: 16, font: 'Calibri' }),
                new TextRun({ text: `   ·   ${client}   ·   ${dateExp}`, color: C.SUBTLE, size: 16, font: 'Calibri' }),
              ],
              border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: C.NAVY } },
            })],
          }),
        },
        footers: {
          default: new Footer({
            children: [new Paragraph({
              children: [
                new TextRun({ text: `Confidentiel — ${client}`, italic: true, color: C.SUBTLE, size: 16, font: 'Calibri' }),
              ],
              border: { top: { style: BorderStyle.SINGLE, size: 4, color: C.RULE } },
            })],
          }),
        },
        children,
      }],
    });

    const blob = await Packer.toBlob(doc);
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `AUDIT_CIAR_${client.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.docx`;
    a.click();
    URL.revokeObjectURL(url);

  } catch (err) {
    console.error('Word Export error:', err);
    alert('Erreur lors de la génération du rapport Word : ' + err.message);
  }
};
