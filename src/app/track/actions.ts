"use server";

import {
  playSpotifyTrack,
  queueSpotifyTrack,
  spotifyTrackState,
} from "@/app/api/spotifyApi";
import { appContainer } from "@/app/config/config";

export const playTrack = async (uri: string) => {
  const deviceId = appContainer().resolve<string>("deviceId");
  await playSpotifyTrack(uri, deviceId);
};

export const queueTrack = async (uri: string) => {
  const deviceId = appContainer().resolve<string>("deviceId");
  await queueSpotifyTrack(uri, deviceId);
};

export const trackState = async () => {
  const state = await spotifyTrackState();
  console.log(state);
};
