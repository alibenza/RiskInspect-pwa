import { create } from 'zustand';import { RISK_QUESTIONS } from '../components/questions';
export const useInspectionStore = create((set, get) => ({
  questionsConfig: RISK_QUESTIONS, responses: {},
  setResponse: (id, field, val) => set((state) => {
    const current = state.responses[id] || { value: '', comment: '', score: 0, isScored: false };
    const newResponses = { ...state.responses, [id]: { ...current, [field]: val } };
    localStorage.setItem('risk-inspect-data', JSON.stringify(newResponses)); return { responses: newResponses };
  }),
  resetInspection: () => { localStorage.removeItem('risk-inspect-data'); set({ responses: {} }); },
  addSection: (title) => set((state) => {
    const newConfig = [...state.questionsConfig, { id: `sec_${Date.now()}`, title: title, questions: [] }];
    localStorage.setItem('risk-inspect-config', JSON.stringify(newConfig)); return { questionsConfig: newConfig };
  }),
  addQuestion: (sectionId, label, type, weight = 10) => set((state) => {
    const newConfig = state.questionsConfig.map(section => 
      section.id === sectionId ? { ...section, questions: [...section.questions, { id: `q_${Date.now()}`, label, type, weight }] } : section
    );
    localStorage.setItem('risk-inspect-config', JSON.stringify(newConfig)); return { questionsConfig: newConfig };
  }),
  removeSection: (sectionId) => set((state) => {
    const newConfig = state.questionsConfig.filter(s => s.id !== sectionId);
    localStorage.setItem('risk-inspect-config', JSON.stringify(newConfig)); return { questionsConfig: newConfig };
  }),
  loadFromLocalStorage: () => {
    const savedData = localStorage.getItem('risk-inspect-data'); const savedConfig = localStorage.getItem('risk-inspect-config');
    set({ responses: savedData ? JSON.parse(savedData) : {}, questionsConfig: savedConfig ? JSON.parse(savedConfig) : RISK_QUESTIONS });
  },
  calculateScore: () => {
    const { responses, questionsConfig } = get(); let possible = 0, gained = 0;
    const surface = parseFloat(responses['superficie_batie']?.value) || 0; const nbReel = parseFloat(responses['nb_extincteurs']?.value) || 0;
    const nbTheorique = Math.ceil(surface / 150); let scoreExt = nbTheorique > 0 ? Math.min(5, (nbReel / nbTheorique) * 5) : 0;
    questionsConfig.forEach(sec => sec.questions.forEach(q => {
      const resp = responses[q.id];
      if (resp?.isScored) { // ON NE COMPTE QUE LES QUESTIONS OÙ LE BOUTON EST ACTIVÉ
        const w = q.weight || 10; possible += 5 * w; gained += (parseFloat(resp.score) || 0) * w;
        if (q.id === 'nb_extincteurs') { possible += 5 * 20; gained += scoreExt * 20; }
      }
    }));
    return possible > 0 ? Math.round((gained / possible) * 100) : 0;
  }
}));
