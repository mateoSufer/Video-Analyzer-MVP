"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function VideoUploader() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      if (file.type.startsWith("video/")) {
        setError(null);
        uploadFile(file);
      } else {
        setError("Por favor selecciona un archivo de video válido");
      }
    }
  };

  const uploadFile = async (file: File) => {
    setLoading(true);
    setError(null);
    setVideoId(null);

    try {
      const uploadUrl = "/api/upload";
      
      console.log("📤 Iniciando subida del archivo:", file.name);
      console.log("🔗 URL de destino:", uploadUrl);

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
      });

      console.log("📨 Respuesta del servidor:", response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Archivo subido exitosamente. Video ID:", data.video_id);
      
      const uploadedVideoId = data.video_id;
      setVideoId(uploadedVideoId);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      
      // Redirigir a la página de análisis
      console.log("🔗 Redirigiendo a página de análisis para video:", uploadedVideoId);
      router.push(`/analysis/${uploadedVideoId}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido al subir el video";
      console.error("❌ Error al subir archivo:", errorMessage);
      console.error("Detalles del error:", err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileSelect}
        className="hidden"
        id="video-input"
      />
      
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={loading}
        className={`flex items-center gap-3 px-8 py-4 rounded-full font-semibold text-white text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
          loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-[#2563EB] hover:bg-[#1d4ed8] active:bg-[#1e40af]"
        }`}
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Procesando vídeo...</span>
          </>
        ) : (
          <>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span>Subir vídeo</span>
          </>
        )}
      </button>

      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl shadow-sm max-w-md">
          <p className="text-sm text-red-600 font-medium text-center">{error}</p>
        </div>
      )}

      {videoId && (
        <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl shadow-sm max-w-md">
          <div className="flex items-start space-x-3">
            <svg className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-green-800">¡Video subido exitosamente!</p>
              <p className="text-sm text-green-700 mt-1">
                ID: <code className="font-mono bg-white px-2 py-1 rounded text-green-900">{videoId}</code>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
