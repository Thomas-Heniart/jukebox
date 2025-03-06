import { DependencyContainer } from "@/shared-kernel/configuration/dependency-container/dependencyContainer";
import { SpotifyJukebox } from "@/jukebox-context/spotifyJukebox";
import { AdminStore } from "@/app/lib/adminStore";

const appContainer = () => {
  return (globalThis as Record<string, unknown>)[
    "dependencyContainer"
  ] as DependencyContainer;
};

export const jukebox = () => appContainer().resolve<SpotifyJukebox>("jukebox");

export const adminStore = () =>
  appContainer().resolve<AdminStore>("adminStore");
