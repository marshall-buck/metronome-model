import Note from "./note";
import { ctx, VOLUME_SLIDER_RAMP_TIME, DEFAULT_VOLUME } from "./audioCtx";

interface TimeSig {
  beats: number;
  noteValue: number;
}

interface TimeSigs {
  [key: string]: TimeSig;
}

interface NoteQueue {
  currentBeat: number;
  nextNoteTime: number;
}

const TIME_SIGS: TimeSigs = {
  0: { beats: 3, noteValue: 4 },
  1: { beats: 4, noteValue: 4 },
  2: { beats: 5, noteValue: 4 },
  3: { beats: 6, noteValue: 4 },
  4: { beats: 6, noteValue: 8 },
  5: { beats: 7, noteValue: 8 },
  6: { beats: 9, noteValue: 8 },
  7: { beats: 12, noteValue: 8 },
};

const DEFAULT_TEMPO = 120;
const SECONDS_PER_MINUTE = 60;
const PITCH_RAMP_TIME = 0.1;

const DIVISION_BEAT_PITCH = 750;
const BAR_BEAT_PITCH = 1000;

// How far ahead to schedule audio (sec) .25 default,
// this is used with interval, to overlap with next
// interval (in case interval is late) lower number takes care of
// bug when starting and stopping sound
const DEFAULT_LOOKAHEAD = 0.2; // .25
const LOOKAHEAD = DEFAULT_LOOKAHEAD;

// How frequently to call scheduling function (in milliseconds) 100 default
const DEFAULT_INTERVAL = 50; //100
const INTERVAL = DEFAULT_INTERVAL;

/**
 * Metronome class, that controls a metronome extends {AudioContext}
 */

class Metronome {
  private _timerID: number | null | NodeJS.Timer = null;
  private _drawBeatModifier: number = 1;
  private _timeSig: TimeSig = TIME_SIGS["1"];
  private _soundsPerBar = this._timeSig.beats * this._drawBeatModifier;
  private nextNoteTime: number;
  private _masterVolume: number = DEFAULT_VOLUME;
  private static _adjustedTempo: number | null = null;
  private _tempo: number = DEFAULT_TEMPO;
  private ctx: AudioContext;
  private currentBeat: number = 0;
  private notesInQueue: NoteQueue[] = [];
  private lastNoteDrawn: number = this._timeSig.beats - 1;
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
    console.log("START", this);
    if (this.isPlaying) return;

    await this.ctx.resume();
    this.isPlaying = true;

    this.scheduler();
  }
  public async pause() {
    this.isPlaying = !this.isPlaying;
    console.log("PAUSE", this);
    await this.ctx.suspend();
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

    this.lastNoteDrawn = this._timeSig.beats - 1;
    await this.ctx.suspend();
    console.log("reset", this);
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

  /** Change Tempo getter and setters */
  get tempo() {
    return this._tempo;
  }

  set tempo(value: number) {
    this._tempo = value;
    Metronome._adjustTempo(value, this._drawBeatModifier, this.timeSig);
  }

  /** TimeSignature getter and setters */
  get timeSig(): TimeSig {
    return this._timeSig as TimeSig;
  }

  set timeSig(value: TimeSig | string) {
    const sig = TIME_SIGS[value as string];
    this._timeSig = sig;
    this._soundsPerBar = this._timeSig.beats * this._drawBeatModifier;
    Metronome._adjustTempo(this.tempo, this._drawBeatModifier, sig);
  }

  /** read only drawBeatModifier */
  get drawBeatModifier() {
    return this._drawBeatModifier;
  }

  /**   Used to subdivide beats
   * i.e. if the time signature is 4/4, and the division is 2,
   * the sounds will double, implying every eight note is played.
   *
   * the draw beat modifier is also set, so the active beat only
   * changes on the quarter note
   *
   */
  public subdivideBeats(division: string | number) {
    if (typeof division === "string") division = Number(division);

    this._drawBeatModifier = division;
    this._soundsPerBar = this._timeSig.beats * this._drawBeatModifier;
    Metronome._adjustTempo(this.tempo, this._drawBeatModifier, this.timeSig);
  }
  /**needs to be called anytime, tempo, or time sig or beat modifiers are changed
   * sets an adjusted tempo to play sounds
   */
  private static _adjustTempo(
    tempo: number,
    mod: number,
    timeSig: TimeSig
  ): void {
    if (timeSig.noteValue === 8) Metronome._adjustedTempo = tempo * mod * 2;
    else Metronome._adjustedTempo = tempo * mod;
  }
  //***********SCHEDULING******************* */

  /** Triggers the note to play */
  private playTone(time: number): void {
    console.log("play tone", this);
    const note = new Note(this.ctx, this.masterGainNode);
    // sets the division beats
    if (this.currentBeat % this._drawBeatModifier !== 0) {
      note.setPitch(DIVISION_BEAT_PITCH, PITCH_RAMP_TIME);
    }
    // sets beat1 pitch
    if (this.currentBeat === 0) {
      note.setPitch(BAR_BEAT_PITCH, PITCH_RAMP_TIME);
    }
    note.play(time);
  }

  /** Pushes next note into queue */
  private scheduleNote() {
    "scheduleNote called";
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
    console.log("nextNote called");

    // if (!this.isPlaying) return;
    const secondsPerBeat =
      SECONDS_PER_MINUTE / (Metronome._adjustedTempo ?? this.tempo);
    this.nextNoteTime += secondsPerBeat; // Add beat length to last beat time
    // Advance the beat number, wrap to 1 when reaching timeSig.beats
    this.currentBeat = (this.currentBeat + 1) % this._soundsPerBar;
  }

  /** Starts scheduling note to be played (arrow function for "this")*/
  public scheduler = () => {
    if (this._timerID) this.clearTimerID();
    console.log("scheduler called before check", this);
    if (!this.isPlaying) return;
    console.log("scheduler called", this);
    // While there are notes that will need to play before the next interval,
    // schedule them and advance the pointer.
    console.log(this.nextNoteTime, this.ctx.currentTime + LOOKAHEAD);

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
    console.log("shouldDrawNote called");

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
}

const mn = new Metronome(ctx);
export { mn };
