"use server";

import { redirect } from "next/navigation";
import { jukebox } from "@/app/config/config";

export const getDevices = async () => {
  return jukebox().availableDevices();
};

export const selectDevice = async (id: string, name: string) => {
  jukebox().chooseDevice({ id, name });
  return redirect("/playlists");
};
