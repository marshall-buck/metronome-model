import "./style.css";

import { mn } from "./models/metronome";

let anF: number;

const start = document.querySelector("#start") as HTMLInputElement;
const pause = document.querySelector("#pause") as HTMLInputElement;
const reset = document.querySelector("#reset") as HTMLInputElement;
const tempoSlider: HTMLInputElement = document.querySelector(
  "input[name=tempo]"
) as HTMLInputElement;

const tempoLabel = document.querySelector(
  "label[for=tempo] span"
) as HTMLElement;

const masterVolumeLabel = document.querySelector(
  "label[for=master-volume] span"
) as HTMLElement;
const masterVolume: HTMLInputElement | null = document.querySelector(
  "input[name=master-volume]"
);

const showDivisions = document.querySelector("#divisions") as HTMLInputElement;
const padContainer = document.querySelector("#beats-container") as HTMLElement;
const lookahead = document.querySelector(
  "input[name=lookahead]"
) as HTMLInputElement;
const lookaheadLabel = document.querySelector(
  "label[for=lookahead] span"
) as HTMLInputElement;
const interval = document.querySelector(
  "input[name=interval]"
) as HTMLInputElement;
const intervalLabel = document.querySelector(
  "label[for=interval] span"
) as HTMLInputElement;

const subdivisions = document.querySelector("#subdivisions");

const selectTimeSig = document.querySelector("#time-sig");

/******************* GLOBAL SETTINGS *****************************/
function handleChangeLookahead(e: Event) {
  const target = e.target as HTMLInputElement;
  const lookahead = +target.value;
  lookaheadLabel.innerText = target.value;
  mn.lookahead = lookahead;
}

lookahead.addEventListener("input", handleChangeLookahead);

function handleChangeInterval(e: Event) {
  const target = e.target as HTMLInputElement;
  const interval = +target.value;

  intervalLabel.innerText = target.value;
  mn.interval = interval;
}

interval.addEventListener("input", handleChangeInterval);

let isShowDivisions = false;
/******************* START/PAUSE *****************************/
/** Handles starting/Stopping metronome */
async function handleStart() {
  if (mn.isPlaying) return; // disable is playing

  await mn.start();
  anF = requestAnimationFrame(animatePads);
}

start?.addEventListener("mousedown", handleStart);
/** Handles starting/Stopping metronome */
async function handlePause() {
  if (!mn.isPlaying) return; // disable if !is playing
  await mn.pause();
  cancelAnimationFrame(anF);
}

pause.addEventListener("mousedown", handlePause);

/** Handles starting/Stopping metronome */
async function handleReset() {
  await mn.reset();
  const pads = document.querySelectorAll(".beat");
  resetPadsUi(pads);
  cancelAnimationFrame(anF);
}

reset?.addEventListener("mousedown", handleReset);
/** reset pad ui */

/******************* TEMPO CONTROL *****************************/

// tempoSlider.value = mn.getBpm().toString();
tempoSlider.value = mn.bpm.toString();

tempoLabel.innerText = mn.bpm.toString();
/** Handler to change Tempo */
function changeTempoHandler(e: Event) {
  const target = e.target as HTMLInputElement;
  const tempo = +target.value;
  mn.bpm = tempo;

  tempoLabel.innerText = target.value;
}

tempoSlider?.addEventListener("input", changeTempoHandler);

/******************* VOLUME CONTROL *****************************/

function volumeSliderHandler(e: Event) {
  const target = e.target as HTMLInputElement;
  masterVolumeLabel.innerText = target.value;
  mn.masterVolume = +target.value;
}

masterVolume?.addEventListener("input", volumeSliderHandler);

/******************SHOW SUBDIVISIONS */

function changeSubdivisionsHandler(e: Event) {
  const target = e.target as HTMLSelectElement;
  // divisions = target.value;
  mn.beatDivisions = Number(target.value);
  createPads(padContainer, mn.timeSig.beats, mn.beatDivisions);
}

subdivisions?.addEventListener("input", changeSubdivisionsHandler);

/***************SELECT TIME SIG***********************/

/** Handles resetting pads to proper amount of beats */
function selectTimeSigHandler(e: Event) {
  const target = e.target as HTMLSelectElement;

  mn.timeSig = target.value;

  const beats = mn.timeSig.beats;

  createPads(padContainer, beats, mn.beatDivisions);
}

selectTimeSig?.addEventListener("input", selectTimeSigHandler);

/******************* DRAW PADS CONTROL *****************************/

function resetPadsUi(pads: NodeListOf<Element>) {
  pads.forEach((e) => e.classList.remove("active"));
}

function createPads(
  padContainer: HTMLElement,
  beats: number,
  divisions: number
) {
  padContainer.innerHTML = "";

  const numPads = !showDivisions.checked ? beats : beats * divisions;

  for (let i = 0; i < numPads; i++) {
    const pad = document.createElement("div");
    pad.classList.add("pad");
    if (showDivisions.checked) {
      if (i % divisions === 0) {
        pad.classList.add("beat");
      } else {
        pad.classList.add("division");
      }
    } else {
      pad.classList.add("beat");
    }
    padContainer?.append(pad);
  }
}
/** function to update the UI, so we can see when the beat progress.
 This is a loop: it reschedules itself to redraw at the end. */
function animatePads() {
  const drawNote = mn.shouldDrawNote();
  let pads = document.querySelectorAll(".pad");

  if (showDivisions.checked !== isShowDivisions) {
    createPads(padContainer, mn.timeSig.beats, mn.beatDivisions);
    isShowDivisions = !isShowDivisions;
  }

  if (drawNote !== false) {
    // If Show divisions is unchecked then only draw beats
    if (!isShowDivisions) {
      pads.forEach((pad, idx) => {
        if (idx === (drawNote as number) / mn.beatDivisions) {
          pad.classList.add("active");
        } else pad.classList.remove("active");
      });
    } else {
      pads.forEach((pad, idx) => {
        if (idx === drawNote) {
          pad.classList.add("active");
        } else pad.classList.remove("active");
      });
    }
  }

  // Set up to draw again
  anF = requestAnimationFrame(animatePads);
}

createPads(padContainer, mn.timeSig.beats, mn.beatDivisions);
