/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Baseline hardening per docs/SECURITY.md §8 (CSP deferred to Phase 4).
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "geolocation=(self)" },
        ],
      },
    ];
  },
};

export default nextConfig;
