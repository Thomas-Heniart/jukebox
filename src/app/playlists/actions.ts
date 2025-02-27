"use server";

import { jukebox } from "@/shared-kernel/configuration/di";
import { redirect } from "next/navigation";
import { PlaylistVM } from "@/jukebox-context/view-models/playlistVM";

export const getPlaylists = async (): Promise<Array<PlaylistVM>> => {
  return (await jukebox()).availablePlaylists();
};

export const selectPlaylist = async (playlist: PlaylistVM) => {
  await (await jukebox()).startPlaylist(playlist);
  return redirect("/tracks-queue");
};
