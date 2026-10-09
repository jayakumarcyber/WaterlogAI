const backendUrl = process.env.BACKEND_URL || (process.env.NODE_ENV === 'production' ? '' : (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'));

const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    if (!backendUrl) {
      // In production without explicit binding, let top-level vercel.json rewrites route directly to backend service
      return [];
    }
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
