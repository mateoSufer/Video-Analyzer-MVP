import VideoUploader from "../components/VideoUploader";

export default function Home() {
  return (
    <div className="w-full min-h-screen bg-[#F7F7F7]">
      <div className="w-full flex flex-col items-center">
        <div className="w-full max-w-[1000px] px-6 py-16 space-y-20">
          
          {/* Hero Section */}
          <div className="flex flex-col items-center text-center space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold text-[#111827] leading-tight">
              Analiza tu contenido
              <br />
              como un experto
            </h1>
            <p className="text-lg md:text-xl text-[#6B7280] max-w-[600px] leading-relaxed">
              Usa nuestra IA para evaluar el gancho, ritmo y retención de tus vídeos. Recibe recomendaciones instantáneas para mejorar tu contenido.
            </p>
            <div className="pt-4">
              <VideoUploader />
            </div>
          </div>

          {/* Benefits Section */}
          <div className="space-y-12">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-[#111827] mb-4">
                Potencia tu contenido como nunca antes
              </h2>
              <p className="text-[#6B7280] text-lg max-w-[600px] mx-auto">
                Herramientas diseñadas para creadores que quieren optimizar sus vídeos
              </p>
            </div>

            {/* Benefits Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Benefit 1 */}
              <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-sutil transition-shadow duration-300">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-[#2563EB]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[#111827] mb-3">Análisis Instantáneo</h3>
                <p className="text-[#6B7280] text-sm leading-relaxed">
                  Obtén resultados en segundos. Nuestra IA analiza gancho, ritmo y retención en tiempo real.
                </p>
              </div>

              {/* Benefit 2 */}
              <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-sutil transition-shadow duration-300">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[#111827] mb-3">Aprendizaje con Chatbot</h3>
                <p className="text-[#6B7280] text-sm leading-relaxed">
                  Pregunta a nuestro chatbot IA cómo mejorar. Recibe tips personalizados basados en tu análisis.
                </p>
              </div>

              {/* Benefit 3 */}
              <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-sutil transition-shadow duration-300">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[#111827] mb-3">Planificación Simple</h3>
                <p className="text-[#6B7280] text-sm leading-relaxed">
                  Entiende qué funciona. Planifica mejor tu próximo vídeo con datos, no intuición.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}