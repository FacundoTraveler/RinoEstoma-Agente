/** @type {import('next').NextConfig} */
const nextConfig = {
    basePath: '/agente',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
