import { VOLUME_SLIDER_RAMP_TIME, DEFAULT_VOLUME } from "./audioCtx";

interface Frequency {
  [key: string]: number;
}

//TODO: Abstract to Formula
const FREQUENCIES: Frequency = {
  C4: 261.63,
  DB4: 277.18,
  D4: 293.66,
  EB4: 311.13,
  E4: 329.63,
  F4: 349.23,
  GB4: 369.99,
  G4: 392.0,
  AB4: 415.3,
  A4: 440.0,
  BB4: 466.16,
  B4: 493.88,
};
// 440 * Math.pow(1.059463094359,12)
const DEFAULT_FREQUENCY = 380;
const DEFAULT_SOUND_LENGTH = 0.05;

/** Class representing a single note extends OscillatorNode Web Audio API */
class Note extends OscillatorNode {
  ctx: AudioContext;
  gainNode: GainNode;
  soundLength: number = DEFAULT_SOUND_LENGTH;
  private _noteVolume: number = DEFAULT_VOLUME;

  constructor(ctx: AudioContext, gainNode: GainNode) {
    super(ctx, { frequency: DEFAULT_FREQUENCY, type: "triangle" });

    this.ctx = ctx;
    this.gainNode = gainNode;
    this.connect(this.gainNode);
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
}

export default Note;
