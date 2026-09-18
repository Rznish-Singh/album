import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // `standalone` produces a self-contained server bundle for the Docker,
  // AWS App Runner / ECS and Azure Container Apps targets. Vercel ignores it.
  output: 'standalone',
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'res.cloudinary.com' }],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: { optimizePackageImports: ['maplibre-gl'] },
}

export default nextConfig
