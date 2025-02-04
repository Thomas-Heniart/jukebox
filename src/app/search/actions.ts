"use server";

import { TrackResultVM } from "@/app/search/typing";
import { jukebox } from "@/app/config/config";
import { redirect } from "next/navigation";

export const searchAction = async (query: string): Promise<TrackResultVM[]> => {
  return jukebox().search(query);
};

export const queueTrack = async (track: TrackResultVM) => {
  await jukebox().addTrackToQueue(track);
  redirect("/tracks-queue");
};
