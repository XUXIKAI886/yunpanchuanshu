/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [],
  },
  // 配置 API 路由的运行时
  experimental: {
    serverComponentsExternalPackages: ['@aws-sdk/client-s3', '@aws-sdk/s3-request-presigner']
  }
}

module.exports = nextConfig