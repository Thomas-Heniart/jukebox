"use server";

import {
  listDevices,
  spotifyResumePlaylist,
} from "@/app/api/spotify/spotifyApi";
import { redirect } from "next/navigation";
import { appContainer } from "@/app/config/config";

export const getDevices = async () => {
  return listDevices();
};

export const selectDevice = async (id: string) => {
  appContainer().register({
    id: "deviceId",
    factory: () => id,
  });
  await spotifyResumePlaylist(id, "spotify:playlist:5NHWlEuV0IHG0Nr4U82YPl");
  return redirect("/tracks-queue");
};
