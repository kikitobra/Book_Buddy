import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fix: explicitly set the tracing root so Next doesn't infer the workspace root
  outputFileTracingRoot: path.resolve(__dirname),

  // Base path for deployment (only in production)
  ...(process.env.NODE_ENV === "production" && {
    basePath: "/bookbuddy",
    assetPrefix: "/bookbuddy",
  }),

  // Make basePath available to client-side code
  env: {
    NEXT_PUBLIC_BASE_PATH:
      process.env.NODE_ENV === "production" ? "/bookbuddy" : "",
  },

  // Disable strict linting during build for production
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // ✅ Allow external book images from Google Books (and other possible sources)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "books.google.com",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "books.google.com",
        pathname: "/**",
      },
      // Optional: allow OpenLibrary or Amazon book covers
      {
        protocol: "https",
        hostname: "covers.openlibrary.org",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images-na.ssl-images-amazon.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
