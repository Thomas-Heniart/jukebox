"use server";

import { CurrentTrackVM, QueuedTrackVM } from "@/app/tracks-queue/typing";
import { jukebox } from "@/app/config/config";
import { getUserId } from "@/app/lib/auth";

export const queuedTracks = async (): Promise<QueuedTrackVM[]> => {
  const userId = await getUserId();
  return jukebox().queue(userId);
};

export const getCurrentTrack = async (): Promise<CurrentTrackVM | null> => {
  return jukebox().currentTrackVM();
  // const track = await spotifyCurrentTrack();
  // if (track)
  //   appContainer()
  //     .resolve<NextSongTimer>("NextSongTimer")
  //     .prepareNextSong(track.id, track.progress, track.duration);
  // return track;
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
