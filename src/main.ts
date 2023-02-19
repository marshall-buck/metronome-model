import "./style.css";

import { mn } from "./models/metronome";

let anF: number;
let divisions: string = "1";

/******************* START/PAUSE *****************************/
const start = document.querySelector("#start") as HTMLInputElement;
const pause = document.querySelector("#pause") as HTMLInputElement;
const reset = document.querySelector("#reset") as HTMLInputElement;
const showDivisions = document.querySelector("#divisions") as HTMLInputElement;
const padContainer = document.querySelector("#beats-container") as HTMLElement;

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
const tempoSlider: HTMLInputElement = document.querySelector(
  "input[name=tempo]"
) as HTMLInputElement;
// tempoSlider.value = mn.getBpm().toString();
tempoSlider.value = mn.bpm.toString();
const tempoLabel = document.querySelector(
  "label[for=tempo] span"
) as HTMLElement;
// tempoLabel.innerText = mn.getBpm().toString();
tempoLabel.innerText = mn.bpm.toString();
/** Handler to change Tempo */
function changeTempoHandler(e: Event) {
  const target = e.target as HTMLInputElement;
  const tempo = +target.value;
  mn.bpm = tempo;
  // mn.setBpm(tempo);

  tempoLabel.innerText = target.value;
}

tempoSlider?.addEventListener("input", changeTempoHandler);

/******************* VOLUME CONTROL *****************************/
const masterVolumeLabel = document.querySelector(
  "label[for=master-volume] span"
) as HTMLElement;
const masterVolume: HTMLInputElement | null = document.querySelector(
  "input[name=master-volume]"
);
function volumeSliderHandler(e: Event) {
  const target = e.target as HTMLInputElement;
  masterVolumeLabel.innerText = target.value;
  mn.masterVolume = +target.value;
}

masterVolume?.addEventListener("input", volumeSliderHandler);

/******************PLAY SUBDIVISIONS */

const subdivisions = document.querySelector("#subdivisions");

function changeSubdivisionsHandler(e: Event) {
  const target = e.target as HTMLSelectElement;
  divisions = target.value;
  mn.subdivideBeats(target.value);
  createPads(padContainer, mn.timeSig.beats, Number(divisions));
}

subdivisions?.addEventListener("input", changeSubdivisionsHandler);

/***************SELECT TIME SIG***********************/
const selectTimeSig = document.querySelector("#time-sig");

/** Handles resetting pads to proper amount of beats */
function selectTimeSigHandler(e: Event) {
  const target = e.target as HTMLSelectElement;
  // const padContainer = document.querySelector(
  //   "#beats-container"
  // ) as HTMLElement;
  // padContainer.innerHTML = "";
  mn.timeSig = target.value;

  const beats = mn.timeSig.beats;
  // for (let i = 0; i < beats; i++) {
  //   const pad = document.createElement("div");
  //   pad.className = "beat";
  //   padContainer?.appendChild(pad);
  // }
  createPads(padContainer, beats, Number(divisions));
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
  // const divisionMultiplier = Number(divisions);

  const numPads = !showDivisions.checked ? beats : beats * divisions;

  for (let i = 0; i < numPads; i++) {
    const pad = document.createElement("div");
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
  // const drawNote = false;
  const drawNote = mn.shouldDrawNote();
  let pads = document.querySelectorAll(".beat");
  if (drawNote !== false) {
    pads.forEach((pad, idx) => {
      //  To highlight beat every n beats drawNote/ n
      // idx === drawNote / 2 will act like eight notes, must

      if (idx === (drawNote as number) / Number(divisions)) {
        pad.classList.toggle("active");
      } else pad.setAttribute("class", "beat");
    });
  }

  // Set up to draw again
  anF = requestAnimationFrame(animatePads);
}

createPads(padContainer, mn.timeSig.beats, Number(divisions));
