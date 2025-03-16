import type { NextConfig } from "next";

// Define Next.js configuration
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https", // Only allow secure (HTTPS) image sources
        hostname: "image.mux.com", // Allow images from Mux (used for video thumbnails and previews)
      },
    ],
  },
};

export default nextConfig;
