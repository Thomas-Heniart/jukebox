export interface TrackRepository {
  lastPlayed(trackId: string): number;

  started(trackId: string): number;
}
