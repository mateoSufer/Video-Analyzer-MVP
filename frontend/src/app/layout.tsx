import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Video Audit PRO",
  description: "Analyze your videos with AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="bg-[#F7F7F7] antialiased">
        {/* Header Fixed - Ahora con estética Morada Pro */}
        <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-100 z-50 flex items-center px-6">
          <div className="max-w-[1400px] mx-auto w-full flex items-center">
            {/* Logo actualizado al color corporativo morado */}
            <h1 className="text-xl font-black tracking-tight text-[#111827] uppercase">
              Video Audit <span className="text-[#7C4DFF]">Pro</span>
            </h1>
          </div>
        </header>
        
        {/* - pt-16: Para que el contenido empiece justo debajo del header.
            - min-h-screen: Fondo consistente en toda la app.
        */}
        <div className="pt-16 min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}