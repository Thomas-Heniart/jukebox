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
