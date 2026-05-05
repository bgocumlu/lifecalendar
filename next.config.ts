import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/wallpaper": ["./node_modules/text-to-svg/fonts/ipag.ttf"],
  },
};

export default nextConfig;
