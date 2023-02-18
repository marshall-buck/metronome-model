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
  BEAT_PITCH,
} from "./config";
import { TempoController } from "./tempoControl";

/**
 * Metronome class,  controls a metronome instance,
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
 *
 * lastNoteDrawn: initially set to last beat in timeSig, only
 *                used to tell the ui if it needs to draw a note
 * masterGainNode: GainNode - sets the volume of metronome instance
 * isPlaying: boolean
 *
 *
 *
 */

class Metronome {
  private ctx: AudioContext;
  private masterGainNode: GainNode = new GainNode(ctx);
  private _masterVolume: number = DEFAULT_VOLUME;

  private tC: TempoController = new TempoController(DEFAULT_TEMPO);

  private _timerID: number | null | NodeJS.Timer = null;

  private nextNoteTime: number = 0;
  private currentBeat: number = 0;

  private notesInQueue: NoteQueue[] = [];
  private lastNoteDrawn: number = this.tC.timeSig.beats - 1;

  public isPlaying: boolean = false;

  constructor(ctx: AudioContext) {
    this.ctx = ctx;
    this.masterGainNode.gain.setValueAtTime(
      this._masterVolume,
      this.ctx.currentTime
    );
    this.masterGainNode.connect(this.ctx.destination);
    // this.nextNoteTime = this.ctx.currentTime;
  }

  /************** PUBLIC GETTERS AND SETTERS*************************/

  get masterVolume() {
    return this._masterVolume;
  }

  set masterVolume(volume: number) {
    this.masterGainNode.gain.exponentialRampToValueAtTime(
      volume,
      this.ctx.currentTime + VOLUME_SLIDER_RAMP_TIME
    );
  }

  get bpm() {
    return this.tC.tempo;
  }

  set bpm(value: number) {
    this.tC.tempo = value;
  }

  get timeSig(): TimeSig {
    return this.tC.timeSig;
  }

  set timeSig(value: TimeSig | string) {
    this.tC.timeSig = value;
  }

  /** Start metronome, pause and reset */
  public async start() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    await this.ctx.resume();
    this.startInterval();
  }
  public async pause() {
    if (!this.isPlaying) return;
    this.isPlaying = false;
    await this.ctx.suspend();
    this.clearInterval();
  }

  /** Suspends audioContext and resets metronome notesInQueue and beats */
  public async reset() {
    if (!this.isPlaying) return;
    await this.ctx.suspend();
    this.isPlaying = false;
    this.currentBeat = 0;
    this.notesInQueue.length = 0;
    this.nextNoteTime = this.ctx.currentTime;

    this.clearInterval();
  }

  /**Clears timerID from setInterval */
  private clearInterval = () => {
    if (this._timerID) {
      clearInterval(this._timerID);
      this._timerID = null;
    }
  };
  /**Starts timerID from setInterval */
  private startInterval = () => {
    if (this._timerID) {
      this.clearInterval();
    } else this._timerID = setInterval(this.scheduler, INTERVAL);
  };

  //***********SCHEDULING******************* */

  /** Starts scheduling notes to be played, */
  private scheduler = () => {
    // While there are notes that will need to play before the next interval,
    // schedule them and advance the pointer.

    while (this.nextNoteTime < this.ctx.currentTime + LOOKAHEAD) {
      this.scheduleNote();
      this.nextNote();
    }

    // console.log("scheduler", this);
  };

  /** Pushes next note into queue */
  private scheduleNote() {
    this.notesInQueue.push({
      currentBeat: this.currentBeat,
      nextNoteTime: this.nextNoteTime,
    });
    this.playTone(this.nextNoteTime);
  }
  /** Triggers the note to play */
  private playTone(time: number): void {
    const note = new Note(this.ctx, this.masterGainNode);
    this.determineNotePitch(note);
    note.play(time);
  }

  private determineNotePitch(note: Note) {
    if (
      this.currentBeat % this.tC.subdivisions !== 0 &&
      this.currentBeat !== 0
    ) {
      note.setPitch(DIVISION_BEAT_PITCH, PITCH_RAMP_TIME);
    }
    // sets beat1 pitch
    else if (this.currentBeat !== 0) {
      note.setPitch(BEAT_PITCH, PITCH_RAMP_TIME);
    } else note.setPitch(BAR_BEAT_PITCH, PITCH_RAMP_TIME);
  }

  /** Sets nextNoteTime, and currentBeat  */
  private nextNote() {
    const secondsPerSound =
      SECONDS_PER_MINUTE / (this.tC.adjustedTempo ?? this.tC.tempo);
    this.nextNoteTime += secondsPerSound;

    // Advance the beat number, wrap to 1 when reaching timeSig.beats
    this.currentBeat = (this.currentBeat + 1) % this.tC.soundsPerBar;
  }

  private removeNoteFromQueue() {
    let drawNote = this.lastNoteDrawn;
    while (
      this.notesInQueue.length &&
      this.notesInQueue[0].nextNoteTime < this.ctx.currentTime
    ) {
      drawNote = this.notesInQueue[0].currentBeat;
      this.notesInQueue.shift(); // Remove note from queue
    }

    return drawNote;
  }

  /** shouldDrawNote- this needs to be called on the front end
   * Determines if there is a note to be drawn
   * - returns drawNote || false
   */
  public shouldDrawNote(): boolean | number {
    // let drawNote = this.lastNoteDrawn;
    let drawNote = this.removeNoteFromQueue();

    // while (
    //   this.notesInQueue.length &&
    //   this.notesInQueue[0].nextNoteTime < this.ctx.currentTime
    // ) {
    //   drawNote = this.notesInQueue[0].currentBeat;
    //   this.notesInQueue.shift(); // Remove note from queue

    // }

    // We only need to draw if the note has moved.
    if (this.lastNoteDrawn !== drawNote) {
      this.lastNoteDrawn = drawNote;
      return drawNote;
    }
    return false;
  }
  /**
   * subdivideBeats
   * Lets the ui tell the class how to subdivide beats */
  public subdivideBeats(division: string | number) {
    this.tC.subdivideBeats(division);
  }
}

const mn = new Metronome(ctx);
export { mn };
