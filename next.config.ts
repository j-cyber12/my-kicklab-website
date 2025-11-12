import webpack, { type Compilation, type Compiler } from "webpack";
import type { Configuration, WebpackPluginInstance } from "webpack";
import type { NextConfig } from "next";

type WebpackContext = {
  isServer?: boolean;
  webpack?: typeof webpack;
};

class CopyServerChunksPlugin implements WebpackPluginInstance {
  apply(compiler: Compiler) {
    compiler.hooks.thisCompilation.tap("CopyServerChunksPlugin", (compilation: Compilation) => {
      const stage = webpack.Compilation ? webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL : 0;
      compilation.hooks.processAssets.tap(
        { name: "CopyServerChunksPlugin", stage },
        (assets) => {
          Object.keys(assets).forEach((filename) => {
            if (filename.startsWith("chunks/") && /\.(js|mjs)$/.test(filename)) {
              const base = filename.substring(filename.lastIndexOf("/") + 1);
              if (!assets[base]) {
                const source = assets[filename];
                compilation.emitAsset(base, source);
              }
            }
          });
        },
      );
    });
  }
}

const nextConfig = {
  reactStrictMode: false,
  // Ensure each production build has a unique build ID to avoid stale runtime references
  generateBuildId: async () => `${Date.now()}`,
  // Use a fresh dist dir to avoid stale runtime/chunk references on Windows
  distDir: '.next-kicklab',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  // Reduce chances of stale file system caches in dev
  webpack: (config: Configuration, ctx: WebpackContext) => {
    // Force in-memory cache to avoid lingering FS cache issues
    // and reduce chunk-id mismatches after restarts on Windows
    config.cache = false;
    // Ensure server chunks are emitted under server/chunks and resolved accordingly
    if (ctx.isServer) {
      // Align runtime's chunk URL helper with actual location of chunk files
      config.output = config.output || {};
      // Place server chunks next to runtime for relative requires in all modes
      config.output.chunkFilename = '[id].js';
      config.output.hotUpdateChunkFilename = '[id].hot-update.js';
      // Avoid server async chunking to prevent relative require() issues
      config.optimization = config.optimization || {};
      config.optimization.splitChunks = false;
      config.optimization.runtimeChunk = false;

      // Ensure server can require './<id>.js' by also emitting chunk copies at root
      config.plugins = config.plugins || [];
      config.plugins.push(new CopyServerChunksPlugin());
    }
    return config;
  },
  // Whitelist LAN dev origins to silence dev warnings and future‑proof
  allowedDevOrigins: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://192.168.56.1:3000',
    'http://192.168.0.118:3000',
  ],
};

export default nextConfig satisfies NextConfig & { allowedDevOrigins: string[] };
