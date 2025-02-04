import getConfig from "next/config";
import { DependencyContainer } from "@/shared-kernel/configuration/dependency-container/dependencyContainer";
import { SpotifyJukebox } from "@/jukebox-context/spotifyJukebox";

export const appContainer = () => {
  const { serverRuntimeConfig } = getConfig();
  return serverRuntimeConfig.dependencyContainer as DependencyContainer;
};

export const jukebox = () => appContainer().resolve<SpotifyJukebox>("jukebox");
