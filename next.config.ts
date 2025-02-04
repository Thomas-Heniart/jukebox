import type { NextConfig } from "next";
import { DependencyContainer } from "@/shared-kernel/configuration/dependency-container/dependencyContainer";
import { SpotifyJukebox } from "@/jukebox-context/spotifyJukebox";

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
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
  serverRuntimeConfig: {
    dependencyContainer: new DependencyContainer().register({
      id: "jukebox",
      factory: () => new SpotifyJukebox(),
    }),
  },
};

export default nextConfig;
