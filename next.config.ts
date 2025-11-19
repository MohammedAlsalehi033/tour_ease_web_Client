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
        hostname: 'tour-ease.s3.ap-south-1.amazonaws.com'
        // Removed pathname restriction to allow all paths
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com'
      },
      {
        protocol: 'https',
        hostname: 'places.googleapis.com'
      },
      {
        protocol: 'https',
        hostname: 'api.tourease.me'
      },
      {
        protocol: 'https',
        hostname: 'example.com'
      },
      {
        protocol: 'https',
        hostname: 'api.mapbox.com'
      }
    ]
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
