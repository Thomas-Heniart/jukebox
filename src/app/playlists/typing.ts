export type PlaylistVM = {
  id: string;
  name: string;
  coverUri: string;
};

export class FakePlaylistRepository {
  public currentPlaylist: PlaylistVM | null = null;
}
