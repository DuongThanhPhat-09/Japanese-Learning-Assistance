import type { NextConfig } from "next";

/**
 * Static export: `npm run build` produces a fully self-contained `out/` folder
 * that can be served from any static file server (or `npm start`) with no
 * network access and no backend.
 */
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;
