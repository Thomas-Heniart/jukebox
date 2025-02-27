import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "i.scdn.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "mosaic.scdn.co",
        pathname: "/**",
      },
    ],
  },
  webpack: (config, { nextRuntime, isServer }) => {
    if (nextRuntime !== "nodejs" && isServer)
      config.plugins.push(...ignoredPlugins([/node:.*/, /fs/, /path/]));
    return config;
  },
};

const ignoredPlugins = (patterns: RegExp[]) => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { IgnorePlugin } = require("webpack");
  return patterns.map(
    (pattern) => new IgnorePlugin({ resourceRegExp: pattern }),
  );
};

export default nextConfig;
