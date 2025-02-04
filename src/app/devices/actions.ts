"use server";

import { redirect } from "next/navigation";
import { appContainer, jukebox } from "@/app/config/config";

export const getDevices = async () => {
  return jukebox().availableDevices();
};

export const selectDevice = async (id: string, name: string) => {
  appContainer().register({
    id: "deviceId",
    factory: () => id,
  });
  jukebox().chooseDevice({ id, name });
  return redirect("/playlists");
};
