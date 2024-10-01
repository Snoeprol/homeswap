/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['firebasestorage.googleapis.com', 'maps.googleapis.com'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://maps.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' https://*.googleapis.com https://*.gstatic.com data:; connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com;"
          },
        ],
      },
    ];
  },
};

export default nextConfig;
