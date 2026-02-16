// ...
section.questions.forEach((q) => {
  const resp = responses[q.id];
  if (!resp) return;

  // On affiche le texte (ou le chiffre) saisi
  let displayValue = resp.value || "-";
  
  // Si le bouton de notation est activé, on ajoute la note en dessous !
  if (resp.isScored) {
    displayValue += `\n(Note: ${resp.score || 0}/5)`;
  } 

  // Optionnel : Cas calcul des extincteurs
  if (q.id === 'nb_extincteurs') {
    const surface = parseFloat(responses['superficie_batie']?.value) || 0;
    const nbTheorique = Math.ceil(surface / 150);
    displayValue += `\n[Besoin théorique: ${nbTheorique}]`;
  }

  tableRows.push([
    q.label,
    displayValue,
    resp.comment || ""
  ]);
});
// ...
