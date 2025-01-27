"use server";

import { SpotifyApi } from "@spotify/web-api-ts-sdk";
import { TrackResultVM } from "@/app/search/typing";
import { DeviceVM } from "@/app/devices/typing";

const sdk = () => {
  if (!process.env.SPOTIFY_ACCESS_TOKEN)
    throw new Error("Spotify API not initialized");
  const sdk = SpotifyApi.withAccessToken(
    process.env.SPOTIFY_CLIENT_ID!,
    JSON.parse(process.env.SPOTIFY_ACCESS_TOKEN),
  );
  console.log("Spotify API initialized");
  return sdk;
};

export const searchTracks = async (query: string): Promise<TrackResultVM[]> => {
  const items = await sdk().search(query, ["track"]);
  return items.tracks?.items.map((item) => ({
    id: item.id,
    uri: item.uri,
    title: item.name,
    artist: item.artists.map((artist) => artist.name).join(", "),
    imageUri: item.album.images[0].url,
  }));
};

export const listDevices = async (): Promise<DeviceVM[]> => {
  const items = await sdk().player.getAvailableDevices();
  return items.devices
    .filter((d) => !!d.id)
    .map((d) => ({
      id: d.id!,
      name: d.name,
      type: d.type,
    }));
};

export const playSpotifyTrack = async (trackUri: string, deviceId: string) => {
  await sdk().player.startResumePlayback(deviceId, undefined, [trackUri]);
};

export const queueSpotifyTrack = async (trackUri: string, deviceId: string) => {
  try {
    await sdk().player.addItemToPlaybackQueue(trackUri, deviceId);
  } catch (e) {
    console.error(e);
  }
};

export const spotifyTrackState = async () => {
  return sdk().player.getCurrentlyPlayingTrack();
};
