import React, { useState } from 'react';
import { Camera, MapPin, Clock, X, Loader2 } from 'lucide-react';

const PhotoCapture = ({ qId, onCapture }) => {
  const [loading, setLoading] = useState(false);

  const capture = async () => {
    setLoading(true);
    try {
      // 1. Récupérer la position GPS
      const pos = await new Promise((res, rej) => {
        navigator.geolocation.getCurrentPosition(res, rej, { enableHighAccuracy: true });
      });

      // 2. Ouvrir le sélecteur de caméra
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment'; // Force la caméra arrière sur mobile
      
      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            // 3. Incrustation des données (Horodatage + GPS)
            const padding = canvas.width * 0.02;
            ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
            ctx.fillRect(0, canvas.height - (padding * 5), canvas.width, padding * 5);
            
            ctx.fillStyle = "white";
            ctx.font = `${padding * 1.5}px Arial`;
            const text = `${new Date().toLocaleString()} | GPS: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`;
            ctx.fillText(text, padding, canvas.height - padding);

            onCapture({
              url: canvas.toDataURL('image/jpeg', 0.7),
              timestamp: new Date().toISOString(),
              coords: { lat: pos.coords.latitude, lng: pos.coords.longitude }
            });
            setLoading(false);
          };
          img.src = event.target.result;
        };
        reader.readAsDataURL(file);
      };
      input.click();
    } catch (err) {
      alert("Erreur: Activez le GPS et la Caméra.");
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={capture}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase hover:bg-indigo-50 hover:text-indigo-600 transition-all"
    >
      {loading ? <Loader2 className="animate-spin" size={14} /> : <Camera size={14} />}
      Ajouter une preuve photo
    </button>
  );
};

export default PhotoCapture;
