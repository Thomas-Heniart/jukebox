import { Track } from "../models/track";
import { VoteStatus } from "../models/voteStatus";
import { Playlist } from "../models/playlist";
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
        lastPlayed: track.lastPlayed,
      }))
      .toSorted((a, b) => {
        const diff = b.votes - a.votes;
        if (diff != 0) return diff;
        return a.lastPlayed - b.lastPlayed;
      });
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

  hasTrack(id: string) {
    return this.tracks.filter((t) => t.id === id).length > 0;
  }

  addTrack(
    { id, title, artist, imageUri, duration }: TrackResultVM,
    voterId: string,
  ) {
    this.tracks.push(new Track(id, title, artist, imageUri, 0, duration, 0));
    this.vote({
      trackId: id,
      vote: "UP",
      voterId,
    });
  }

  setTracks(tracks: Track[]) {
    this.tracks = tracks;
  }

  mostVotedTrack(currentTrackId: string) {
    return this.tracks
      .filter((t) => t.id !== currentTrackId)
      .map((track, i) => ({ track, i }))
      .toSorted((a, b) => {
        const voteDifference =
          this.votesOf(b.track.id) - this.votesOf(a.track.id);
        if (voteDifference !== 0) return voteDifference;
        return a.i - b.i;
      })[0].track;
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
