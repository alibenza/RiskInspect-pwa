// ... (haut du fichier inchangé)
const AIAnalysis = () => {
  const { responses, questionsConfig, selectedGaranties } = useInspectionStore();
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);
    
    // TA CLÉ INSÉRÉE ICI
    const API_KEY = "AIzaSyAKC3reG2sXABFBacWyGG3UtiXm_PgIx-8"; 

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: generateAnalysisPrompt(responses, questionsConfig, selectedGaranties) }] }]
        })
      });
// ... (reste du fichier inchangé)
