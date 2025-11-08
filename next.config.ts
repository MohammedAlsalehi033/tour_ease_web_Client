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
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com'
      },
      {
        protocol: 'https',
        hostname: 'places.googleapis.com'
      }
    ]
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
