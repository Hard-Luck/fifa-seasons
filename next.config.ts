import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sofifa.net',
        port: '',
        pathname: '/meta/team/**',
      },
    ],
  },
};

export default nextConfig;
