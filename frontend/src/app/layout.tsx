import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Video Analyzer",
  description: "Analyze your videos with AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      {/* Añadimos antialiased para que la fuente se vea fina y profesional como en Visily */}
      <body className="bg-[#F7F7F7] antialiased">
        {/* Header Fixed - Altura exacta 64px (h-16) */}
        <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-100 z-50 flex items-center px-6">
          <div className="max-w-[1200px] mx-auto w-full flex items-center">
             {/* Usamos el color primary azul que definiste en tu config */}
            <h1 className="text-xl font-bold text-[#2563EB]">Video Analyzer</h1>
          </div>
        </header>
        
        {/* Contenedor de contenido:
            - pt-16: Para que el contenido empiece justo debajo del header de 64px.
            - min-h-screen: Para que el fondo gris cubra toda la pantalla.
        */}
        <div className="pt-16 min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}