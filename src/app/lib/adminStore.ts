type ClientId = string;
type UserId = string;

export class AdminStore {
  private readonly _store: Record<ClientId, Record<UserId, boolean>> = {};

  constructor(private readonly _passwords: Record<ClientId, string>) {}

  isLoggedIn(clientId: ClientId, userId: UserId) {
    return this._store[clientId]?.[userId] ?? false;
  }

  login(clientId: ClientId, userId: UserId, password: string) {
    if (this._passwords[clientId] !== password) return;
    this._store[clientId] = this._store[clientId] || {};
    this._store[clientId][userId] = true;
  }
}
