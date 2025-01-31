"use server";

import {
  PlayingTrack,
  QueuedTrack,
  TrackVotes,
} from "@/app/tracks-queue/typing";
import { spotifyCurrentTrack, spotifyQueuedTracks } from "@/app/api/spotifyApi";
import { appContainer } from "@/app/config/config";
import { getUserId } from "@/app/lib/auth";

export const queuedTracks = async (): Promise<QueuedTrack[]> => {
  const tracks = await spotifyQueuedTracks();
  const userId = await getUserId();
  const trackVotes = appContainer().resolve<TrackVotes>("votes");
  return tracks
    .map((track) => ({
      ...track,
      ...trackVotes.votesOf(track.id, userId),
    }))
    .toSorted((a, b) => b.votes - a.votes);
};

export const getCurrentTrack = async (): Promise<PlayingTrack | null> => {
  return spotifyCurrentTrack();
};

export const voteTrack = async ({
  trackId,
  vote,
}: {
  trackId: string;
  vote: "UP" | "DOWN";
}) => {
  const userId = await getUserId();
  const trackVotes = appContainer().resolve<TrackVotes>("votes");
  await trackVotes.vote({ trackId, userId, vote });
};
