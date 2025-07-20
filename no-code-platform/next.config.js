/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    serverActions: true,
  },
  webpack: (config) => {
    // Handle monaco-editor
    config.module.rules.push({
      test: /\.ttf$/,
      type: 'asset/resource',
    });
    return config;
  },
  transpilePackages: ['monaco-editor'],
}

module.exports = nextConfig