/** @type {import('next').NextConfig} */
const nextConfig = {
  /* Configuración opcional pero recomendada para evitar líos con el backend */
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/:path*', // Redirige llamadas al backend de Python
      },
    ];
  },
};

module.exports = nextConfig;