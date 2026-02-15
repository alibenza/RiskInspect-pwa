// Définition des catégories basées sur ton document Word
export const INSPECTION_CATEGORIES = {
  hse_management: { id: 'hse_management', name: 'Management HSE', color: '#10b981' },
  incendie: { id: 'incendie', name: 'Protection Incendie', color: '#ef4444' },
  maintenance: { id: 'maintenance', name: 'Maintenance', color: '#f59e0b' },
  surete: { id: 'surete', name: 'Sûreté', color: '#6366f1' },
  utilites: { id: 'utilites', name: 'Utilités', color: '#3b82f6' }
};

export const getStatusFromScore = (score) => {
  if (score >= 80) return { 
    status: 'Excellent', 
    message: 'Niveau de sécurité élevé', 
    textColor: 'text-green-700', 
    bgColor: 'bg-green-50', 
    borderColor: 'border-green-500',
    color: 'success' 
  };
  if (score >= 50) return { 
    status: 'Moyen', 
    message: 'Des améliorations sont nécessaires', 
    textColor: 'text-orange-700', 
    bgColor: 'bg-orange-50', 
    borderColor: 'border-orange-500',
    color: 'warning' 
  };
  return { 
    status: 'Critique', 
    message: 'Mesures d’urgence requises', 
    textColor: 'text-red-700', 
    bgColor: 'bg-red-50', 
    borderColor: 'border-red-500', 
    color: 'danger' 
  };
};
