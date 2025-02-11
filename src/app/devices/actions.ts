"use server";

import { redirect } from "next/navigation";
import { appContainer, jukebox } from "@/shared-kernel/configuration/di";

export const getDevices = async () => {
  appContainer().resolve<() => void>("test")();
  return jukebox().availableDevices();
};

export const selectDevice = async (id: string, name: string) => {
  jukebox().chooseDevice({ id, name });
  return redirect("/playlists");
};
