/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/agente',
  env: {
    NEXT_PUBLIC_BASE_PATH: '/agente',
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: 'https://www.rinoestoma.com',
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://www.rinoestoma.com",
          },
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL',
          },
        ],
      },
    ]
  },
}
export default nextConfig
