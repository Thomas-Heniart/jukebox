"use server";

import { FakePlaylistRepository, PlaylistVM } from "@/app/playlists/typing";
import {
  spotifyPlaylists,
  spotifyResumePlaylist,
} from "@/app/api/spotify/spotifyApi";
import { appContainer } from "@/app/config/config";
import { redirect } from "next/navigation";

export const getPlaylists = async (): Promise<Array<PlaylistVM>> => {
  return spotifyPlaylists();
};

export const selectPlaylist = async (playlist: PlaylistVM) => {
  appContainer().resolve<FakePlaylistRepository>(
    "currentPlaylist",
  ).currentPlaylist = playlist;
  const deviceId = appContainer().resolve<string>("deviceId");
  await spotifyResumePlaylist(deviceId, `spotify:playlist:${playlist.id}`);
  return redirect("/tracks-queue");
};
