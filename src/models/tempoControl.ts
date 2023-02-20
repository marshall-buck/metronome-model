import { TimeSig, TIME_SIGS } from "./config";

/**
 *  Class to convert a user entered tempo, into an adjusted tempo
 * for the proper number of sounds to play per bar,
 * based on bpm, time sig and subdivisions
 *
 * Only used in Metronome class
 *
 * timeSig: is an object that determines pads(beats) per bar.
 *          the note value is used to determine if the adjusted
 *          tempo need to be changed. If the noteValue is 8 the adjusted
 *          tempo will double.
 *
 * subdivisions:  How the bar is subdivided, input from ui, default is 1.
 *                A time sig of 3/4 will sound 3 beats per bar, if the divisions is 2,
 *                a time sig of 3/4 will play 6 sounds per bar. This is also used to
 *                determine what pitch to play each beat.
 *
 * soundsPerBar:  Number of sounds to play per bar
 *
 * adjustedTempo:  true sounds per minute based on all factors (bpm, timeSig, divisions)
 *                 used to calculate how long each beat is in seconds
 *                 in the Metronome.nextNote function
 *
 * tempo: tempo(bpm) from ui
 *
 */

class TempoController {
  private _timeSig: TimeSig = TIME_SIGS["1"];

  public beatDivisions: number = 1;
  public soundsPerBar = this._timeSig.beats * this.beatDivisions;
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
    this.adjustTempo(value, this.beatDivisions, this._timeSig);
  }

  /** TimeSignature getter and setters open to Metronome class */
  get timeSig(): TimeSig {
    return this._timeSig as TimeSig;
  }
  /** sets new time sig, while making appropriate changes
   *  to adjustedTempo and sounds per bar */
  set timeSig(value: TimeSig | string) {
    const sig = TIME_SIGS[value as string];
    this._timeSig = sig;
    this.soundsPerBar = this._timeSig.beats * this.beatDivisions;
    this.adjustTempo(this.tempo, this.beatDivisions, sig);
  }
  /**   Used to subdivide beats
   * i.e. if the time signature is 4/4, and the division is 2,
   * the sounds will double, implying every eight note is played.
   *
   * the draw beat modifier is also set, so the active beat only
   * changes on the quarter note
   *
   */
  public subdivideBeats(division: number | string) {
    if (typeof division === "string") division = Number(division);

    this.beatDivisions = division;
    this.soundsPerBar = this._timeSig.beats * this.beatDivisions;
    this.adjustTempo(this.tempo, this.beatDivisions, this._timeSig);
  }
  /** adjustTempo
   *   needs to be called anytime, tempo, or time sig or subdivisions are changed
   * sets an adjusted tempo to play sounds
   */
  private adjustTempo(tempo: number, mod: number, timeSig: TimeSig): void {
    if (timeSig.noteValue === 8) this.adjustedTempo = tempo * mod * 2;
    else this.adjustedTempo = tempo * mod;
  }
}

export { TempoController };
