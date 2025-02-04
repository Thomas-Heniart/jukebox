import {
  AccessToken,
  SimplifiedArtist,
  SpotifyApi,
  Track as SpotifyTrack,
} from "@spotify/web-api-ts-sdk";
import { randomUUID } from "node:crypto";
import { DeviceVM } from "@/app/devices/typing";
import { PlaylistVM } from "@/app/playlists/typing";
import { CurrentTrackVM, QueuedTrackVM } from "@/app/tracks-queue/typing";
import { TrackResultVM } from "@/app/search/typing";

export class SpotifyJukebox {
  private readonly _id: string = randomUUID();
  private sdk: SpotifyApi | null = null;
  private accessToken: AccessToken | null = null;
  private device: Device | null = null;
  private currentTrack: Track | null = null;
  private tracksQueue: TracksQueue | null = null;

  private queueInterval: NodeJS.Timeout | null = null;

  authenticateWith(accessToken: AccessToken) {
    this.accessToken = accessToken;
    this.sdk = SpotifyApi.withAccessToken(
      process.env.SPOTIFY_CLIENT_ID!,
      accessToken,
    );
    //@TODO clean previous refresh interval and create a new one
  }

  async availableDevices(): Promise<Array<DeviceVM>> {
    const items = await this.sdk!.player.getAvailableDevices();
    return items.devices
      .filter((d) => !!d.id)
      .map((d) => ({
        id: d.id!,
        name: d.name,
        type: d.type,
      }));
  }

  chooseDevice({ id, name }: { id: string; name: string }): void {
    this.device = new Device(id, name);
  }

  async availablePlaylists(): Promise<Array<PlaylistVM>> {
    const userId = (await this.sdk!.currentUser.profile()).id;
    //@TODO handle pagination
    const page = await this.sdk!.playlists.getUsersPlaylists(userId);
    return page.items.map((item) => ({
      id: item.id,
      name: item.name,
      coverUri:
        item.images && item.images.length
          ? item.images[0].url
          : "/playlist-placeholder.png",
    }));
  }

  async startPlaylist(playlist: PlaylistVM): Promise<void> {
    const tracks = await this.tracksOf(playlist.id);
    this.tracksQueue = new TracksQueue(
      new Playlist(playlist.id, playlist.name, playlist.coverUri),
      tracks,
    );
    this.currentTrack = tracks[0];
    await this.sdk!.player.startResumePlayback(
      this.device!.id,
      `spotify:playlist:${playlist.id}`,
    );
    this.refreshQueueInterval();
    //@TODO clear previous interval and create a new one to keep track of the current track and queue
  }

  queue(voterId: string): QueuedTrackVM[] {
    if (!this.tracksQueue) return [];
    return this.tracksQueue.sortedByVotes(voterId);
  }

  currentTrackVM(): CurrentTrackVM {
    return {
      id: this.currentTrack!.id,
      title: this.currentTrack!.title,
      artist: this.currentTrack!.artist,
      imageUri: this.currentTrack!.imageUri,
      progress: this.currentTrack!.progress,
      duration: this.currentTrack!.duration,
    };
  }

  vote({
    trackId,
    vote,
    voterId,
  }: {
    trackId: string;
    vote: VoteStatus;
    voterId: string;
  }): void {
    this.tracksQueue!.vote({ trackId, vote, voterId });
  }

  async search(query: string): Promise<TrackResultVM[]> {
    if (!query) return [];
    const items = await this.sdk!.search(query, ["track"]);
    return items.tracks?.items.map((item) => ({
      id: item.id,
      uri: item.uri,
      title: item.name,
      artist: item.artists.map((artist) => artist.name).join(", "),
      imageUri: item.album.images[0].url,
      duration: item.duration_ms,
    }));
  }

  async addTrackToQueue({
    id,
    title,
    artist,
    imageUri,
    duration,
  }: TrackResultVM): Promise<void> {
    await this.sdk!.playlists.addItemsToPlaylist(
      this.tracksQueue!.playlist.id,
      [`spotify:track:${id}`],
    );
    this.tracksQueue!.addTrack({
      id,
      title,
      artist,
      imageUri,
      duration,
    });
  }

  private async tracksOf(playlistId: string): Promise<Track[]> {
    //@TODO handle pagination
    const page = await this.sdk!.playlists.getPlaylistItems(playlistId);
    return page.items.map(
      (item) =>
        new Track(
          item.track.id,
          item.track.name,
          joinArtists(item.track.artists),
          item.track.album.images[0].url,
          0,
          item.track.duration_ms,
        ),
    );
  }

  private refreshQueueInterval() {
    if (this.queueInterval) clearInterval(this.queueInterval);
    this.queueInterval = setInterval(async () => {
      const tracks = await this.tracksOf(this.tracksQueue!.playlist.id);
      this.tracksQueue!.setTracks(tracks);
      const playback = await this.sdk!.player.getCurrentlyPlayingTrack();
      const track = playback.item as SpotifyTrack;
      if (track.id === this.currentTrack!.id)
        return this.currentTrack!.setProgress(playback.progress_ms);
      this.currentTrack = new Track(
        track.id,
        track.name,
        joinArtists(track.artists),
        track.album.images[0].url,
        playback.progress_ms,
        track.duration_ms,
      );
      //@TODO timeout to update the queue
    }, 2000);
  }
}

const joinArtists = (artists: SimplifiedArtist[]): string =>
  artists.map((a) => a.name).join(", ");

export class Device {
  constructor(
    public readonly id: string,
    public readonly name: string,
  ) {}
}

export class Playlist {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly coverUri: string,
  ) {}
}

export class Track {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly artist: string,
    public readonly imageUri: string,
    private _progress: number,
    public readonly duration: number,
  ) {}

  setProgress(progress: number) {
    this._progress = progress;
  }

  get progress(): number {
    return this._progress;
  }
}

export type VoteStatus = "UP" | "DOWN";

export class TracksQueue {
  private readonly _votes: {
    [trackId: Track["id"]]: {
      [voterId: string]: VoteStatus;
    };
  } = {};

  constructor(
    public readonly playlist: Playlist,
    private tracks: Track[],
  ) {}

  sortedByVotes(voterId: string): Array<QueuedTrackVM> {
    return this.tracks
      .map<QueuedTrackVM>((track) => ({
        id: track.id,
        imageUri: track.imageUri,
        title: track.title,
        artist: track.artist,
        voteStatus: this.voteStatusOf(track.id, voterId),
        votes: this.votesOf(track.id),
      }))
      .toSorted((a, b) => b.votes - a.votes);
  }

  vote({
    trackId,
    vote,
    voterId,
  }: {
    trackId: string;
    vote: VoteStatus;
    voterId: string;
  }) {
    this._votes[trackId] = this._votes[trackId] || {};
    this._votes[trackId][voterId] = vote;
  }

  addTrack({ id, title, artist, imageUri, duration }: TrackResultVM) {
    this.tracks.push(new Track(id, title, artist, imageUri, 0, duration));
  }

  setTracks(tracks: Track[]) {
    this.tracks = tracks;
  }

  private voteStatusOf(
    trackId: Track["id"],
    voterId: string,
  ): VoteStatus | "NONE" {
    return this._votes[trackId]?.[voterId] || "NONE";
  }

  private votesOf(trackId: Track["id"]): number {
    return Object.values(this._votes[trackId] || {}).reduce((acc, vote) => {
      return vote === "UP" ? acc + 1 : acc - 1;
    }, 0);
  }
}
