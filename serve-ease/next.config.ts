import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Explicitly scope tracing to this app to avoid lockfile root inference warnings.
  outputFileTracingRoot: path.resolve(process.cwd()),
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      "react-router": path.resolve(process.cwd(), "src/lib/react-router-compat.tsx"),
    };

    return config;
  },
};

export default nextConfig;
