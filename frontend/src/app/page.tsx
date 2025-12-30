'use client'

import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Zap, Sparkles, BarChart3, Upload, Video, 
  MessageSquare, Calendar, ArrowRight, Play 
} from "lucide-react";
import VideoUploader from "../components/VideoUploader";
import EvolutionCard from "../components/EvolutionCard";

export default function Home() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [history, setHistory] = useState<{ id: string }[]>([]);
  const [statsData, setStatsData] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Cargar historial de localStorage al montar el componente
  useEffect(() => {
    const keys = Object.keys(localStorage)
      .filter(key => key.startsWith('analysis-'))
      .map(key => ({ id: key.replace('analysis-', '') }))
      .reverse() 
      .slice(0, 4); 
    setHistory(keys);
  }, []);

  // Cargar stats del backend
  useEffect(() => {
    const fetchStats = async () => {
      setLoadingStats(true);
      try {
        const res = await fetch('http://localhost:8000/user/stats');
        if (res.ok) {
          const data = await res.json();
          setStatsData(data);
        }
      } catch (err) {
        console.error('Error loading stats:', err);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  const handleSelect = () => {
    fileInputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedName(file.name);

    const tempId = (typeof crypto !== "undefined" && crypto.randomUUID) ? crypto.randomUUID() : `temp-${Date.now()}`;
    if (typeof window !== "undefined") {
      (window as any).__pendingUpload = { id: tempId, file };
      sessionStorage.setItem(
        "pending-upload-meta",
        JSON.stringify({ id: tempId, name: file.name, type: file.type, size: file.size })
      );
    }
    router.push(`/analysis/new?tempId=${encodeURIComponent(tempId)}`);
  };

  return (
    <div className="w-full min-h-screen bg-[#F7F7F7] text-[#111827]">
      <div className="w-full flex flex-col items-center">
        <div className="w-full max-w-[1100px] px-6 py-16 md:py-24 space-y-24">
          
          {/* 1. Hero Section */}
          <div className="flex flex-col items-center text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#7C4DFF]/10 text-[#7C4DFF] text-xs font-bold uppercase tracking-widest shadow-sm">
              <Sparkles className="w-4 h-4" /> IA de Retención Viral
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black text-[#111827] leading-[1.1] tracking-tight">
              Analiza tu contenido <br />
              <span className="text-[#7C4DFF]">como un experto</span>
            </h1>
            
            <p className="text-lg md:text-xl text-[#6B7280] max-w-[650px] leading-relaxed font-medium">
              Nuestra IA evalúa el gancho, ritmo y retención de tus vídeos en segundos. 
              Recibe recomendaciones accionables para viralizar tu contenido.
            </p>

            <div className="pt-6 w-full flex flex-col items-center gap-4">
                {/* Uploader integrado para usar el nuevo overlay */}
                <div className="w-full max-w-[720px]">
                  <VideoUploader />
                </div>
            </div>
          </div>

          {/* 2. Benefits Grid (Mantenemos el orden de ventas) */}
          <div className="space-y-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="group bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:border-[#7C4DFF]/20 transition-all duration-300">
                <div className="w-14 h-14 bg-[#7C4DFF]/10 rounded-2xl flex items-center justify-center mb-6">
                  <Zap className="w-7 h-7 text-[#7C4DFF]" />
                </div>
                <h3 className="text-xl font-black text-[#111827] mb-3">Análisis Flash</h3>
                <p className="text-[#6B7280] text-sm leading-relaxed font-medium">
                  Resultados en menos de 15 segundos. La IA detecta debilidades automáticamente.
                </p>
              </div>

              <div className="group bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:border-[#7C4DFF]/20 transition-all duration-300">
                <div className="w-14 h-14 bg-[#7C4DFF]/10 rounded-2xl flex items-center justify-center mb-6">
                  <MessageSquare className="w-7 h-7 text-[#7C4DFF]" />
                </div>
                <h3 className="text-xl font-black text-[#111827] mb-3">Coach de Estrategia</h3>
                <p className="text-[#6B7280] text-sm leading-relaxed font-medium">
                  Chatea con nuestro experto IA sobre cada recomendación personalizada.
                </p>
              </div>

              <div className="group bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:border-[#7C4DFF]/20 transition-all duration-300">
                <div className="w-14 h-14 bg-[#7C4DFF]/10 rounded-2xl flex items-center justify-center mb-6">
                  <BarChart3 className="w-7 h-7 text-[#7C4DFF]" />
                </div>
                <h3 className="text-xl font-black text-[#111827] mb-3">Score de Retención</h3>
                <p className="text-[#6B7280] text-sm leading-relaxed font-medium">
                  Puntuación basada en algoritmos reales de viralidad para TikTok y Reels.
                </p>
              </div>
            </div>

            {/* Logos / Prueba social */}
            <div className="flex flex-wrap justify-center gap-8 opacity-40 grayscale pt-6">
              <div className="font-black text-xl italic tracking-tighter">TIKTOK AI</div>
              <div className="font-black text-xl italic tracking-tighter">REELS LAB</div>
              <div className="font-black text-xl italic tracking-tighter">SHORT GENIUS</div>
            </div>
          </div>

          {/* 3. NUEVA POSICIÓN: Panel de Evolución (Debajo de Benefits) */}
          {!loadingStats && statsData && (
            <section className="space-y-6 py-12 border-t border-gray-100 animate-in fade-in slide-in-from-bottom-6 duration-1000">
              <EvolutionCard 
                analyses={statsData.analyses}
                aiInsight={statsData.ai_insight}
                bestCategory={statsData.best_category}
                totalVideos={statsData.total_videos}
              />
            </section>
          )}

          {/* 4. Historial Reciente (Debajo de Evolution si existe) */}
          {history.length > 0 && (
            <section className="space-y-10 py-12 border-t border-gray-100 animate-in fade-in slide-in-from-bottom-6 duration-1000">
              <div className="flex items-end justify-between">
                <div>
                  <h2 className="text-3xl font-black text-[#111827] tracking-tight">Tus Últimos Análisis</h2>
                  <p className="text-[#6B7280] font-medium mt-2 text-lg">Revisa tus insights previos y sigue optimizando.</p>
                </div>
                <button 
                  onClick={() => router.push('/history')}
                  className="flex items-center gap-2 text-sm font-black text-[#7C4DFF] hover:translate-x-1 transition-transform"
                >
                  HISTORIAL COMPLETO <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="flex gap-6 overflow-x-auto pb-8 snap-x scrollbar-hide md:grid md:grid-cols-2 lg:grid-cols-4 md:overflow-visible">
                {history.map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => router.push(`/analysis/${item.id}`)}
                    className="group min-w-[280px] md:min-w-0 bg-white rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden snap-start cursor-pointer transition-all hover:-translate-y-2 hover:shadow-xl"
                  >
                    <div className="relative aspect-video bg-gray-50 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center group-hover:bg-[#7C4DFF]/10 transition-colors">
                        <Video className="w-6 h-6 text-gray-300 group-hover:text-[#7C4DFF] transition-colors" />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-[#111827]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                        <div className="flex items-center gap-2 text-white text-[10px] font-black uppercase tracking-widest">
                          <Play className="w-3 h-3 fill-current" /> Ver Resultados
                        </div>
                      </div>
                    </div>
                    <div className="p-5 space-y-2">
                      <h4 className="font-bold text-[#111827] truncate group-hover:text-[#7C4DFF] transition-colors">Análisis #{item.id.substring(0,8)}</h4>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-bold">
                          <Calendar className="w-3 h-3" /> GUARDADO
                        </div>
                        <span className="text-[10px] font-black text-[#7C4DFF] bg-[#7C4DFF]/5 px-2 py-0.5 rounded-md">85% SCORE</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>
      </div>
    </div>
  );
}