import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fix: explicitly set the tracing root so Next doesn't infer the workspace root
  // and show the "inferred your workspace root" warning when multiple lockfiles exist.
  outputFileTracingRoot: path.resolve(__dirname),
};

export default nextConfig;
