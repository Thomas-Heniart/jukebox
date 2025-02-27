import { Database, RunResult } from "sqlite3";

export const openSqliteConnexion = () =>
  new Promise<Database>((resolve, reject) => {
    const db = new Database("./database/db.sqlite", (err) => {
      if (err) return reject(err);
      db.run(
        "CREATE TABLE IF NOT EXISTS access_tokens (client_id TEXT PRIMARY KEY, access_token TEXT, expires_at INTEGER)",
        (_: RunResult, error: Error | null) => {
          if (error) return reject(error);
          resolve(db);
        },
      );
    });
  });
