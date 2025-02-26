import {
  AccessToken,
  SimplifiedArtist,
  SpotifyApi,
  Track as SpotifyTrack,
} from "@spotify/web-api-ts-sdk";
import { Device } from "@/jukebox-context/models/device";
import { Track } from "@/jukebox-context/models/track";
import { TracksQueue } from "@/jukebox-context/models/tracksQueue";
import { PlaylistVM } from "@/jukebox-context/view-models/playlistVM";
import { DeviceVM } from "@/jukebox-context/view-models/deviceVM";
import { Playlist } from "@/jukebox-context/models/playlist";
import { QueuedTrackVM } from "@/jukebox-context/view-models/queuedTrackVM";
import { CurrentTrackVM } from "@/jukebox-context/view-models/currentTrackVM";
import { VoteStatus } from "@/jukebox-context/models/voteStatus";
import { TrackResultVM } from "@/jukebox-context/view-models/trackResultVM";
import { v4 } from "uuid";

export interface TrackRepository {
  lastPlayed(trackId: string): number;

  started(trackId: string): number;
}

export class InMemoryTrackRepository implements TrackRepository {
  private readonly lastPlayedDates: { [trackId: string]: number } = {};

  lastPlayed(trackId: string): number {
    return this.lastPlayedDates[trackId] || 0;
  }

  started(trackId: string): number {
    const now = new Date().valueOf();
    this.lastPlayedDates[trackId] = now;
    return now;
  }
}

export class SpotifyJukebox {
  private readonly _id: string = v4();
  private sdk: SpotifyApi | null = null;
  private device: Device | null = null;
  private currentTrack: Track | null = null;
  private tracksQueue: TracksQueue | null = null;

  private refreshQueueInterval: NodeJS.Timeout | null = null;
  private nextTrackTimeout: NodeJS.Timeout | null = null;
  private refreshTokenTimeout: NodeJS.Timeout | null = null;

  constructor(
    private readonly trackRepository: TrackRepository = new InMemoryTrackRepository(),
  ) {}

  clearRefreshTokenTimeout() {
    if (this.refreshTokenTimeout) clearTimeout(this.refreshTokenTimeout);
  }

  authenticateWith(accessToken: AccessToken) {
    this.sdk = SpotifyApi.withAccessToken(
      process.env.SPOTIFY_CLIENT_ID!,
      accessToken,
    );
    this.startRefreshTokenTimeout(accessToken);
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
    tracks[0].setLastPlayed(this.trackRepository.started(tracks[0].id));
    this.currentTrack = tracks[0];
    await this.sdk!.player.startResumePlayback(this.device!.id, undefined, [
      `spotify:track:${tracks[0].id}`,
    ]);
    try {
      await this.sdk!.player.setRepeatMode("context", this.device!.id);
    } catch (error) {
      console.error(error);
    }
    this.startRefreshQueueInterval();
  }

  queue(voterId: string): QueuedTrackVM[] {
    if (!this.tracksQueue) return [];
    return this.tracksQueue.sortedByVotes(voterId, this.currentTrack!.id);
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
          this.trackRepository.lastPlayed(item.track.id),
        ),
    );
  }

  private startRefreshQueueInterval() {
    if (this.refreshQueueInterval) clearInterval(this.refreshQueueInterval);
    if (this.nextTrackTimeout) clearTimeout(this.nextTrackTimeout);
    this.refreshQueueInterval = setInterval(async () => {
      const tracks = await this.tracksOf(this.tracksQueue!.playlist.id);
      this.tracksQueue!.setTracks(tracks);
      const playback = await this.sdk!.player.getCurrentlyPlayingTrack();
      const track = playback.item as SpotifyTrack;
      if (track.id === this.currentTrack!.id) {
        this.currentTrack!.setProgress(playback.progress_ms);
        if (!this.nextTrackTimeout)
          this.nextTrackTimeout = setTimeout(async () => {
            await this.addMostVotedTrackToQueue();
          }, this.currentTrack!.secondsBeforeEnd(4));
        return;
      }
      this.currentTrack = new Track(
        track.id,
        track.name,
        joinArtists(track.artists),
        track.album.images[0].url,
        playback.progress_ms,
        track.duration_ms,
        this.trackRepository.started(track.id),
      );
      this.tracksQueue!.deleteVotesOf(track.id);
      if (this.nextTrackTimeout) clearTimeout(this.nextTrackTimeout);
      this.nextTrackTimeout = setTimeout(async () => {
        await this.addMostVotedTrackToQueue();
      }, this.currentTrack.secondsBeforeEnd(4));
    }, 1000);
  }

  private async addMostVotedTrackToQueue() {
    const nextTrack = this.tracksQueue!.mostVotedTrack(this.currentTrack!.id);
    await this.sdk!.player.addItemToPlaybackQueue(
      `spotify:track:${nextTrack.id}`,
      this.device!.id,
    );
  }

  private startRefreshTokenTimeout(accessToken: AccessToken) {
    this.refreshTokenTimeout = setTimeout(
      async () => {
        const { accessToken } = await this.sdk!.authenticate();
        this.authenticateWith(accessToken);
      },
      accessToken.expires_in * 1000 - 60000,
    );
  }
}

const joinArtists = (artists: SimplifiedArtist[]): string =>
  artists.map((a) => a.name).join(", ");
