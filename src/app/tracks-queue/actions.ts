"use server";

import { jukebox } from "@/app/config/config";
import { getUserId } from "@/app/lib/auth";
import { QueuedTrackVM } from "@/jukebox-context/view-models/queuedTrackVM";
import { CurrentTrackVM } from "@/jukebox-context/view-models/currentTrackVM";

export const queuedTracks = async (): Promise<QueuedTrackVM[]> => {
  const userId = await getUserId();
  return jukebox().queue(userId);
};

export const getCurrentTrack = async (): Promise<CurrentTrackVM | null> => {
  return jukebox().currentTrackVM();
};

export const voteTrack = async ({
  trackId,
  vote,
}: {
  trackId: string;
  vote: "UP" | "DOWN";
}) => {
  const voterId = await getUserId();
  jukebox().vote({ trackId, vote, voterId });
};
