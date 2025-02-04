import type { NextConfig } from "next";
import { DependencyContainer } from "@/shared-kernel/configuration/dependency-container/dependencyContainer";
import { TrackVotes } from "@/app/tracks-queue/typing";
import { NextSongTimer } from "@/app/tracks-queue/lib";
import {
  spotifyPlaylist,
  updateSpotifyPlaylist,
} from "@/app/api/spotify/spotifyApi";
import { FakePlaylistRepository } from "@/app/playlists/typing";
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
    dependencyContainer: new DependencyContainer()
      .register({
        id: "votes",
        factory: () => new TrackVotes(),
      })
      .register({
        id: "NextSongTimer",
        factory: (
          trackVotes,
          getPlaylist,
          updatePlaylist,
          playlistRepository,
        ) =>
          new NextSongTimer(
            trackVotes,
            getPlaylist,
            updatePlaylist,
            playlistRepository,
          ),
        inject: ["votes", "getPlaylist", "updatePlaylist", "currentPlaylist"],
      })
      .register({
        id: "getPlaylist",
        factory: (currentPlaylist) => spotifyPlaylist(currentPlaylist),
        inject: ["currentPlaylist"],
      })
      .register({
        id: "updatePlaylist",
        factory: () => updateSpotifyPlaylist,
      })
      .register({
        id: "currentPlaylist",
        factory: () => new FakePlaylistRepository(),
      })
      .register({
        id: "jukebox",
        factory: () => new SpotifyJukebox(),
      }),
  },
};

export default nextConfig;
