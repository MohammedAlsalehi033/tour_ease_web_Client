import type { NextConfig } from "next";

const nextConfig: NextConfig = {
 images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'docs.material-tailwind.com'
      },
      {
        protocol: 'https',
        hostname: 'tour-ease.s3.ap-south-1.amazonaws.com',
        pathname: '/uploads/**'
      }
    ]
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
