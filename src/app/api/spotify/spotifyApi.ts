"use server";

import { SimplifiedArtist, SpotifyApi, Track } from "@spotify/web-api-ts-sdk";
import { TrackResultVM } from "@/app/search/typing";
import { DeviceVM } from "@/app/devices/typing";
import { PlayingTrack, QueuedTrack } from "@/app/tracks-queue/typing";
import { updatePlaylistItems } from "@/app/api/spotify/lib";

const sdk = () => {
  if (!process.env.SPOTIFY_ACCESS_TOKEN)
    throw new Error("Spotify API not initialized");
  return SpotifyApi.withAccessToken(
    process.env.SPOTIFY_CLIENT_ID!,
    JSON.parse(process.env.SPOTIFY_ACCESS_TOKEN),
  );
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
    await sdk().playlists.addItemsToPlaylist("5NHWlEuV0IHG0Nr4U82YPl", [
      trackUri,
    ]);
  } catch (e) {
    console.error(e);
  }
};

export const spotifyQueuedTracks = async (): Promise<QueuedTrack[]> => {
  const currentTrack = await sdk().player.getCurrentlyPlayingTrack();
  const queue = await sdk().player.getUsersQueue();
  return queue.queue
    .map<QueuedTrack>((item) => {
      const track = item as Track;
      return {
        id: track.id,
        title: track.name,
        artist: track.artists!.map((a: SimplifiedArtist) => a.name).join(", "),
        imageUri: track.album.images[0].url,
        votes: 0,
        voteStatus: "NONE",
      };
    })
    .reduce((acc, track) => {
      if (
        acc.find((t) => t.id === track.id) ||
        track.id === currentTrack.item.id
      )
        return acc;
      return [...acc, track];
    }, new Array<QueuedTrack>());
};

export const spotifyPlaylist = async (): Promise<string[]> => {
  const items = await sdk().playlists.getPlaylistItems(
    "5NHWlEuV0IHG0Nr4U82YPl",
    "BB",
    undefined,
    50,
    0,
  );
  //@TODO handle more than 50 items
  return items.items.map((item) => item.track.id);
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

export const spotifyResumePlaylist = async (
  deviceId: string,
  playlistUri: string,
) => {
  await sdk().player.startResumePlayback(deviceId, playlistUri);
  try {
    await sdk().player.setRepeatMode("context");
  } catch (e) {
    console.error(e);
  }
};

export const updateSpotifyPlaylist = async (
  votes: Array<{ id: string; votes: number }>,
) => {
  const track = await sdk().player.getCurrentlyPlayingTrack();
  const updatedItems = updatePlaylistItems(votes, track.item.id);
  console.log(updatedItems);
  await sdk().playlists.updatePlaylistItems("5NHWlEuV0IHG0Nr4U82YPl", {
    uris: updatedItems.map((item) => `spotify:track:${item}`),
  });
};
