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

export class SpotifyJukebox {
  private readonly _id: string = v4();
  private sdk: SpotifyApi | null = null;
  private device: Device | null = null;
  private currentTrack: Track | null = null;
  private tracksQueue: TracksQueue | null = null;

  private queueInterval: NodeJS.Timeout | null = null;
  private reorderTracksTimeout: NodeJS.Timeout | null = null;

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
    this.currentTrack = tracks[0];
    await this.sdk!.player.startResumePlayback(
      this.device!.id,
      `spotify:playlist:${playlist.id}`,
    );
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
        ),
    );
  }

  private startRefreshQueueInterval() {
    if (this.queueInterval) clearInterval(this.queueInterval);
    if (this.reorderTracksTimeout) clearTimeout(this.reorderTracksTimeout);
    this.queueInterval = setInterval(async () => {
      const tracks = await this.tracksOf(this.tracksQueue!.playlist.id);
      this.tracksQueue!.setTracks(tracks);
      const playback = await this.sdk!.player.getCurrentlyPlayingTrack();
      const track = playback.item as SpotifyTrack;
      if (track.id === this.currentTrack!.id) {
        this.currentTrack!.setProgress(playback.progress_ms);
        if (this.reorderTracksTimeout) clearTimeout(this.reorderTracksTimeout);
        this.reorderTracksTimeout = setTimeout(
          async () => await this.reorderQueue(),
          this.currentTrack!.secondsBeforeEnd(4),
        );
        return;
      }
      this.currentTrack = new Track(
        track.id,
        track.name,
        joinArtists(track.artists),
        track.album.images[0].url,
        playback.progress_ms,
        track.duration_ms,
      );
      this.tracksQueue!.deleteVotesOf(track.id);
      if (this.reorderTracksTimeout) clearTimeout(this.reorderTracksTimeout);
      this.reorderTracksTimeout = setTimeout(
        async () => await this.reorderQueue(),
        this.currentTrack.secondsBeforeEnd(4),
      );
    }, 1500);
  }

  private async reorderQueue() {
    await this.tracksQueue!.reorder(this.sdk!, this.currentTrack!.id);
  }

  private startRefreshTokenTimeout(accessToken: AccessToken) {
    setTimeout(
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
