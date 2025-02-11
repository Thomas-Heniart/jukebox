import { DependencyContainer } from "@/shared-kernel/configuration/dependency-container/dependencyContainer";
import { SpotifyJukebox } from "@/jukebox-context/spotifyJukebox";
import { appContainer } from "@/shared-kernel/configuration/di";

export const configureDependencies = async () => {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    (globalThis as Record<string, unknown>)["dependencyContainer"] =
      new DependencyContainer().register({
        id: "jukebox",
        factory: () => new SpotifyJukebox(),
      });
    const fs = await import("node:fs");
    appContainer().register({
      id: "test",
      factory: () => () => {
        console.log(fs.existsSync("src/app/api/auth/spotify/login/route.ts"));
      },
    });
  }
};
