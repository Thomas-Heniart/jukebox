"use server";

import { jukebox } from "@/shared-kernel/configuration/di";
import { redirect } from "next/navigation";
import { TrackResultVM } from "@/jukebox-context/view-models/trackResultVM";

export const searchAction = async (query: string): Promise<TrackResultVM[]> => {
  return (await jukebox()).search(query);
};

export const queueTrack = async (track: TrackResultVM) => {
  await (await jukebox()).addTrackToQueue(track);
  redirect("/tracks-queue");
};
