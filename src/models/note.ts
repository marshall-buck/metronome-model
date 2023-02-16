import {
  VOLUME_SLIDER_RAMP_TIME,
  DEFAULT_VOLUME,
  DEFAULT_FREQUENCY,
  DEFAULT_SOUND_LENGTH,
  FREQUENCIES,
} from "./config";

/** Class representing a single note extends OscillatorNode Web Audio API */
class Note extends OscillatorNode {
  ctx: AudioContext;
  gainNode: GainNode;
  soundLength: number = DEFAULT_SOUND_LENGTH;
  private _noteVolume: number = DEFAULT_VOLUME;
  private _currentBeat: number = 0;
  private _nextNoteTime: number;

  constructor(ctx: AudioContext, gainNode: GainNode) {
    super(ctx, { frequency: DEFAULT_FREQUENCY, type: "triangle" });

    this.ctx = ctx;
    this.gainNode = gainNode;
    this.connect(this.gainNode);
    this._nextNoteTime = this.ctx.currentTime;
  }
  /**************GETTERS AND SETTERS*************************/
  /** Change note volume note volume */
  get noteVolume() {
    return this._noteVolume;
  }
  set noteVolume(value: number) {
    this.gainNode.gain.exponentialRampToValueAtTime(
      value,
      this.ctx.currentTime + VOLUME_SLIDER_RAMP_TIME
    );
  }

  /** Get and set currentBeat */
  get currentBeat() {
    return this._currentBeat;
  }
  set currentBeat(value: number) {
    this._currentBeat = value;
  }

  /** Get and set _nextNoteTime */
  get nextNoteTime() {
    return this._nextNoteTime;
  }
  set nextNoteTime(value: number) {
    this._nextNoteTime = value;
  }

  /** Starts and stops a note. */
  play(time: number): void {
    this.start(time);
    this.stop(time + this.soundLength);
  }

  /** Set the frequency to value at certain time */
  setPitch(value: string | number, time: number = this.ctx.currentTime): void {
    if (typeof value === "number") this.frequency.setValueAtTime(value, time);
    else {
      const upper = value.toUpperCase();
      if (value[1] === "#" || !FREQUENCIES[upper]) {
        throw new Error(
          "Invalid pitch, Include only notes from C4 to C5, and no sharps only flats"
        );
      } else {
        this.frequency.setValueAtTime(FREQUENCIES[upper], time);
      }
    }
  }
}

export default Note;
