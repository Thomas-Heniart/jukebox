"use server";

import { FakePlaylistRepository, PlaylistVM } from "@/app/playlists/typing";
import { appContainer, jukebox } from "@/app/config/config";
import { redirect } from "next/navigation";

export const getPlaylists = async (): Promise<Array<PlaylistVM>> => {
  return jukebox().availablePlaylists();
};

export const selectPlaylist = async (playlist: PlaylistVM) => {
  appContainer().resolve<FakePlaylistRepository>(
    "currentPlaylist",
  ).currentPlaylist = playlist;
  await jukebox().startPlaylist(playlist);
  return redirect("/tracks-queue");
};
