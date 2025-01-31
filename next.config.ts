import type { NextConfig } from "next";
import { DependencyContainer } from "@/shared-kernel/configuration/dependency-container/dependencyContainer";
import { TrackVotes } from "@/app/tracks-queue/typing";

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
    ],
  },
  serverRuntimeConfig: {
    dependencyContainer: new DependencyContainer().register({
      id: "votes",
      factory: () => new TrackVotes(),
    }),
  },
  /* config options here */
};

export default nextConfig;
