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
  webpack: (config, { nextRuntime }) => {
    if (nextRuntime !== "nodejs") {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { IgnorePlugin } = require("webpack");
      const ignoreNodes = new IgnorePlugin({ resourceRegExp: /node:.*/ });
      config.plugins.push(ignoreNodes);
    }
    return config;
  },
};

export default nextConfig;
