"use server";

import { PlayingTrack, QueuedTrack } from "@/app/tracks-queue/typing";
import { spotifyCurrentTrack, spotifyQueuedTracks } from "@/app/api/spotifyApi";

export const queuedTracks = async (): Promise<QueuedTrack[]> => {
  const tracks = await spotifyQueuedTracks();
  return tracks;
};

export const getCurrentTrack = async (): Promise<PlayingTrack | null> => {
  return spotifyCurrentTrack();
};
