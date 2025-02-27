import { DependencyContainer } from "@/shared-kernel/configuration/dependency-container/dependencyContainer";
import { SpotifyJukebox } from "@/jukebox-context/spotifyJukebox";
import { openSqliteConnexion } from "@/shared-kernel/configuration/sqlite";
import { InMemoryTrackRepository } from "@/jukebox-context/adapters/secondaries/inMemoryTrackRepository";
import { Database } from "sqlite3";
import {
  AccessTokenRepository,
  SqliteAccessTokenRepository,
} from "@/jukebox-context/ports/accessTokenRepository";
import { jukebox } from "@/shared-kernel/configuration/di";

export const configureDependencies = async () => {
  const sqliteDb = await openSqliteConnexion();
  (globalThis as Record<string, unknown>)["dependencyContainer"] =
    new DependencyContainer()
      .register({
        id: "jukebox",
        inject: ["accessTokenRepository"],
        factory: async (accessTokenRepository: AccessTokenRepository) => {
          const clientId = "dreadhop";
          const jukebox = new SpotifyJukebox(
            clientId,
            new InMemoryTrackRepository(),
            accessTokenRepository,
          );
          const accessToken =
            await accessTokenRepository.findByClientId(clientId);
          if (accessToken) await jukebox.authenticateWith(accessToken);
          return jukebox;
        },
      })
      .register({
        id: "sqliteDb",
        factory: () => sqliteDb,
      })
      .register({
        id: "accessTokenRepository",
        inject: ["sqliteDb"],
        factory: (sqliteDb: Database) =>
          new SqliteAccessTokenRepository(sqliteDb),
      });
  await jukebox();
  console.log("Jukebox ready");
};
