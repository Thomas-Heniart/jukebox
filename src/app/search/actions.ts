"use server";

import { jukebox } from "@/shared-kernel/configuration/di";
import { redirect } from "next/navigation";
import { TrackResultVM } from "@/jukebox-context/view-models/trackResultVM";

export const searchAction = async (query: string): Promise<TrackResultVM[]> => {
  return jukebox().search(query);
};

export const queueTrack = async (track: TrackResultVM) => {
  await jukebox().addTrackToQueue(track);
  redirect("/tracks-queue");
};
