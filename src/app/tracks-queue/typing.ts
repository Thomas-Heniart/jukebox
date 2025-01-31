export type QueuedTrack = {
  id: string;
  title: string;
  artist: string;
  imageUri: string;
  votes: number;
  voteStatus: "UP" | "DOWN" | "NONE";
};

export type PlayingTrack = {
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
    console.log("vote", this._votes);
  }

  public votesOf(
    trackId: string,
    userId: string,
  ): { votes: number; voteStatus: "UP" | "DOWN" | "NONE" } {
    console.log("votes", this._votes);
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
}
