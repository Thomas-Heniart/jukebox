export class Track {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly artist: string,
    public readonly imageUri: string,
    private _progress: number,
    public readonly duration: number,
  ) {}

  setProgress(progress: number) {
    this._progress = progress;
  }

  get progress(): number {
    return this._progress;
  }

  secondsBeforeEnd(seconds: number) {
    const millisecondsPassed = this.duration - this._progress;
    return millisecondsPassed - seconds * 1000 || 0;
  }
}
