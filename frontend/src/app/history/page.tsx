'use client'

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ChevronLeft, Video, Calendar, Search, 
  Trash2, Play, LayoutGrid, Clock 
} from "lucide-react";

export default function HistoryPage() {
  const router = useRouter();
  const [fullHistory, setFullHistory] = useState<{ id: string }[]>([]);
  const [search, setSearch] = useState("");

  // Cargar TODO el historial
  useEffect(() => {
    const keys = Object.keys(localStorage)
      .filter(key => key.startsWith('analysis-'))
      .map(key => ({ id: key.replace('analysis-', '') }))
      .reverse(); 
    setFullHistory(keys);
  }, []);

  // Filtrar por búsqueda
  const filteredHistory = fullHistory.filter(item => 
    item.id.toLowerCase().includes(search.toLowerCase())
  );

  const deleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("¿Estás seguro de que quieres eliminar este análisis?")) {
      localStorage.removeItem(`analysis-${id}`);
      setFullHistory(prev => prev.filter(item => item.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#111827] pb-20">
      <div className="max-w-[1200px] mx-auto px-6 py-12 space-y-10">
        
        {/* Header de Navegación */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <button 
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-sm font-bold text-[#7C4DFF] hover:translate-x-[-4px] transition-transform mb-2"
            >
              <ChevronLeft className="w-4 h-4" /> VOLVER AL INICIO
            </button>
            <h1 className="text-4xl font-black tracking-tight uppercase">Historial <span className="text-[#7C4DFF]">Completo</span></h1>
            <p className="text-[#6B7280] font-medium">Gestiona y revisa todos tus análisis de video anteriores.</p>
          </div>

          {/* Barra de Búsqueda */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Buscar por ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#7C4DFF]/20 outline-none transition-all shadow-sm"
            />
          </div>
        </header>

        {/* Grid de Contenido */}
        {filteredHistory.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredHistory.map((item) => (
              <HistoryCardLarge 
                key={item.id} 
                id={item.id} 
                onDelete={(e) => deleteItem(item.id, e)}
                onClick={() => router.push(`/analysis/${item.id}`)} 
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[2.5rem] p-20 text-center border border-gray-100 space-y-4">
             <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto">
                <Clock className="w-10 h-10 text-gray-200" />
             </div>
             <h3 className="text-xl font-bold text-gray-900">No se encontraron análisis</h3>
             <p className="text-gray-500 max-w-xs mx-auto">Parece que aún no tienes videos procesados o el filtro no coincide.</p>
             <button 
                onClick={() => router.push('/')}
                className="bg-[#7C4DFF] text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-[#7C4DFF]/20 hover:scale-105 transition-transform"
             >
                Analizar Nuevo Video
             </button>
          </div>
        )}
      </div>
    </div>
  );
}

// COMPONENTE DE TARJETA DETALLADA
function HistoryCardLarge({ id, onClick, onDelete }: any) {
  const [thumbnail, setThumbnail] = useState<string | null>(null);

  useEffect(() => {
    const video = document.createElement("video");
    video.src = `http://localhost:8000/videos/${id}.mp4`;
    video.crossOrigin = "anonymous";
    video.currentTime = 1;
    video.onloadeddata = () => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d")?.drawImage(video, 0, 0);
      setThumbnail(canvas.toDataURL());
    };
  }, [id]);

  return (
    <div 
      onClick={onClick}
      className="group bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden cursor-pointer transition-all hover:shadow-xl hover:-translate-y-2"
    >
      <div className="relative aspect-video bg-gray-900">
        {thumbnail ? (
          <img src={thumbnail} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-50 animate-pulse">
            <Video className="w-8 h-8 text-gray-200" />
          </div>
        )}
        
        {/* Overlay con acciones */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <div className="bg-white p-3 rounded-full text-[#7C4DFF] shadow-xl">
            <Play className="w-5 h-5 fill-current" />
          </div>
          <button 
            onClick={onDelete}
            className="bg-red-500 p-3 rounded-full text-white shadow-xl hover:bg-red-600 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-3">
        <div className="flex justify-between items-start">
          <h4 className="font-bold text-[#111827] text-sm truncate uppercase tracking-tight">ID: {id.substring(0,12)}</h4>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
           <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> GUARDADO</div>
           <div className="text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-md">85% SCORE</div>
        </div>
      </div>
    </div>
  );
}