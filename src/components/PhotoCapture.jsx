import React, { useState } from 'react';
import { Upload, MapPin, Clock, X, Loader2, Image as ImageIcon } from 'lucide-react';

const PhotoCapture = ({ qId, onCapture }) => {
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    setLoading(true);
    
    try {
      // 1. Tentative de récupération GPS (optionnelle pour le téléversement)
      let locationText = "Localisation non disponible";
      try {
        const pos = await new Promise((res, rej) => {
          navigator.geolocation.getCurrentPosition(res, rej, { 
            enableHighAccuracy: false, // Moins restrictif pour l'upload
            timeout: 3000 
          });
        });
        locationText = `GPS: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`;
      } catch (e) {
        console.log("GPS non disponible pour ce téléversement");
      }

      // 2. Ouvrir le sélecteur de fichiers (Galerie ou Dossier)
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.multiple = false; // On traite une photo à la fois pour le marquage
      
      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) {
          setLoading(false);
          return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Optimisation de la taille (max 1600px pour éviter de saturer IndexedDB)
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

            // 3. Incrustation de la preuve d'expertise (Watermark)
            const padding = canvas.width * 0.02;
            ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
            ctx.fillRect(0, canvas.height - (padding * 4), canvas.width, padding * 4);
            
            ctx.fillStyle = "white";
            ctx.font = `bold ${padding * 1.2}px Arial`;
            const timestamp = new Date().toLocaleString();
            ctx.fillText(`${timestamp} | ${locationText}`, padding, canvas.height - (padding * 1.5));

            onCapture({
              url: canvas.toDataURL('image/jpeg', 0.8), // Qualité 0.8 pour un bon compromis poids/clarté
              timestamp: new Date().toISOString(),
              fileName: file.name
            });
            setLoading(false);
          };
          img.src = event.target.result;
        };
        reader.readAsDataURL(file);
      };
      
      input.click();
    } catch (err) {
      console.error(err);
      alert("Erreur lors du téléversement.");
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleUpload}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-3 bg-slate-50 text-slate-500 border-2 border-dashed border-slate-200 rounded-2xl text-[10px] font-black uppercase hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all w-full justify-center"
    >
      {loading ? (
        <Loader2 className="animate-spin" size={16} />
      ) : (
        <Upload size={16} />
      )}
      Téléverser une photo (Preuve terrain)
    </button>
  );
};

export default PhotoCapture;
