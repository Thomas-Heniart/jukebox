"use server";

import { SimplifiedArtist, SpotifyApi, Track } from "@spotify/web-api-ts-sdk";
import { TrackResultVM } from "@/app/search/typing";
import { DeviceVM } from "@/app/devices/typing";
import { PlayingTrack, QueuedTrack } from "@/app/tracks-queue/typing";

const sdk = () => {
  if (!process.env.SPOTIFY_ACCESS_TOKEN)
    throw new Error("Spotify API not initialized");
  const sdk = SpotifyApi.withAccessToken(
    process.env.SPOTIFY_CLIENT_ID!,
    JSON.parse(process.env.SPOTIFY_ACCESS_TOKEN),
  );
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

export const queueSpotifyTrack = async (trackUri: string, deviceId: string) => {
  try {
    await sdk().player.addItemToPlaybackQueue(trackUri, deviceId);
  } catch (e) {
    console.error(e);
  }
};

export const spotifyQueuedTracks = async (): Promise<QueuedTrack[]> => {
  const queue = await sdk().player.getUsersQueue();
  return queue.queue.map((item) => {
    const track = item as Track;
    return {
      id: track.id,
      title: track.name,
      artist: track.artists!.map((a: SimplifiedArtist) => a.name).join(", "),
      imageUri: track.album.images[0].url,
      votes: 0,
      voteStatus: "NONE",
    };
  });
};

export const spotifyCurrentTrack = async (): Promise<PlayingTrack | null> => {
  const track = await sdk().player.getCurrentlyPlayingTrack();
  const item = track.item as Track;
  return {
    title: track.item.name,
    artist: item.artists.map((a) => a.name).join(", "),
    imageUri: item.album.images[0].url,
    progress: track.progress_ms,
    duration: track.item.duration_ms,
  };
};
