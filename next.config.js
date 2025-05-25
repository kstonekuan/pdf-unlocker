/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: process.env.STATIC_EXPORT === "true" ? "export" : undefined,
  trailingSlash: process.env.STATIC_EXPORT === "true",
  images: {
    unoptimized: process.env.STATIC_EXPORT === "true",
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        canvas: false,
      };
    }
    return config;
  },
  experimental: {
    esmExternals: "loose",
  },
};

module.exports = nextConfig;
