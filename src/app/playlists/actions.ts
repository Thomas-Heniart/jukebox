"use server";

import { jukebox } from "@/shared-kernel/configuration/di";
import { redirect } from "next/navigation";
import { PlaylistVM } from "@/jukebox-context/view-models/playlistVM";

export const getPlaylists = async (): Promise<Array<PlaylistVM>> => {
  return jukebox().availablePlaylists();
};

export const selectPlaylist = async (playlist: PlaylistVM) => {
  await jukebox().startPlaylist(playlist);
  return redirect("/tracks-queue");
};
