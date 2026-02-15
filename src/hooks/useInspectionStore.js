import { create } from 'zustand';
import { RISK_QUESTIONS } from '../constants/questions';

export const useInspectionStore = create((set, get) => ({
  responses: {},
  
  setResponse: (id, value) => set((state) => ({
    responses: { ...state.responses, [id]: value }
  })),

  calculateScore: () => {
    const responses = get().responses;
    let totalWeight = 0;
    let gainedWeight = 0;

    RISK_QUESTIONS.forEach(section => {
      section.questions.forEach(q => {
        if (q.type === 'boolean') {
          totalWeight += q.weight;
          if (responses[q.id] === 'Oui') {
            gainedWeight += q.weight;
          }
        }
      });
    });

    return totalWeight > 0 ? Math.round((gainedWeight / totalWeight) * 100) : 0;
  }
}));
