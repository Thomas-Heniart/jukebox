"use server";

import { TrackResultVM } from "@/app/search/typing";
import { queueSpotifyTrack, searchTracks } from "@/app/api/spotifyApi";
import { appContainer } from "@/app/config/config";
import { redirect } from "next/navigation";

export const searchAction = async (query: string): Promise<TrackResultVM[]> => {
  if (!query) return [];
  return searchTracks(query);
};

export const queueTrack = async (uri: string) => {
  const deviceId = appContainer().resolve<string>("deviceId");
  await queueSpotifyTrack(uri, deviceId);
  redirect("/tracks-queue");
};
