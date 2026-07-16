// next.config.js
/**
 * Vercel configuration for the Score Analyze Next.js app.
 * Ensures Prisma native modules are treated as external so they can run in the Vercel serverless environment.
 */
module.exports = {
  reactStrictMode: true,
  // Provide an empty Turbopack config to silence the default Turbopack/webpack conflict in Next 16.
  turbopack: {},
  // Ensure Prisma's native bindings are not bundled, they are required at runtime.
  webpack: (config) => {
    config.externals = {
      ...config.externals,
      prisma: "commonjs prisma",
      "@prisma/client": "commonjs @prisma/client",
    };
    return config;
  },
};
