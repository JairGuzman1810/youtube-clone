import type { NextConfig } from "next";

// Define Next.js configuration settings
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https", // Only allow images from secure (HTTPS) sources
        hostname: "image.mux.com", // Enable loading images from Mux (used for video thumbnails and previews)
      },
      {
        protocol: "https", // Only allow images from secure (HTTPS) sources
        hostname: "utfs.io", // Enable loading images from utfs.io (a common file-sharing service)
      },
    ],
  },
};

export default nextConfig;
