import { DependencyContainer } from "@/shared-kernel/configuration/dependency-container/dependencyContainer";
import { SpotifyJukebox } from "@/jukebox-context/spotifyJukebox";
import { appContainer } from "@/shared-kernel/configuration/di";
import * as fs from "node:fs";

export const configureDependencies = async () => {
  (globalThis as Record<string, unknown>)["dependencyContainer"] =
    new DependencyContainer().register({
      id: "jukebox",
      factory: () => new SpotifyJukebox(),
    });

  appContainer().register({
    id: "test",
    factory: () => () => {
      console.log(fs.existsSync("src/app/api/auth/spotify/login/route.ts"));
    },
  });
};
