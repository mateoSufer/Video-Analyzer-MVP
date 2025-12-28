'use client'

import React, { useState, use } from 'react';

type Recommendation = {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
};

const sampleRecommendations: Recommendation[] = [
  {
    id: 'r1',
    title: 'Mejora el gancho inicial para captar la atención. Los primeros 5 segundos son cruciales.',
    description: 'Intenta empezar con una acción o pregunta para generar curiosidad desde el primer segundo.',
    priority: 'high',
  },
  {
    id: 'r2',
    title: 'Optimiza la iluminación en la marca temporal 0:35 para una apariencia más profesional.',
    description: 'Suaviza sombras y sube la exposición ligeramente en esa sección.',
    priority: 'medium',
  },
  {
    id: 'r3',
    title: 'Añade un llamado a la acción claro al final del vídeo.',
    description: 'Termina con una invitación clara (seguir, comentar o visitar enlace).',
    priority: 'high',
  },
];

export default function AnalysisPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <main className="min-h-screen bg-[#F7F7F7] text-[#111827]">

      {/* Page container */}
      <div className="max-w-[1200px] mx-auto px-6 py-10">
        {/* Hero */}
        <section className="text-center mb-8">
          <h1 className="text-3xl md:text-[40px] font-bold leading-tight">Análisis de Optimización</h1>
          <p className="text-[#6B7280] mt-3">Revisa las métricas y recomendaciones generadas por la IA para tu contenido vertical.</p>
        </section>

        {/* Grid: main + sidebar */}
        <div className="grid lg:grid-cols-[1fr_380px] gap-8 items-start">
          
          {/* Main column - VIDEO VERTICAL */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex justify-center p-4 bg-gradient-to-b from-white to-gray-50">
              
              {/* Reproductor Formato TikTok (9:16) */}
              <div className="relative w-full max-w-[320px] aspect-[9/16] bg-black rounded-3xl overflow-hidden shadow-2xl border-[6px] border-white">
                <video 
                  controls 
                  autoPlay 
                  loop 
                  className="w-full h-full object-cover"
                >
                  <source src={`http://localhost:8000/videos/${id}.mp4`} type="video/mp4" />
                  Tu navegador no soporta el vídeo.
                </video>
              </div>
            </div>

            {/* "Subir otro video" and mini-history */}
            <div className="flex items-center justify-between">
              <button className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm hover:shadow-sm transition-all text-[#6B7280]">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" /></svg>
                Analizar otro vídeo
              </button>
              <div className="text-xs text-[#6B7280] font-mono bg-gray-100 px-3 py-1 rounded-full">
                ID: {id}
              </div>
            </div>

            {/* Analysis text / notes */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 italic">
              <p className="text-sm text-[#6B7280] leading-relaxed">
                "Nuestra IA ha detectado que el ritmo visual es excelente, pero el audio original compite con el hook hablado. Se recomienda ajustar niveles en la entrada."
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Recommendations card */}
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-lg mb-4">Recomendaciones Clave</h3>
              <div className="space-y-4">
                {sampleRecommendations.map((r) => (
                  <RecommendationCard key={r.id} rec={r} />
                ))}
              </div>
            </section>

            {/* Retention Card */}
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h4 className="font-bold mb-4">Rendimiento del Vídeo</h4>
              <div className="flex items-center gap-4 bg-green-50 p-4 rounded-xl border border-green-100">
                <div className="flex flex-col gap-1">
                  <div className="w-3 h-3 rounded-full bg-[#10B981]"></div>
                  <div className="w-3 h-3 rounded-full bg-gray-200"></div>
                </div>
                <div>
                  <div className="font-bold text-[#10B981]">Nivel Excelente</div>
                  <div className="text-xs text-[#6B7280] mt-1">Tu vídeo supera al 85% de creadores en tu nicho.</div>
                </div>
              </div>
            </section>

            {/* Planning Card */}
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h4 className="font-bold mb-3">Planificación Rápida</h4>
              <ul className="text-sm text-[#6B7280] space-y-3">
                <li className="flex gap-2">✨ Publica 3 veces por semana.</li>
                <li className="flex gap-2">📱 Optimizado para Instagram Reels.</li>
                <li className="flex gap-2">🎯 Objetivo: Generar interacción.</li>
              </ul>
            </section>
          </aside>
        </div>
      </div>

      <ChatbotExample />
    </main>
  );
}

function RecommendationCard({ rec }: { rec: Recommendation }) {
  const priorityStyle =
    rec.priority === 'high' ? 'bg-[#EF4444] text-white' : 'bg-[#F59E0B] text-white';

  return (
    <div className="p-4 rounded-xl border border-gray-50 bg-[#F9FAFB] flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#7C4DFF1A] text-[#7C4DFF] flex items-center justify-center font-bold text-lg">💡</div>
          <div className="text-sm">
            <div className="font-bold text-[#111827] leading-tight">{rec.title}</div>
          </div>
        </div>
      </div>
      <div className="text-xs text-[#6B7280] leading-relaxed">{rec.description}</div>
      <div className="flex items-center justify-between mt-1">
        <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase ${priorityStyle}`}>
          {rec.priority === 'high' ? 'Prioridad Alta' : 'Media'}
        </span>
        <button className="text-xs font-bold text-[#7C4DFF] hover:underline">Ver más</button>
      </div>
    </div>
  );
}

function ChatbotExample() {
  const [open, setOpen] = useState(false);
  
  return (
    <>
      {/* Floating Button for Chat */}
      <button 
        onClick={() => setOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-[#7C4DFF] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-105 transition-transform z-40"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-6">
          <div className="w-full max-w-[500px] h-[600px] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col scale-in-center">
            <div className="bg-[#0f1724] text-white px-6 py-4 flex items-center justify-between">
              <div className="font-bold">Asistente de Optimización</div>
              <button onClick={() => setOpen(false)} className="text-white opacity-60 hover:opacity-100 text-xl">✕</button>
            </div>
            <div className="p-6 flex-1 overflow-auto bg-gray-50 space-y-4">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 text-sm leading-relaxed max-w-[85%]">
                He analizado tu vídeo y el gancho inicial es algo débil. ¿Te gustaría que te proponga 3 alternativas basadas en tendencias de TikTok?
              </div>
            </div>
            <div className="p-4 bg-white border-t flex gap-2">
              <input type="text" placeholder="Pregúntale a la IA..." className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7C4DFF]" />
              <button className="bg-[#7C4DFF] text-white px-4 py-2 rounded-full font-bold text-sm">Enviar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}