import React, { useState } from 'react';
import { Upload, Loader2, ImagePlus } from 'lucide-react';

const PhotoCapture = ({ qId, onCapture }) => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const processFile = (file, locationText) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Optimisation de la taille (max 1600px)
          const maxDim = 1600;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height *= maxDim / width;
              width = maxDim;
            } else {
              width *= maxDim / height;
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          // Incrustation du Watermark
          const padding = canvas.width * 0.02;
          ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
          ctx.fillRect(0, canvas.height - (padding * 4), canvas.width, padding * 4);
          
          ctx.fillStyle = "white";
          ctx.font = `bold ${padding * 1.2}px Arial`;
          const timestamp = new Date().toLocaleString();
          ctx.fillText(`${timestamp} | ${locationText}`, padding, canvas.height - (padding * 1.5));

          resolve({
            url: canvas.toDataURL('image/jpeg', 0.8),
            timestamp: new Date().toISOString(),
            fileName: file.name
          });
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleBatchUpload = async () => {
    setLoading(true);
    
    try {
      // 1. Récupération GPS (une seule fois pour le lot)
      let locationText = "Localisation non disponible";
      try {
        const pos = await new Promise((res, rej) => {
          navigator.geolocation.getCurrentPosition(res, rej, { timeout: 3000 });
        });
        locationText = `GPS: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`;
      } catch (e) { console.log("GPS indisponible"); }

      // 2. Sélecteur multiple
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.multiple = true; // ACTIVATION DU MULTIPLE
      
      input.onchange = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) {
          setLoading(false);
          return;
        }

        setProgress({ current: 0, total: files.length });

        // Traitement séquentiel pour ne pas saturer la mémoire vive
        for (let i = 0; i < files.length; i++) {
          setProgress(prev => ({ ...prev, current: i + 1 }));
          const photoData = await processFile(files[i], locationText);
          onCapture(photoData);
        }

        setLoading(false);
        setProgress({ current: 0, total: 0 });
      };
      
      input.click();
    } catch (err) {
      alert("Erreur lors du téléversement.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-2">
      <button 
        onClick={handleBatchUpload}
        disabled={loading}
        className={`flex items-center gap-3 px-4 py-4 border-2 border-dashed rounded-2xl text-[10px] font-black uppercase transition-all w-full justify-center
          ${loading 
            ? 'bg-slate-50 border-slate-200 text-slate-400' 
            : 'bg-white border-indigo-100 text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50'
          }`}
      >
        {loading ? (
          <Loader2 className="animate-spin" size={18} />
        ) : (
          < ImagePlus size={18} />
        )}
        {loading 
          ? `Traitement en cours... (${progress.current}/${progress.total})` 
          : "Téléverser plusieurs photos"}
      </button>
      
      {loading && (
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <div 
            className="bg-indigo-500 h-full transition-all duration-300"
            style={{ width: `${(progress.current / progress.total) * 100}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default PhotoCapture;
