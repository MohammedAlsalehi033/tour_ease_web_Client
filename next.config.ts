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
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com' // Google profile pictures
      },
      {
        protocol: 'https',
        hostname: 'platform-lookaside.fbsbx.com' // Facebook profile pictures
      },
      {
        protocol: 'https',
        hostname: 'graph.facebook.com' // Facebook Graph API images
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com' // GitHub avatars
      }
    ]
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
