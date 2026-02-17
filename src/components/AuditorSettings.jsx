import React from 'react';
import { useInspectionStore } from '../hooks/useInspectionStore';
import { User, Building2, Image as ImageIcon } from 'lucide-react';

const AuditorSettings = () => {
  const { auditorInfo, setAuditorInfo } = useInspectionStore();

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAuditorInfo({ logo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4 mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">
          Profil de l'Auditeur
        </h3>
        {auditorInfo?.logo && (
          <div className="h-8 w-8 rounded-full overflow-hidden border border-slate-100 shadow-inner">
            <img src={auditorInfo.logo} alt="Logo" className="w-full h-full object-cover" />
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative group">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="Nom de l'expert"
            className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-2xl text-sm border-2 border-transparent focus:border-indigo-100 focus:bg-white focus:ring-0 transition-all outline-none"
            value={auditorInfo?.name || ''}
            onChange={(e) => setAuditorInfo({ name: e.target.value })}
          />
        </div>
        
        <div className="relative group">
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="Cabinet / Entreprise"
            className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-2xl text-sm border-2 border-transparent focus:border-indigo-100 focus:bg-white focus:ring-0 transition-all outline-none"
            value={auditorInfo?.company || ''}
            onChange={(e) => setAuditorInfo({ company: e.target.value })}
          />
        </div>
      </div>

      <div className="flex items-center gap-4 pt-2">
        <label className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-indigo-600 active:scale-95 transition-all shadow-lg shadow-slate-200">
          <ImageIcon size={14} />
          {auditorInfo?.logo ? "Changer le Logo" : "Ajouter mon Logo"}
          <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
        </label>
        
        {auditorInfo?.logo && (
          <button 
            onClick={() => setAuditorInfo({ logo: null })}
            className="text-[10px] font-bold text-red-400 hover:text-red-600 underline underline-offset-4"
          >
            Supprimer le logo
          </button>
        )}
      </div>
    </div>
  );
};

export default AuditorSettings;
