import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root (a stray lockfile in $HOME otherwise misleads Turbopack).
  turbopack: {
    root: path.resolve(),
  },
  images: {
    // Cover art in Phase 1 is first-party generated SVG under /public/covers.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Admins may paste external cover image URLs (any https host).
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
