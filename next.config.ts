import type { NextConfig } from "next";

const supabaseHostname = (() => {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    "";

  try {
    if (typeof url === "string" && url.startsWith("http")) {
      return new URL(url).hostname;
    }
  } catch {
    // ignore
  }

  return null;
})();

const supabaseHosts = Array.from(
  new Set(
    [
      "sjbwgvvnwhqharmpbmun.supabase.co",
      supabaseHostname,
    ].filter((value): value is string => Boolean(value))
  )
);

const securityHeaders = [
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "img-src 'self' data: https:",
      "media-src 'self' https:",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self' data:",
      "connect-src 'self' https:",
      "frame-ancestors 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: supabaseHosts.map((hostname) => ({
      protocol: "https",
      hostname,
      pathname: "/storage/v1/object/public/**",
    })),
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
