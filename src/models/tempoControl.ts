/**
 *  Class to convert a user entered tempo, into an adjusted tempo
 * for the proper number of sounds to play per bar,
 * based on bpm, time sig and subdivisions
 *
 * timeSig: is an object that determines pads(beats) per bar.
 *          the note value is used to determine if the adjusted
 *          tempo need to be changed. If the noteValue is 8 the adjusted
 *          tempo will double.
 *
 * subdivisions: how is the beats are subdivided, this is from ui, default is 1.
 *                A time sig of 3/4 will sound 3 beats, if the divisions is 2,
 *                a time sig of 3/4 will play 6 sounds. This is also used to
 *                determine what pitch to play each beat.
 *
 *
 *
 */

import { TimeSig, TIME_SIGS } from "./config";

class TempoController {
  private _timeSig: TimeSig = TIME_SIGS["1"];

  public subdivisions: number = 1;
  public soundsPerBar = this._timeSig.beats * this.subdivisions;
  public adjustedTempo: number | null = null;

  private _tempo: number;

  constructor(tempo: number) {
    this._tempo = tempo;
  }

  /**************GETTERS AND SETTERS*************************/

  /** Change Tempo getter and setters */
  get tempo() {
    return this._tempo;
  }

  set tempo(value: number) {
    this._tempo = value;
    this.adjustTempo(value, this.subdivisions, this._timeSig);
  }

  /** TimeSignature getter and setters */
  get timeSig(): TimeSig {
    return this._timeSig as TimeSig;
  }

  set timeSig(value: TimeSig | string) {
    const sig = TIME_SIGS[value as string];
    this._timeSig = sig;
    this.soundsPerBar = this._timeSig.beats * this.subdivisions;
    this.adjustTempo(this.tempo, this.subdivisions, sig);
  }
  /**   Used to subdivide beats
   * i.e. if the time signature is 4/4, and the division is 2,
   * the sounds will double, implying every eight note is played.
   *
   * the draw beat modifier is also set, so the active beat only
   * changes on the quarter note
   *
   */
  public subdivideBeats(number: string | number) {
    if (typeof number === "string") number = Number(number);

    this.subdivisions = number;
    this.soundsPerBar = this._timeSig.beats * this.subdivisions;
    this.adjustTempo(this.tempo, this.subdivisions, this._timeSig);
  }
  /**needs to be called anytime, tempo, or time sig or beat modifiers are changed
   * sets an adjusted tempo to play sounds
   */
  public adjustTempo(tempo: number, mod: number, timeSig: TimeSig): void {
    if (timeSig.noteValue === 8) this.adjustedTempo = tempo * mod * 2;
    else this.adjustedTempo = tempo * mod;
  }
}

export { TempoController };
