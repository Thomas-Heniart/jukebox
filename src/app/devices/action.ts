"use server";

import getConfig from "next/config";
import { listDevices } from "@/app/api/spotifyApi";
import { redirect } from "next/navigation";

export const getDevices = async () => {
  return listDevices();
};

export const selectDevice = async (id: string) => {
  const { serverRuntimeConfig } = getConfig();
  serverRuntimeConfig.dependencyContainer.register({
    id: "deviceId",
    factory: () => id,
  });
  return redirect("/search");
};
