// Using untyped config to allow upcoming keys like `allowedDevOrigins` without TS errors.
const nextConfig = {
  reactStrictMode: false,
  // Ensure each production build has a unique build ID to avoid stale runtime references
  generateBuildId: async () => `${Date.now()}`,
  // Use a fresh dist dir to avoid stale runtime/chunk references on Windows
  distDir: '.next-kicklab',
  // Reduce chances of stale file system caches in dev
  webpack: (config: any, ctx: any) => {
    // Force in-memory cache to avoid lingering FS cache issues
    // and reduce chunk-id mismatches after restarts on Windows
    config.cache = false;
    return config;
  },
  // Whitelist LAN dev origins to silence dev warnings and future‑proof
  allowedDevOrigins: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://192.168.56.1:3000',
    'http://192.168.0.118:3000',
  ],
} as any;

export default nextConfig;
