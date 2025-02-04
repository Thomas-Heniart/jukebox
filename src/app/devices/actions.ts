"use server";

import { listDevices } from "@/app/api/spotify/spotifyApi";
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
  return redirect("/playlists");
};
