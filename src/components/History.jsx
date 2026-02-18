import React from 'react';
import { useInspectionStore } from '../hooks/useInspectionStore';
import { History as HistoryIcon, FileText, Download, Trash2, Calendar, User } from 'lucide-react';

const History = () => {
  const { history, loadFromHistory, deleteFromHistory, resetAudit } = useInspectionStore();

  return (
    <div className="p-4 space-y-6 pb-24">
      {/* HEADER */}
      <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
            <HistoryIcon className="text-indigo-400" /> Archives des Audits
          </h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">
            {history.length} expertise(s) enregistrée(s)
          </p>
        </div>
      </div>

      {/* BOUTON NOUVEL AUDIT */}
      <button 
        onClick={resetAudit}
        className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-[10px] font-black uppercase text-slate-400 hover:bg-slate-50 transition-all"
      >
        + Commencer un nouveau rapport vide
      </button>

      {/* LISTE */}
      <div className="space-y-4">
        {history.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[2rem] border border-slate-100">
            <FileText size={40} className="mx-auto text-slate-100 mb-4" />
            <p className="text-xs font-bold text-slate-300 uppercase">Aucun historique</p>
          </div>
        ) : (
          history.map((item) => (
            <div key={item.id} className="bg-white p-5 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
              <div className="flex justify-between items-start">
                <div className="flex gap-4">
                  <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-600">
                    <User size={20} />
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-slate-900 uppercase tracking-tight">{item.client}</h4>
                    <p className="text-[10px] font-bold text-indigo-500 uppercase mb-2">{item.activite}</p>
                    <div className="flex items-center gap-2 text-slate-400">
                      <Calendar size={12} />
                      <span className="text-[9px] font-bold">{item.date}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      loadFromHistory(item);
                      alert("Audit chargé avec succès !");
                    }}
                    className="p-3 bg-slate-900 text-white rounded-xl hover:bg-indigo-600 transition-colors"
                    title="Charger l'audit"
                  >
                    <Download size={16} />
                  </button>
                  <button 
                    onClick={() => {
                      if(window.confirm("Supprimer cet audit ?")) deleteFromHistory(item.id);
                    }}
                    className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default History;
