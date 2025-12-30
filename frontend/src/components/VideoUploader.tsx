"use client"

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Sparkles } from 'lucide-react';

export default function VideoUploader() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      setError('Por favor selecciona un vídeo válido');
      return;
    }

    setLoading(true);
    setProgress(2);
    setError(null);

    if (progressInterval.current) clearInterval(progressInterval.current);
    progressInterval.current = setInterval(() => {
      setProgress((p) => (p < 94 ? p + 1 : p));
    }, 120);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60_000);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      if (!response.ok) throw new Error(`Error: ${response.status}`);
      const data = await response.json();
      console.log('res.data (upload response)', data);

      if (data?.analysis && typeof data.analysis === 'string' && !data.analysis.startsWith('Error')) {
        localStorage.setItem(`analysis-${data.video_id}`, data.analysis);
        if (typeof data.retention_score !== 'undefined' && data.retention_score !== null) {
          localStorage.setItem(`score-${data.video_id}`, String(data.retention_score));
        }
        if (typeof data.final_status === 'string') {
          localStorage.setItem(`status-${data.video_id}`, data.final_status);
        }
        if (data.editing_timeline && Array.isArray(data.editing_timeline)) {
          localStorage.setItem(`timeline-${data.video_id}`, JSON.stringify(data.editing_timeline));
        }
        if (data.video_url) {
          localStorage.setItem(`video-url-${data.video_id}`, data.video_url);
        }
        if (progressInterval.current) clearInterval(progressInterval.current);
        setProgress(100);
        setTimeout(() => {
          router.push(`/analysis/${data.video_id}`);
        }, 400);
      } else {
        throw new Error(data.analysis || 'Error en el análisis');
      }
    } catch (err) {
      if (progressInterval.current) clearInterval(progressInterval.current);
      const msg = err instanceof Error ? (err.name === 'AbortError' ? 'La subida tardó demasiado. Intenta de nuevo.' : err.message) : 'Error al subir';
      setError(msg);
      setLoading(false);
    } finally {
      clearTimeout(timeoutId);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Botón con tamaño optimizado (Semi-Grande) */}
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={loading}
        className="group px-8 py-4 rounded-2xl bg-[#7C4DFF] hover:bg-[#6b3bff] text-white font-bold text-base shadow-xl shadow-[#7C4DFF]/25 transition-all transform hover:scale-[1.02] active:scale-95 flex items-center gap-3"
      >
        <Upload className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
        Subir video
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {error && (
        <p className="text-red-500 text-[10px] font-bold animate-in shake">✕ {error}</p>
      )}

      {/* Pantalla de Carga Modal */}
      {loading && (
        <div className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in">
          <div className="w-full max-w-sm text-center space-y-8">
            <div className="flex justify-center">
              <div className="h-20 w-20 rounded-3xl bg-[#7C4DFF]/10 flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-[#7C4DFF] animate-pulse" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-7xl font-black text-[#111827] tracking-tighter tabular-nums">
                {progress}%
              </div>
              <p className="text-sm font-bold text-[#7C4DFF] uppercase tracking-widest antialiased">
                {progress <= 30 && 'Subiendo archivo...'}
                {progress > 30 && progress <= 60 && 'Analizando contenido...'}
                {progress > 60 && progress <= 90 && 'Generando reporte...'}
                {progress > 90 && 'Finalizando...'}
              </p>
            </div>

            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-[#7C4DFF] rounded-full transition-all duration-300 ease-out shadow-[0_0_20px_rgba(124,77,255,0.4)]"
                style={{ width: `${progress}%` }}
              />
            </div>
            
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              La IA de Video Audit PRO está procesando tu video
            </p>
          </div>
        </div>
      )}
    </div>
  );
}