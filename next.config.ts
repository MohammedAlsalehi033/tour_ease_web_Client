import type { NextConfig } from "next";

const nextConfig: NextConfig = {
 images: {
    remotePatterns: [new URL('https://docs.material-tailwind.com/**')],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
