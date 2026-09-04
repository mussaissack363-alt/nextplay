import type { NextConfig } from "next";

// Static export for GitHub Pages. The site lives under a sub-path unless a
// custom domain is configured — set NEXT_PUBLIC_BASE_PATH=/nextplay (or your
// custom-domain root "/") in the deploy environment.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH?.replace(/\/+$/, "") ?? "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "media.rawg.io",
      },
      {
        protocol: "https",
        hostname: "s4.anilist.co",
      },
      {
        protocol: "https",
        hostname: "images.anilist.co",
      },
    ],
  },
};

export default nextConfig;