// next.config.ts
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    dangerouslyAllowSVG: true, // This is the flag
    contentDispositionType: "attachment", // Recommended when dangerouslyAllowSVG is true
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;", // Recommended when dangerouslyAllowSVG is true
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  // ... other configurations
};

export default nextConfig;
