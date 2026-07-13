/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' }
    ]
  },
  output: 'standalone',
  // Proxy /api từ frontend sang gateway trong mạng Docker — nhờ vậy chỉ cần
  // expose 1 cổng 3000 là chạy được cả qua tunnel/LAN/localhost
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.API_PROXY_TARGET || 'http://gateway-service:8080'}/api/:path*`,
      },
    ];
  },
};
module.exports = nextConfig;
