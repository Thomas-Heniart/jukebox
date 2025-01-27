"use server";

import { TrackResultVM } from "@/app/search/typing";
import { searchTracks } from "@/app/api/spotifyApi";

export const searchAction = async (query: string): Promise<TrackResultVM[]> => {
  if (!query) return [];
  return searchTracks(query);
};
