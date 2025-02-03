import type { NextConfig } from "next";
import { DependencyContainer } from "@/shared-kernel/configuration/dependency-container/dependencyContainer";
import { TrackVotes } from "@/app/tracks-queue/typing";
import { NextSongTimer } from "@/app/tracks-queue/lib";
import {
  spotifyPlaylist,
  updateSpotifyPlaylist,
} from "@/app/api/spotify/spotifyApi";

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
    dependencyContainer: new DependencyContainer()
      .register({
        id: "votes",
        factory: () => new TrackVotes(),
      })
      .register({
        id: "NextSongTimer",
        factory: (trackVotes, getPlaylist, updatePlaylist) =>
          new NextSongTimer(trackVotes, getPlaylist, updatePlaylist),
        inject: ["votes", "getPlaylist", "updatePlaylist"],
      })
      .register({
        id: "getPlaylist",
        factory: () => spotifyPlaylist,
      })
      .register({
        id: "updatePlaylist",
        factory: () => updateSpotifyPlaylist,
      }),
  },
};

export default nextConfig;
