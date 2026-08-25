/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Provider logos are pulled from many arbitrary hosts across the web, so we
  // allow any https source but still route them through next/image for
  // automatic optimization (a big Core Web Vitals win). Every <Image/> in the
  // app sets explicit width/height to keep CLS at 0.
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  // We run lint as a separate CI step (`pnpm lint`) rather than blocking the
  // production build on stylistic rules. Types are still fully checked.
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
};

export default nextConfig;
