import { create } from 'zustand';

export const useInspectionStore = create((set) => ({
  responses: {},
  selectedGaranties: [],
  aiResults: null, // Stockera { synthese, pointsForts, pointsFaibles, recommandations }
  
  setResponse: (id, data) => set((state) => ({
    responses: { ...state.responses, [id]: data }
  })),
  
  setSelectedGaranties: (garanties) => set({ selectedGaranties: garanties }),
  
  setAiResults: (results) => set({ aiResults: results }), // Nouvelle action
  
  resetAudit: () => set({ responses: {}, aiResults: null })
}));
