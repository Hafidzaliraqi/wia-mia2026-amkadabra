import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  // PGlite (database lokal) memuat file WebAssembly, jadi tidak dibundel
  serverExternalPackages: ["@electric-sql/pglite"],
  experimental: {
    // Batas ukuran unggahan lewat server action (foto laporan sudah diperkecil di browser)
    serverActions: { bodySizeLimit: "8mb" },
  },
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
