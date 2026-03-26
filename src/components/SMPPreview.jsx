import React from 'react';
import { ShieldAlert, TrendingUp, Building2, Package, Activity, FileText, CheckCircle2 } from 'lucide-react';
import { useInspectionStore } from '../hooks/useInspectionStore';

const SMPPreview = () => {
  const { smpData, responses } = useInspectionStore();
  
  // Formatage des prix en Dinars Algériens
  const formatDZD = (val) => new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD', maximumFractionDigits: 0 }).format(val);

  const totalCapitaux = Object.values(smpData.valeurs || {}).reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden font-sans">
      {/* Header Statut */}
      <div className="bg-slate-900 p-6 text-white">
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Rapport de Scénario</span>
            <h2 className="text-2xl font-black mt-1">Estimation SMP</h2>
          </div>
          <div className="bg-indigo-500/20 border border-indigo-400/30 p-2 rounded-lg">
            <ShieldAlert className="text-indigo-400" size={24} />
          </div>
        </div>
        
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black">{formatDZD(smpData.smpFinal || 0)}</span>
          <span className="text-xs text-slate-400 font-medium">Sinistre Maximum Possible</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Section 1 : Le Scénario validé */}
        <section>
          <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-400 mb-3">
            <Activity size={14} className="text-indigo-500" /> Scénario de Référence
          </h3>
          <div className="bg-slate-50 border-l-4 border-indigo-500 p-4 rounded-r-xl">
            <p className="text-sm text-slate-700 leading-relaxed italic">
              {smpData.scenario || "Aucun scénario défini. Utilisez le chat pour décrire l'événement (ex: Incendie Dépôt)."}
            </p>
          </div>
        </section>

        {/* Section 2 : Ventilation des Valeurs Exposées */}
        <section>
          <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-400 mb-4">
            <TrendingUp size={14} className="text-indigo-500" /> Ventilation des Valeurs (VTA)
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <ValueCard icon={<Building2 size={16}/>} label="Bâtiments" value={smpData.valeurs?.batiment} color="blue" />
            <ValueCard icon={<Package size={16}/>} label="Stocks" value={smpData.valeurs?.stocks} color="orange" />
            <ValueCard icon={<Activity size={16}/>} label="Matériel" value={smpData.valeurs?.materiel} color="indigo" />
            <ValueCard icon={<TrendingUp size={16}/>} label="Perte Exp." value={smpData.valeurs?.pe} color="rose" />
          </div>
        </section>

        {/* Section 3 : Hypothèses Retenues (Logique de l'IA) */}
        <section>
          <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-400 mb-3">
            <FileText size={14} className="text-indigo-500" /> Hypothèses Techniques
          </h3>
          <div className="space-y-2">
            {smpData.hypotheses?.length > 0 ? (
              smpData.hypotheses.map((h, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                  <CheckCircle2 size={16} className="text-green-500 mt-0.5 shrink-0" />
                  <span className="text-xs text-slate-600 font-medium">{h}</span>
                </div>
              ))
            ) : (
              <p className="text-[11px] text-slate-400 text-center py-4">L'IA listera ici les points de rupture et barrières retenus.</p>
            )}
          </div>
        </section>
      </div>

      {/* Footer : Indicateur de confiance */}
      <div className="p-4 bg-slate-50 border-t border-slate-100">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Expert CIAR : {responses['nomination']?.value || '---'}</span>
          <div className="flex items-center gap-1">
             <div className="w-2 h-2 bg-green-500 rounded-full"></div>
             <span className="text-[10px] font-bold text-slate-500 uppercase">Document Prêt</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* Sous-composant pour les cartes de valeurs */
const ValueCard = ({ icon, label, value, color }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100"
  };

  return (
    <div className={`p-3 rounded-xl border ${colors[color]} flex flex-col gap-1`}>
      <div className="flex items-center gap-2 opacity-80">
        {icon}
        <span className="text-[10px] font-black uppercase">{label}</span>
      </div>
      <span className="text-sm font-bold truncate">
        {value ? new Intl.NumberFormat('fr-DZ').format(value) : '0'} <small className="text-[10px]">DZD</small>
      </span>
    </div>
  );
};

export default SMPPreview;
