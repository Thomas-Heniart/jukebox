export type QueuedTrackVM = {
  id: string;
  title: string;
  artist: string;
  imageUri: string;
  votes: number;
  voteStatus: "UP" | "DOWN" | "NONE";
};
