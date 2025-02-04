export type QueuedTrack = {
  id: string;
  title: string;
  artist: string;
  imageUri: string;
  votes: number;
  voteStatus: "UP" | "DOWN" | "NONE";
};

export type PlayingTrack = {
  id: string;
  title: string;
  artist: string;
  imageUri: string;
  progress: number;
  duration: number;
};

export class TrackVotes {
  private readonly _votes: {
    [trackId: string]: {
      [userId: string]: "UP" | "DOWN";
    };
  } = {};

  public async vote({
    trackId,
    userId,
    vote,
  }: {
    trackId: string;
    userId: string;
    vote: "UP" | "DOWN";
  }) {
    this._votes[trackId] = this._votes[trackId] || {};
    this._votes[trackId][userId] = vote;
  }

  public votesOf(
    trackId: string,
    userId: string,
  ): { votes: number; voteStatus: "UP" | "DOWN" | "NONE" } {
    const votes = Object.values(this._votes[trackId] || {}).reduce(
      (acc, vote) => {
        return vote === "UP" ? acc + 1 : acc - 1;
      },
      0,
    );
    const voteStatus = this._votes[trackId]?.[userId] || "NONE";
    return {
      votes,
      voteStatus,
    };
  }

  within(playlist: string[]): Array<{ id: string; votes: number }> {
    return playlist.map((id) => {
      return {
        id,
        votes: Object.values(this._votes[id] || {}).reduce((acc, vote) => {
          return vote === "UP" ? acc + 1 : acc - 1;
        }, 0),
      };
    });
  }

  remove(trackId: string) {
    delete this._votes[trackId];
  }
}

export type UpdatePlaylist = (
  playlistId: string,
  votes: { id: string; votes: number }[],
) => Promise<void>;
