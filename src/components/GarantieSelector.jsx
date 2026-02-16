import React from 'react';import { useInspectionStore } from '../hooks/useInspectionStore';import { ShieldCheck, Flame, ShieldAlert, Zap, Droplets, Warehouse } from 'lucide-react';

const GARANTIES_LIST = [
  { id: 'incendie', label: 'Incendie & Explosion', icon: <Flame className="text-orange-500" /> },
  { id: 'vol', label: 'Vol & Vandalisme', icon: <ShieldAlert className="text-red-500" /> },
  { id: 'degat_eaux', label: 'Dégâts des Eaux', icon: <Droplets className="text-blue-500" /> },
  { id: 'bd', label: 'Bris de Glaces', icon: <Warehouse className="text-slate-500" /> },
  { id: 'elec', label: 'Dommages Électriques', icon: <Zap className="text-yellow-500" /> },
  { id: 'bdm', label: 'Bris de Machine', icon: <Zap className="text-green-500" /> },
   { id: 'ri', label: 'Risque Informatique', icon: <Zap className="text-brown-500" /> },
  { id: 'rc', label: 'Responsabilité Civile', icon: <ShieldCheck className="text-green-500" /> }
];

const GarantieSelector = () => {
  const { selectedGaranties, toggleGarantie } = useInspectionStore();
  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="bg-blue-600 p-6 rounded-[2.5rem] text-white shadow-xl mb-8">
        <h2 className="text-2xl font-black mb-2">Garanties</h2>
        <p className="text-blue-100 text-sm italic">Sélectionnez les couvertures du contrat à auditer.</p>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {GARANTIES_LIST.map((g) => (
          <button key={g.id} onClick={() => toggleGarantie(g.id)} className={`flex items-center p-5 rounded-2xl border-2 transition-all ${selectedGaranties.includes(g.id) ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-slate-100 bg-white text-slate-400'}`}>
            <div className={`p-3 rounded-xl mr-4 ${selectedGaranties.includes(g.id) ? 'bg-white' : 'bg-slate-50'}`}>{g.icon}</div>
            <span className={`font-bold ${selectedGaranties.includes(g.id) ? 'text-blue-900' : 'text-slate-500'}`}>{g.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
export default GarantieSelector;
