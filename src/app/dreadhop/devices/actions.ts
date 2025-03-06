"use server";

import { redirect } from "next/navigation";
import { jukebox } from "@/shared-kernel/configuration/di";

export const getDevices = async () => {
  return (await jukebox()).availableDevices();
};

export const selectDevice = async (id: string, name: string) => {
  (await jukebox()).chooseDevice({ id, name });
  return redirect("/dreadhop/playlists");
};
