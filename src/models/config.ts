/**Metronome class Defaults */
interface NoteQueue {
  currentBeat: number;
  nextNoteTime: number;
}

const ctx = new AudioContext();
const VOLUME_SLIDER_RAMP_TIME = 0.2;
const DEFAULT_VOLUME = 0.2;
const DEFAULT_TEMPO = 60;

const SECONDS_PER_MINUTE = 60;
const PITCH_RAMP_TIME = 0.1;

const PITCH_DIVISION = 250;
const PITCH_BEAT = 500;
const PITCH_BAR = 1000;

/** How far ahead to schedule audio (seconds) .25 default,
this is used with interval, to overlap with next,
This affects how tight the tempo control (and other real-time controls)
The larger the number, the more overlap there will be with the next interval.
How much the lookahead overlaps with the next interval’s start time is determines
how resilient your app will be across different.
In general, to be resilient to slower machines and operating systems,
it’s best to have a large overall lookahead and a reasonably short interval.
You can adjust to have shorter overlaps and longer intervals,
in order to process fewer callbacks, but at some point,
you might start hearing that a large latency causes tempo changes, etc.,
to not take effect immediately. conversely, if you lessened the lookahead too much,
you might start hearing some jittering
*/

const DEFAULT_LOOKAHEAD = 0.1; // .25 sec
const LOOKAHEAD = DEFAULT_LOOKAHEAD;

/**  How frequently to call scheduling function (in milliseconds) 100 default
used in setInterval
The interval between scheduling calls is a tradeoff
between the minimum latency and how often your code impacts the processor
*/
const DEFAULT_INTERVAL = 50; //100
const INTERVAL = DEFAULT_INTERVAL;

/** Note Class defaults */
// 440 * Math.pow(1.059463094359,12)

const DEFAULT_SOUND_LENGTH = 0.05;

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
  7: { beats: 11, noteValue: 8 },
  8: { beats: 12, noteValue: 8 },
};

export {
  ctx,
  VOLUME_SLIDER_RAMP_TIME,
  DEFAULT_VOLUME,
  DEFAULT_TEMPO,
  SECONDS_PER_MINUTE,
  PITCH_RAMP_TIME,
  LOOKAHEAD,
  INTERVAL,
  DEFAULT_SOUND_LENGTH,
  TIME_SIGS,
  FREQUENCIES,
  PITCH_DIVISION,
  PITCH_BEAT,
  PITCH_BAR,
};

export type { TimeSig, NoteQueue };
