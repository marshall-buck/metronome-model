/**Metronome class Defaults */
interface NoteQueue {
  currentBeat: number;
  nextNoteTime: number;
}

const ctx = new AudioContext();
const VOLUME_SLIDER_RAMP_TIME = 0.2;
const DEFAULT_VOLUME = 0.2;
const DEFAULT_TEMPO = 80;

const SECONDS_PER_MINUTE = 60;
const PITCH_RAMP_TIME = 0.1;

const DIVISION_BEAT_PITCH = 750;
const BAR_BEAT_PITCH = 1000;

// How far ahead to schedule audio (sec) .25 default,
// this is used with interval, to overlap with next
// interval (in case interval is late) lower number takes care of
// bug when starting and stopping sound
const DEFAULT_LOOKAHEAD = 0.1; // .25
const LOOKAHEAD = DEFAULT_LOOKAHEAD;

// How frequently to call scheduling function (in milliseconds) 100 default
const DEFAULT_INTERVAL = 50; //100
const INTERVAL = DEFAULT_INTERVAL;

/** Note Class defaults */
// 440 * Math.pow(1.059463094359,12)
const DEFAULT_FREQUENCY = 380;
const DEFAULT_SOUND_LENGTH = 0.05;

/** TempoController Defaults */

interface TimeSig {
  beats: number;
  noteValue: number;
}

interface TimeSigs {
  [key: string]: TimeSig;
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

export {
  ctx,
  VOLUME_SLIDER_RAMP_TIME,
  DEFAULT_VOLUME,
  DEFAULT_TEMPO,
  SECONDS_PER_MINUTE,
  PITCH_RAMP_TIME,
  DIVISION_BEAT_PITCH,
  BAR_BEAT_PITCH,
  LOOKAHEAD,
  INTERVAL,
  DEFAULT_FREQUENCY,
  DEFAULT_SOUND_LENGTH,
  TIME_SIGS,
};

export type { TimeSig, NoteQueue };
