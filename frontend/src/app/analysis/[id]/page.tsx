'use client'

import React, { useState, useEffect, use, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Zap, Sun, MousePointerClick, Volume2, Check, MessageCircle, 
  Play, ChevronLeft, X, ArrowRight, Sparkles, ListTodo, Circle, CheckCircle2 
} from 'lucide-react';
import EditingTimeline from '../../../components/EditingTimeline';

type Recommendation = {
  id: string;
  type: 'hook' | 'lighting' | 'cta' | 'audio';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  timestamp?: number;
};

export default function AnalysisPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [applied, setApplied] = useState<Set<string>>(new Set());
  const reuploadInputRef = useRef<HTMLInputElement | null>(null);
  const [retentionScore, setRetentionScore] = useState<number>(0);
  const [finalStatus, setFinalStatus] = useState<'changes_needed' | 'ready' | null>(null);
  const [editingTimeline, setEditingTimeline] = useState<any[]>([]);
  
  // Estados del nuevo Chatbot de dos pasos
  const [chatOpen, setChatOpen] = useState(false);
  const [activeRecommendation, setActiveRecommendation] = useState<Recommendation | null>(null);
  const [isChatMode, setIsChatMode] = useState(false);

  // Estado para las tareas del Action Plan
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());

  // Score ahora proviene del backend

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const isProcessing = useRef(false);

  useEffect(() => {
    if (id === 'new' || id.startsWith('temp')) return;
    const cleanId = id.trim();
    const savedAnalysis = localStorage.getItem(`analysis-${cleanId}`);
    const savedScore = localStorage.getItem(`score-${cleanId}`);
    const savedStatus = localStorage.getItem(`status-${cleanId}`);
    const savedVideoUrl = localStorage.getItem(`video-url-${cleanId}`);
    const savedTimeline = localStorage.getItem(`timeline-${cleanId}`);
    if (savedAnalysis) {
      setAnalysis(savedAnalysis);
      if (savedScore) setRetentionScore(Number(savedScore));
      if (savedStatus === 'ready' || savedStatus === 'changes_needed') setFinalStatus(savedStatus as any);
      if (savedTimeline) {
        try {
          setEditingTimeline(JSON.parse(savedTimeline));
        } catch (e) {
          setEditingTimeline([]);
        }
      }
      setAnalysisData({
        analysis: savedAnalysis,
        retention_score: savedScore ? Number(savedScore) : undefined,
        final_status: savedStatus || undefined,
        video_id: cleanId,
        video_url: savedVideoUrl || undefined,
      });
      setLoading(false);
      setUploading(false);
    } else {
      const timeout = setTimeout(() => { if (!analysis) setError(true); }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [id, analysis]);

  useEffect(() => {
    if (typeof window === 'undefined' || !(id === 'new' || id.startsWith('temp')) || isProcessing.current) return;
    const pending = (window as any).__pendingUpload;
    if (!pending?.file) {
      setErrorMessage("No se encontró el video.");
      setError(true);
      return;
    }
    isProcessing.current = true;
    uploadFile(pending.file);
  }, [id]);

  const uploadFile = async (file: File) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60_000);
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/upload', { method: 'POST', body: formData, signal: controller.signal });
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      const data = await response.json();
      console.log('res.data (analysis upload)', data);
      if (data.analysis && !data.analysis.includes('429')) {
        localStorage.setItem(`analysis-${data.video_id}`, data.analysis);
        if (typeof data.retention_score !== 'undefined' && data.retention_score !== null) {
          localStorage.setItem(`score-${data.video_id}`, String(data.retention_score));
        }
        if (typeof data.final_status === 'string') {
          localStorage.setItem(`status-${data.video_id}`, data.final_status);
        }
        if (data.editing_timeline && Array.isArray(data.editing_timeline)) {
          localStorage.setItem(`timeline-${data.video_id}`, JSON.stringify(data.editing_timeline));
          setEditingTimeline(data.editing_timeline);
        }
        setAnalysis(data.analysis);
        if (typeof data.retention_score === 'number') setRetentionScore(data.retention_score);
        if (typeof data.final_status === 'string') setFinalStatus(data.final_status);
        setAnalysisData(data);
        router.replace(`/analysis/${data.video_id}`);
        setLoading(false);
        setUploading(false);
      } else {
        throw new Error("Límite de IA alcanzado.");
      }
    } catch (err: any) {
      const message = err?.name === 'AbortError' ? 'La subida tardó demasiado. Intenta de nuevo.' : err?.message || 'Error al subir';
      setErrorMessage(message);
      setError(true);
      setUploading(false);
    } finally {
      clearTimeout(timeout);
    }
  };

  useEffect(() => {
    if (!analysis) return;
    try {
      const firstBracket = analysis.indexOf('[');
      const lastBracket = analysis.lastIndexOf(']');
      const jsonContent = (firstBracket !== -1 && lastBracket !== -1) ? analysis.slice(firstBracket, lastBracket + 1) : analysis;
      const parsed = JSON.parse(jsonContent.replace(/'/g, '"'));
      setRecommendations(Array.isArray(parsed) ? parsed : []);
    } catch (e) { setRecommendations([]); }
  }, [analysis]);

  const handleApply = (recId: string) => {
    setApplied((prev) => {
      const next = new Set(prev);
      next.has(recId) ? next.delete(recId) : next.add(recId);
      return next;
    });
  };

  const handleSeek = (timestamp?: number) => {
    if (timestamp !== undefined && videoRef.current) {
      videoRef.current.currentTime = timestamp;
      videoRef.current.play();
    }
  };

  const openExplanation = (rec: Recommendation) => {
    setActiveRecommendation(rec);
    setIsChatMode(false);
    setChatOpen(true);
  };

  return (
    <main className="min-h-screen bg-[#F7F7F7] text-[#111827] pb-20">
      {uploading && (
        <div className="fixed inset-0 z-50 bg-white/90 backdrop-blur-md flex flex-col items-center justify-center px-6">
          <div className="w-full max-w-xs space-y-4">
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#7C4DFF] animate-progress" style={{ width: '60%' }} />
            </div>
            <p className="text-sm font-bold text-center text-[#7C4DFF] animate-pulse">Analizando píxeles...</p>
          </div>
        </div>
      )}

      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <header className="flex items-center justify-between mb-10">
          <button onClick={() => router.push('/')} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="text-right">
            <h1 className="text-2xl font-black tracking-tight uppercase">Video Audit <span className="text-[#7C4DFF]">Pro</span></h1>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">IA Creator Lab</p>
          </div>
        </header>

        {!error && (
          <div className="flex flex-col lg:flex-row gap-12 items-start">
            <div className="w-full lg:w-[320px] lg:sticky lg:top-8 flex-shrink-0">
              <div className="relative aspect-[9/16] w-full bg-black rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] border-[6px] border-white overflow-hidden">
                <video ref={videoRef} controls autoPlay loop className="w-full h-full object-cover">
                  {(() => {
                    const savedUrl = typeof window !== 'undefined' ? localStorage.getItem(`video-url-${id}`) : null;
                    const fallback = `http://localhost:8000/videos/${id}.mp4`;
                    const src = savedUrl || fallback;
                    return <source src={src} type="video/mp4" />;
                  })()}
                </video>
              </div>
              <div className="mt-6">
                <FinalVerdict status={finalStatus} score={retentionScore} />
              </div>
            </div>

            <div className="flex-1 w-full space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <RetentionWidget score={retentionScore} />
                  </div>

                  {recommendations.map((rec) => (
                    <div 
                      key={rec.id} 
                      onClick={() => handleSeek(rec.timestamp)}
                      className={`group relative bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-[#7C4DFF]/30 transition-all cursor-pointer ${applied.has(rec.id) ? 'opacity-50' : ''}`}
                    >
                      <div className="flex gap-4">
                         <IconBubble type={rec.type} />
                         <div className="flex-1 space-y-3">
                           <div className="flex justify-between items-start">
                             <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${rec.priority === 'high' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                               {rec.priority.toUpperCase()}
                             </span>
                             <span className="text-xs font-mono text-gray-400">{rec.timestamp}s</span>
                           </div>
                           <div>
                             <h4 className="font-bold text-gray-900 leading-tight mb-1">{rec.title}</h4>
                             <p className="text-xs text-gray-500 leading-normal line-clamp-2">{rec.description}</p>
                           </div>
                           <div className="flex gap-2">
                             <button 
                               onClick={(e) => { e.stopPropagation(); openExplanation(rec); }}
                               className="flex-1 py-2 px-3 bg-[#7C4DFF] text-white text-[11px] font-bold rounded-lg flex items-center justify-center gap-1.5 hover:bg-[#6b3bff] transition-colors shadow-sm shadow-[#7C4DFF]/20"
                             >
                               <Sparkles className="w-3.5 h-3.5" /> Explicación
                             </button>
                             <button 
                               onClick={(e) => { e.stopPropagation(); handleApply(rec.id); }}
                               className={`p-2 rounded-lg border transition-colors ${applied.has(rec.id) ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-gray-200 text-gray-400 hover:text-[#7C4DFF]'}`}
                             >
                               <Check className="w-4 h-4" />
                             </button>
                           </div>
                         </div>
                      </div>
                    </div>
                  ))}
              </div>

              {/* EDITING TIMELINE - Reemplaza ACTION PLAN */}
              {!loading && editingTimeline && editingTimeline.length > 0 && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <EditingTimeline 
                    timeline={editingTimeline}
                    onSeek={handleSeek}
                  />
                </div>
              )}

              {/* Fallback: Old Action Plan si no hay timeline */}
              {!loading && recommendations.length > 0 && (!editingTimeline || editingTimeline.length === 0) && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <ActionPlan 
                    recommendations={recommendations} 
                    completedTasks={completedTasks}
                    setCompletedTasks={setCompletedTasks}
                  />
                </div>
              )}
              {/* Cierre y Re-validación */}
              <div className="mt-8 w-full bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8 flex flex-col items-center gap-4">
                <h3 className="text-xl font-black uppercase tracking-tight">¿Has aplicado los cambios?</h3>
                <p className="text-sm text-gray-500">Sube una versión corregida para actualizar el veredicto.</p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => reuploadInputRef.current?.click()}
                    className="px-8 py-4 rounded-[2rem] bg-[#111827] hover:bg-[#1f2937] text-white font-black tracking-widest text-sm shadow-xl shadow-gray-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    SUBIR VERSIÓN CORREGIDA
                  </button>
                </div>
                <input ref={reuploadInputRef} type="file" accept="video/*" className="hidden" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setApplied(new Set());
                    setCompletedTasks(new Set());
                    uploadFile(file);
                  }
                }} />
              </div>
            </div>
          </div>
        )}
      </div>

      <ChatbotTwoSteps 
        open={chatOpen} 
        setOpen={setChatOpen} 
        recommendation={activeRecommendation} 
        isChatMode={isChatMode}
        setIsChatMode={setIsChatMode}
        currentAnalysis={analysis}
      />
    </main>
  );
}
function FinalVerdict({ status, score }: { status: 'changes_needed' | 'ready' | null, score: number }) {
  const isReady = status === 'ready';
  const gradient = isReady ? 'from-emerald-500 to-green-600' : 'from-amber-400 to-orange-500';
  const Icon = isReady ? CheckCircle2 : Zap;
  return (
    <motion.div
      initial={{ opacity: 0.6 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className={`relative overflow-hidden rounded-[2.5rem] p-6 bg-gradient-to-r ${gradient} text-white shadow-[0_0_40px_rgba(0,0,0,0.2)]`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center ${isReady ? '' : 'animate-pulse'}`}>
            <Icon className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-black tracking-tight uppercase">
              {isReady ? '¡Listo para Publicar!' : 'Requiere Mejoras'}
            </h3>
            <p className="text-xs font-bold uppercase tracking-widest opacity-80">Veredicto Final de la IA</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-4xl font-black">{Math.round(score || 0)}</div>
          <div className="text-xs font-bold uppercase opacity-80">Retention Score</div>
        </div>
      </div>
      <motion.div
        initial={{ boxShadow: '0 0 0px rgba(255,255,255,0)' }}
        animate={{ boxShadow: isReady ? '0 0 32px rgba(255,255,255,0.3)' : '0 0 18px rgba(255,255,255,0.2)' }}
        transition={{ duration: 0.8 }}
        className="absolute inset-0 rounded-[2.5rem] pointer-events-none"
      />
    </motion.div>
  );
}

// COMPONENTE ACTION PLAN
function ActionPlan({ recommendations, completedTasks, setCompletedTasks }: any) {
  const tasks = useMemo(() => {
    return recommendations.slice(0, 4).map((rec: Recommendation) => ({
      id: rec.id,
      text: rec.title,
      category: rec.type === 'hook' ? 'Guion' : rec.type === 'lighting' ? 'Edición' : 'Estrategia'
    }));
  }, [recommendations]);

  const toggleTask = (id: string) => {
    setCompletedTasks((prev: Set<string>) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const progress = Math.round((completedTasks.size / tasks.length) * 100);

  return (
    <div className="w-full bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-8 border-b border-gray-50 bg-gradient-to-r from-[#7C4DFF]/5 to-transparent">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#7C4DFF] rounded-xl flex items-center justify-center shadow-lg shadow-[#7C4DFF]/20">
              <ListTodo className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-black text-[#111827] tracking-tight uppercase">Plan de Acción</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Pasos para viralizar este video</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-[#7C4DFF]">{progress}%</div>
            <div className="text-[10px] text-gray-400 font-black uppercase">Completado</div>
          </div>
        </div>
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-[#7C4DFF] transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-3">
        {tasks.map((task: any) => (
          <div 
            key={task.id}
            onClick={() => toggleTask(task.id)}
            className={`group flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${
              completedTasks.has(task.id) ? "bg-emerald-50/50 border-emerald-100 opacity-60" : "bg-white border-gray-100 hover:border-[#7C4DFF]/30"
            }`}
          >
            <div className="mt-0.5">
              {completedTasks.has(task.id) ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50" />
              ) : (
                <Circle className="w-5 h-5 text-gray-200 group-hover:text-[#7C4DFF]" />
              )}
            </div>
            <div className="flex-1">
              <p className={`text-xs font-bold leading-tight ${completedTasks.has(task.id) ? "line-through text-gray-400" : "text-gray-700"}`}>
                {task.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ... Resto de componentes (ChatbotTwoSteps, RetentionWidget, IconBubble)
function ChatbotTwoSteps({ open, setOpen, recommendation, isChatMode, setIsChatMode, currentAnalysis }: any) {
  if (!open || !recommendation) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 transition-all duration-500">
      <div className={`bg-white shadow-2xl transition-all duration-500 ease-in-out flex flex-col overflow-hidden ${
        isChatMode 
          ? 'w-full max-w-2xl h-[700px] rounded-[2.5rem]' 
          : 'w-full max-w-md h-auto rounded-[3rem] p-10'
      }`}>
        
        {/* MODO 1: EXPLICACIÓN INICIAL (Visual y Directa) */}
        {!isChatMode ? (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div className="p-3 bg-[#7C4DFF]/10 rounded-2xl">
                <Sparkles className="w-6 h-6 text-[#7C4DFF]" />
              </div>
              <button onClick={() => setOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#7C4DFF]" />
                <span className="text-[11px] font-bold text-[#7C4DFF] uppercase tracking-[0.2em]">Insight de Experto</span>
              </div>
              <h3 className="text-3xl font-black text-gray-900 leading-[1.1]">{recommendation.title}</h3>
              <p className="text-lg text-gray-500 leading-relaxed font-medium">{recommendation.description}</p>
            </div>

            <button 
              onClick={() => setIsChatMode(true)}
              className="w-full bg-[#111827] text-white py-5 rounded-[1.5rem] font-bold flex items-center justify-center gap-3 hover:bg-[#1f2937] transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-gray-200"
            >
              Chatear con el Asistente
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        ) : (
          /* MODO 2: CHATBOT ESTILO GEMINI/CHATGPT */
          <>
            <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center bg-white sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#7C4DFF] to-[#9b6dff] flex items-center justify-center shadow-lg shadow-[#7C4DFF]/20">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 leading-none">AI Video Coach</h4>
                  <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Online ahora</span>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 bg-white space-y-6 scrollbar-thin scrollbar-thumb-gray-200">
              <div className="flex items-start gap-4 max-w-[85%]">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-gray-400">AI</div>
                <div className="bg-gray-50 text-gray-800 p-5 rounded-[1.5rem] rounded-tl-none text-sm leading-relaxed border border-gray-100 shadow-sm">
                  He analizado profundamente tu video. Sobre el punto de <strong>{recommendation.title}</strong>, ¿te gustaría saber cómo aplicarlo técnicamente o prefieres ejemplos de otros creadores?
                </div>
              </div>
            </div>

            <div className="p-6 bg-white border-t border-gray-50">
              <div className="relative group">
                <textarea 
                  rows={1}
                  className="w-full bg-[#F7F7F7] border-none rounded-[1.8rem] pl-6 pr-14 py-4 text-sm focus:ring-2 focus:ring-[#7C4DFF]/20 focus:bg-white transition-all resize-none shadow-inner min-h-[56px] flex items-center" 
                  placeholder="Escribe tu duda aquí..." 
                  autoFocus
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#111827] text-white p-3 rounded-full hover:bg-[#7C4DFF] transition-all shadow-lg shadow-gray-200 flex items-center justify-center group-focus-within:bg-[#7C4DFF]">
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <p className="text-center text-[10px] text-gray-400 mt-4 font-medium italic">
                La IA puede cometer errores. Verifica la información clave.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function RetentionWidget({ score }: { score: number }) {
  return (
    <div className="bg-white rounded-[2rem] p-6 border border-gray-100 flex items-center justify-between shadow-sm overflow-hidden relative">
      <div className="absolute right-0 top-0 w-32 h-32 bg-[#7C4DFF]/5 rounded-full -mr-16 -mt-16" />
      <div className="space-y-1">
        <p className="text-[11px] font-black text-gray-300 uppercase tracking-widest">Engagement Potential</p>
        <div className="flex items-baseline gap-1">
          <span className="text-5xl font-black text-gray-900">{score}</span>
          <span className="text-xl font-bold text-gray-400">/100</span>
        </div>
      </div>
      <div className="text-right hidden sm:block relative z-10">
        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase mb-2">
          <Sparkles className="w-3 h-3" /> Nivel Experto
        </div>
        <p className="text-xs text-gray-400">Tu video supera el 80% de la media.</p>
      </div>
    </div>
  );
}

function IconBubble({ type }: { type: Recommendation['type'] }) {
  const cfg = {
    hook: { icon: Zap, bg: 'bg-purple-50', color: 'text-purple-600' },
    lighting: { icon: Sun, bg: 'bg-amber-50', color: 'text-amber-600' },
    cta: { icon: MousePointerClick, bg: 'bg-blue-50', color: 'text-blue-600' },
    audio: { icon: Volume2, bg: 'bg-emerald-50', color: 'text-emerald-600' },
  }[type];
  const Icon = cfg.icon;
  return (
    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
      <Icon className={`w-6 h-6 ${cfg.color}`} />
    </div>
  );
}