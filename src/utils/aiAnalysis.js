export const generateAnalysisPrompt = (responses, questionsConfig, selectedGaranties) => {
  let context = "Tu es un expert en prévention des risques IARD. Analyse les données suivantes d'un audit de site :\n\n";
  
  // 1. Garanties sélectionnées
  context += `GARANTIES À AUDITER : ${selectedGaranties.join(', ')}\n\n`;

  // 2. Compilation des réponses
  context += "DONNÉES COLLECTÉES :\n";
  questionsConfig.forEach(section => {
    context += `--- Section : ${section.title} ---\n`;
    section.questions.forEach(q => {
      const resp = responses[q.id];
      if (resp) {
        context += `- ${q.label} : ${resp.value || 'N/A'}`;
        if (resp.isScored) context += ` | Note : ${resp.score}/5`;
        if (resp.comment) context += ` | Observation : ${resp.comment}`;
        context += "\n";
      }
    });
  });

  context += "\nCONSIGNES : Rédige une analyse synthétique structurée en 3 points : ";
  context += "1. Points Forts (Sécurité/Prévention), 2. Vulnérabilités Critiques (Risques d'exposition), 3. Recommandations prioritaires pour l'assureur.";
  context += "\nSois technique, direct et professionnel.";

  return context;
};
