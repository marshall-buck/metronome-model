import Note from "./note";
import {
  ctx,
  VOLUME_SLIDER_RAMP_TIME,
  DEFAULT_VOLUME,
  BAR_BEAT_PITCH,
  DEFAULT_TEMPO,
  DIVISION_BEAT_PITCH,
  INTERVAL,
  LOOKAHEAD,
  PITCH_RAMP_TIME,
  SECONDS_PER_MINUTE,
  TimeSig,
  NoteQueue,
} from "./config";
import { TempoController } from "./tempoControl";

/**
 * Metronome class, that controls a metronome instance,
 *
 * timerId: setInterval id
 * nextNoteTime:  a number that represents the ctx time to play the next note
 * masterVolume: the master ctx volume
 *
 * tC: the TempoController instance
 * ctx: AudioContext
 * currentBeat: the current beat being played, used in a NoteQueue object
 * notesInQueue:  an array of NoteQueue objects to be played
 *
 */

class Metronome {
  private _timerID: number | null | NodeJS.Timer = null;

  private nextNoteTime: number;
  private _masterVolume: number = DEFAULT_VOLUME;

  private tC: TempoController = new TempoController(DEFAULT_TEMPO);

  private ctx: AudioContext;
  private currentBeat: number = 0;
  private notesInQueue: NoteQueue[] = [];
  private lastNoteDrawn: number = this.tC.timeSig.beats - 1;
  private masterGainNode: GainNode = new GainNode(ctx);

  public isPlaying: boolean = false;

  constructor(ctx: AudioContext) {
    this.ctx = ctx;
    this.masterGainNode.gain.setValueAtTime(
      this._masterVolume,
      this.ctx.currentTime
    );
    this.masterGainNode.connect(this.ctx.destination);
    this.nextNoteTime = this.ctx.currentTime;
  }

  /** Start metronome */
  public async start() {
    if (this.isPlaying) return;

    await this.ctx.resume();
    this.isPlaying = true;

    this.scheduler();
  }
  public async pause() {
    this.isPlaying = !this.isPlaying;

    await this.ctx.suspend();
    console.log(this);
  }

  /**Clears timerID from setInterval */
  private clearTimerID = () => {
    if (this._timerID) {
      clearInterval(this._timerID);
      this._timerID = null;
    }
  };
  /** Suspends audioContext and resets metronome to beat 0 */
  public async reset() {
    this.isPlaying = false;
    this.currentBeat = 0;
    this.notesInQueue.length = 0;
    this.nextNoteTime = this.ctx.currentTime;

    this.clearTimerID();

    this.lastNoteDrawn = this.tC.timeSig.beats - 1;
    await this.ctx.suspend();
  }

  /**************GETTERS AND SETTERS*************************/

  /**Change masterGainNode volume getter and setters   */
  get masterVolume() {
    return this._masterVolume;
  }

  set masterVolume(volume: number) {
    this.masterGainNode.gain.exponentialRampToValueAtTime(
      volume,
      this.ctx.currentTime + VOLUME_SLIDER_RAMP_TIME
    );
  }

  public getBpm() {
    return this.tC.tempo;
  }
  public setBpm(value: number) {
    this.tC.tempo = value;
  }

  // /** TimeSignature getter and setters open to ui */
  public getTimeSig(): TimeSig {
    return this.tC.timeSig;
  }

  public setTimeSig(value: TimeSig | string) {
    this.tC.timeSig = value;
  }

  //***********SCHEDULING******************* */

  private determineNotePitch(note: Note) {
    // sets the division beats
    if (
      this.currentBeat % this.tC.subdivisions === 0 &&
      this.currentBeat !== 0
    ) {
      note.setPitch(DIVISION_BEAT_PITCH, PITCH_RAMP_TIME);
    }
    // sets beat1 pitch
    if (this.currentBeat === 0) {
      note.setPitch(BAR_BEAT_PITCH, PITCH_RAMP_TIME);
    }
  }

  /** Triggers the note to play */
  private playTone(time: number): void {
    const note = new Note(this.ctx, this.masterGainNode);
    this.determineNotePitch(note);
    note.play(time);
  }

  /** Pushes next note into queue */
  private scheduleNote() {
    // if (!this.isPlaying) return;
    // Push the note into the queue, even if we're not playing.
    this.notesInQueue.push({
      currentBeat: this.currentBeat,
      nextNoteTime: this.nextNoteTime,
    });
    // console.log("scheduleNote after push", this.notesInQueue);

    this.playTone(this.nextNoteTime);
  }

  /** Sets the next note beat, based on time signature and tempo */
  private nextNote() {
    // if (!this.isPlaying) return;
    const secondsPerSound =
      SECONDS_PER_MINUTE / (this.tC.adjustedTempo ?? this.tC.tempo);
    this.nextNoteTime += secondsPerSound; // Add beat length to last beat time
    // Advance the beat number, wrap to 1 when reaching timeSig.beats
    this.currentBeat = (this.currentBeat + 1) % this.tC.soundsPerBar;
  }

  /** Starts scheduling note to be played (arrow function for "this")*/
  public scheduler = () => {
    if (this._timerID) this.clearTimerID();

    if (!this.isPlaying) return;

    // While there are notes that will need to play before the next interval,
    // schedule them and advance the pointer.

    while (this.nextNoteTime < this.ctx.currentTime + LOOKAHEAD) {
      this.scheduleNote();
      this.nextNote();
    }

    this._timerID = setInterval(this.scheduler, INTERVAL);
  };

  /********   UI helpers */
  /** Determines if there is a note to be drawn
   * - returns drawNote || false
   */
  public shouldDrawNote(): boolean | number {
    let drawNote = this.lastNoteDrawn;

    while (
      this.notesInQueue.length &&
      this.notesInQueue[0].nextNoteTime < this.ctx.currentTime
    ) {
      drawNote = this.notesInQueue[0].currentBeat;
      this.notesInQueue.shift(); // Remove note from queue
    }

    // We only need to draw if the note has moved.
    if (this.lastNoteDrawn !== drawNote) {
      this.lastNoteDrawn = drawNote;
      return drawNote;
    }
    return false;
  }
  /** lets the ui tell the class how to subdivide beats */
  public subdivideBeats(division: string | number) {
    this.tC.subdivideBeats(division);
  }
}

const mn = new Metronome(ctx);
export { mn };
