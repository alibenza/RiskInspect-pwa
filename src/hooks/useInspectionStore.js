import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { get, set, del } from 'idb-keyval';

// --- ADAPTATEUR INDEXEDDB ---
const idbStorage = {
  getItem: async (name) => (await get(name)) || null,
  setItem: async (name, value) => await set(name, value),
  removeItem: async (name) => await del(name),
};

export const useInspectionStore = create(
  persist(
    (set, get) => ({
      // --- CONFIGURATION INITIALE ---
      questionsConfig: [
        {
          title: "Informations Générales",
          questions: [
            { id: 'nomination', label: "Nomination (Raison Sociale)", isScored: false },
            { id: 'adress', label: "Adresse ", isScored: false },
            { id: 'activite_nature', label: "Nature de l’activité", isScored: false },
            { id: 'date_creation', label: "Date Création et mise en service", isScored: false }
          ]
        },
        {
          title: "Informations sur le Site",
          questions: [
            { id: 'superficie_totale', label: "Superficie totale du site", isScored: false },
            { id: 'superficie_batie', label: "Superficie bâtie", isScored: false },
            { id: 'compartimentage', label: "Compartimentage (Production, Stockage, Admin...)", isScored: true }
          ]
        },
        {
          title: "Utilités",
          questions: [
            { id: 'elec_principale', label: "Électricité (Transfos, maintenance, fournisseur)", isScored: false  },
            { id: 'gaz_nat', label: "Gaz naturel ", isScored: false },
            { id: 'elec_secours', label: "Électricité de secours (Groupes électrogènes)", isScored: false },
            { id: 'eau_source', label: "Eau (Fournisseur, capacité, usage)", isScored: false },
            { id: 'gaz_pression', label: "Gasoil et gaz sous pression (Réservoirs)", isScored: false }
          ]
        },
        {
          title: "Management des Risques & HSE",
          questions: [
            { id: 'hse_structure', label: "Structure HSE (Effectif, formations)", isScored: true },
            { id: 'hse_doc', label: "Documentation (EDD, EIE, PII)", isScored: true },
            { id: 'dechets_gestion', label: "Gestion et traitement des déchets", isScored: true }
          ]
        },
        {
          title: "Maintenance",
          questions: [
            { id: 'maint_struct', label: "Structure (Moyens humain, Qualifications)", isScored: true },
            { id: 'maint_prog', label: "Programmes de maintenance (Préventive/Curative)", isScored: true },
            { id: 'maint_control', label: "Contrôle Technique (APG, APV, Electricité, Levage)", isScored: true },
            { id: 'maint_pdr', label: "Magasin de PDR (Existence, Disponibilité)", isScored: true }
          ]
        },
        {
          title: "Lutte contre l'Incendie",
          questions: [
            { id: 'inc_detection', label: "Détection (Type, zones, centralisation)", isScored: true },
            { id: 'inc_mobile', label: "Moyens mobiles (Type, Répartition, mise à jour)", isScored: true },
            { id: 'inc_hydraulique', label: "Réseau hydraulique (Capacité, RIA, Poteaux)", isScored: true },
            { id: 'inc_ext_auto', label: "Systèmes automatiques (Sprinkler, Gaz inertes)", isScored: true },
            { id: 'signalisation', label: "Systèmes signalisation (Dangers, Risques, Urgences)", isScored: true },
            { id: 'protec_civil', label: "Protection Civile (Proximité, Exercices)", isScored: false }
          ]
        },
        {
          title: "Sûreté du Site",
          questions: [
            { id: 'surete_gardiennage', label: "Gardiennage (Effectifs, brigades)", isScored: true },
            { id: 'surete_cctv', label: "Vidéosurveillance et Contrôle d'accès", isScored: true },
            { id: 'surete_cloture', label: "Clôture et accès au site", isScored: true }
          ]
        }
      ],

      responses: {},
      aiResults: null,
      history: [],

      auditorInfo: {
        name: '',
        company: '',
        logo: null
        inspectionDate: ''
      },

      // --- ACTIONS DE BASE ---
      setAuditorInfo: (info) => set((state) => ({
        auditorInfo: { ...state.auditorInfo, ...info }
      })),

      setResponse: (id, data) => set((state) => ({
        responses: { 
          ...state.responses, 
          [id]: { ...state.responses[id], ...data } 
        }
      })),

      setAiResults: (results) => {
        set({ aiResults: results });
        if (results) {
          const newHistoryEntry = {
            id: Date.now(),
            date: new Date().toLocaleString(),
            client: get().responses['nomination']?.value || "Sans Nom",
            activite: get().responses['activite_nature']?.value || "Non spécifiée",
            data: {
              responses: get().responses,
              aiResults: results
            }
          };
          set((state) => ({
            history: [newHistoryEntry, ...state.history]
          }));
        }
      },

      // --- TRANSFERT DE DONNÉES (IMPORT / EXPORT) ---
      exportAudit: () => {
        const fileName = `AUDIT_${client}_${date}_${auditeur}.json`;
        const state = get();
        const dataToExport = {
          responses: state.responses,
          aiResults: state.aiResults,
          auditorInfo: state.auditorInfo,
          history: state.history,
          exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(dataToExport)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Audit_${state.responses['nomination']?.value || 'export'}_${Date.now()}.json`;
        link.click();
        URL.revokeObjectURL(url);
      },

      importAudit: (file) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const json = JSON.parse(e.target.result);
            set({
              responses: json.responses || {},
              aiResults: json.aiResults || null,
              auditorInfo: json.auditorInfo || get().auditorInfo,
              history: json.history || get().history
            });
            alert("Données d'audit importées avec succès !");
          } catch (err) {
            console.error("Erreur import:", err);
            alert("Erreur : Le fichier JSON est invalide ou corrompu.");
          }
        };
        reader.readAsText(file);
      },

      // --- PHOTOS (OPTIMISÉ POUR UPLOAD) ---
      addPhoto: (qId, photoData) => set((state) => ({
        responses: {
          ...state.responses,
          [qId]: {
            ...state.responses[qId],
            photos: [...(state.responses[qId]?.photos || []), photoData]
          }
        }
      })),

      removePhoto: (qId, photoIndex) => set((state) => ({
        responses: {
          ...state.responses,
          [qId]: {
            ...state.responses[qId],
            photos: (state.responses[qId]?.photos || []).filter((_, i) => i !== photoIndex)
          }
        }
      })),

      // --- HISTORIQUE & CONFIG ---
      loadFromHistory: (entry) => set({
        responses: entry.data.responses,
        aiResults: entry.data.aiResults
      }),

      deleteFromHistory: (id) => set((state) => ({
        history: state.history.filter(item => item.id !== id)
      })),

      addSection: (title) => set((state) => ({
        questionsConfig: [...state.questionsConfig, { title: title, questions: [] }]
      })),

      addQuestion: (sectionIndex, label, isScored = true) => set((state) => {
        const newConfig = [...state.questionsConfig];
        const newId = `custom_${Date.now()}`;
        newConfig[sectionIndex].questions.push({ id: newId, label: label, isScored: isScored });
        return { questionsConfig: newConfig };
      }),

      resetAudit: () => set({ responses: {}, aiResults: null })
    }),
    {
      name: 'risk-audit-storage-large',
      storage: createJSONStorage(() => idbStorage),
    }
  )
);
