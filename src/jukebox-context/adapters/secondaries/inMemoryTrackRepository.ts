import { TrackRepository } from "@/jukebox-context/ports/trackRepository";

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
