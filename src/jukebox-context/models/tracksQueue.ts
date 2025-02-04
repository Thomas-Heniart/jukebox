import { Track } from "../models/track";
import { VoteStatus } from "../models/voteStatus";
import { Playlist } from "../models/playlist";
import { SpotifyApi } from "@spotify/web-api-ts-sdk";
import { TrackResultVM } from "../view-models/trackResultVM";
import { QueuedTrackVM } from "../view-models/queuedTrackVM";

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

  sortedByVotes(voterId: string, currentTrackId: string): Array<QueuedTrackVM> {
    return this.tracks
      .filter((track) => track.id !== currentTrackId)
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

  async reorder(sdk: SpotifyApi, currentTrackId: string) {
    if (this.tracks.length <= 2) return;
    const currentTrackIdx = this.tracks.findIndex(
      (t) => t.id === currentTrackId,
    );
    const nextTracks = this.tracks
      .filter((t) => t.id !== currentTrackId)
      .toSorted((a, b) => this.votesOf(b.id) - this.votesOf(a.id));
    const result = new Array<Track>(this.tracks.length);
    result[currentTrackIdx] = this.tracks[currentTrackIdx];
    let j = 0;
    for (let i = currentTrackIdx + 1; i < this.tracks.length; i++) {
      result[i] = nextTracks[j];
      j++;
    }
    for (let i = 0; i < currentTrackIdx; i++) {
      result[i] = nextTracks[j];
      j++;
    }
    this.tracks = result;
    await sdk.playlists.updatePlaylistItems(this.playlist.id, {
      uris: this.tracks.map((t) => `spotify:track:${t.id}`),
    });
  }

  deleteVotesOf(trackId: string) {
    delete this._votes[trackId];
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
