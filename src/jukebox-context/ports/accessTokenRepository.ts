import { Database } from "sqlite3";
import { AccessToken } from "@spotify/web-api-ts-sdk";

export interface AccessTokenRepository {
  persist(clientId: string, accessToken: AccessToken): Promise<void>;
  findByClientId(clientId: string): Promise<AccessToken | null>;
}

export class SqliteAccessTokenRepository implements AccessTokenRepository {
  constructor(
    private readonly _db: Database,
    private readonly _now: () => Date = () => new Date(),
  ) {}

  persist(clientId: string, accessToken: AccessToken): Promise<void> {
    return new Promise((resolve, reject) => {
      this._db.run(
        "INSERT INTO access_tokens (client_id, access_token, expires_at) VALUES (?, ?, ?) ON CONFLICT (client_id) DO UPDATE SET access_token = excluded.access_token, expires_at = excluded.expires_at",
        [
          clientId,
          JSON.stringify(accessToken),
          this._now().valueOf() + accessToken.expires_in * 1000,
        ],
        (error) => {
          if (error) return reject(error);
          resolve();
        },
      );
    });
  }

  findByClientId(clientId: string): Promise<AccessToken | null> {
    return new Promise((resolve, reject) => {
      this._db.get<AccessTokenRow>(
        "SELECT access_token FROM access_tokens WHERE client_id = ? AND expires_at > ?",
        [clientId, this._now().valueOf()],
        (error, row) => {
          if (error) return reject(error);
          if (!row) return resolve(null);
          resolve(JSON.parse(row.access_token));
        },
      );
    });
  }
}

type AccessTokenRow = {
  access_token: string;
};
