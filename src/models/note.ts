import {
  VOLUME_SLIDER_RAMP_TIME,
  DEFAULT_VOLUME,
  DEFAULT_SOUND_LENGTH,
  FREQUENCIES,
  PITCH_BAR,
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
    super(ctx, { frequency: PITCH_BAR, type: "triangle" });

    this.ctx = ctx;
    this.gainNode = gainNode;

    this._nextNoteTime = this.ctx.currentTime;
    this.connect(this.gainNode);
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
      throw new Error("frequency must be a number");
    }
  }
}

export default Note;
