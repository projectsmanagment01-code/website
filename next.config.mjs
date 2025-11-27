// Note: Error handlers are initialized in server startup files
// Importing TS files in next.config.mjs causes production build issues
// Error handlers are loaded via:
// - server/index.ts (Express server)
// - instrumentation.ts (Next.js runtime - if needed)

// Remove static import of 'path' and use dynamic import in webpack function
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Build optimizations (swcMinify is default in Next.js 15)
  poweredByHeader: false,

  // Compression and performance
  compress: true,
  generateEtags: true,

  // ESLint and TypeScript settings
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // Simplified and Fast Image Configuration
  images: {
    unoptimized: false,
    formats: ["image/avif", "image/webp"], // AVIF first for best compression, WebP fallback
    deviceSizes: [640, 1280, 1920], // Fewer breakpoints for faster processing
    imageSizes: [32, 64, 128, 256], // Minimal icon sizes
    minimumCacheTTL: 86400, // 24 hours cache (reduced from 1 year)
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Use simplified custom loader
    loader: "custom",
    loaderFile: "./image-loader.js",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ext.same-assets.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "c.animaapp.com",
        port: "",
        pathname: "/**",
      },
    ],
  },

  // Experimental features for better performance
  experimental: {
    webpackMemoryOptimizations: true,
  },

  // Compiler options
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: "/api/uploads/:path*", // forward to an API route
      },
    ];
  },

  // Headers for security and performance
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
      // REMOVED: Global API caching - causes admin dashboard to show stale data
      // Admin routes now use route-specific no-cache headers
      // {
      //   source: "/api/:path*",
      //   headers: [
      //     {
      //       key: "Cache-Control",
      //       value: "public, s-maxage=60, stale-while-revalidate=30",
      //     },
      //   ],
      // },
      {
        source: "/(.*\\.(?:jpg|jpeg|png|webp|avif|svg|gif))",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  // URL rewrites

  // Conditionally set output based on environment
  ...(process.env.NODE_ENV === "production" &&
  process.env.STATIC_EXPORT === "true"
    ? {
        output: "export",
        trailingSlash: true,
        images: {
          unoptimized: true, // Required for static export
        },
      }
    : {}),
};

export default nextConfig;
