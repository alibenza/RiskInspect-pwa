import { create } from 'zustand';import { RISK_QUESTIONS } from '../components/questions';
export const useInspectionStore = create((set, get) => ({
  questionsConfig: RISK_QUESTIONS, responses: {}, selectedGaranties: [],
  setResponse: (id, field, val) => set((state) => {
    const current = state.responses[id] || { value: '', comment: '', score: 0, isScored: false };
    const newResponses = { ...state.responses, [id]: { ...current, [field]: val } };
    localStorage.setItem('risk-inspect-data', JSON.stringify(newResponses)); return { responses: newResponses };
  }),
  toggleGarantie: (id) => set((state) => {
    const newGaranties = state.selectedGaranties.includes(id) ? state.selectedGaranties.filter(g => g !== id) : [...state.selectedGaranties, id];
    localStorage.setItem('risk-inspect-garanties', JSON.stringify(newGaranties)); return { selectedGaranties: newGaranties };
  }),
  resetInspection: () => { localStorage.removeItem('risk-inspect-data'); localStorage.removeItem('risk-inspect-garanties'); set({ responses: {}, selectedGaranties: [] }); },
  loadFromLocalStorage: () => {
    const savedData = localStorage.getItem('risk-inspect-data'); const savedConfig = localStorage.getItem('risk-inspect-config'); const savedGaranties = localStorage.getItem('risk-inspect-garanties');
    set({ responses: savedData ? JSON.parse(savedData) : {}, questionsConfig: savedConfig ? JSON.parse(savedConfig) : RISK_QUESTIONS, selectedGaranties: savedGaranties ? JSON.parse(savedGaranties) : [] });
  },
  calculateScore: () => {
    const { responses, questionsConfig } = get(); let possible = 0, gained = 0;
    questionsConfig.forEach(sec => sec.questions.forEach(q => {
      const resp = responses[q.id]; if (resp?.isScored) { const w = q.weight || 10; possible += 5 * w; gained += (parseFloat(resp.score) || 0) * w; }
    }));
    return possible > 0 ? Math.round((gained / possible) * 100) : 0;
  }
}));
