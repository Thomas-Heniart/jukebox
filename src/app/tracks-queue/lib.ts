import { TrackVotes, UpdatePlaylist } from "@/app/tracks-queue/typing";

export class NextSongTimer {
  private currentTrackId: string = "";
  private currentTimeout: NodeJS.Timeout | null = null;

  constructor(
    private readonly _trackVotes: TrackVotes,
    private readonly _spotifyPlaylist: () => Promise<string[]>,
    private readonly _updateSpotifyPlaylist: UpdatePlaylist,
  ) {}

  prepareNextSong(trackId: string, progressMs: number, durationMs: number) {
    if (trackId === this.currentTrackId) return;
    this.currentTrackId = trackId;
    if (this.currentTimeout) clearTimeout(this.currentTimeout);
    this.currentTimeout = setTimeout(
      async () => {
        this._trackVotes.remove(this.currentTrackId);
        this.currentTrackId = "";
        const playlist = await this._spotifyPlaylist();
        await this._updateSpotifyPlaylist(this._trackVotes.within(playlist));
        clearTimeout(this.currentTimeout!);
      },
      durationMs - progressMs - 5000,
    );
  }
}
