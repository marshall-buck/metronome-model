import "./style.css";

import { mn } from "./models/metronome";

// const mn: Metronome = new Metronome();

let anF: number;

/******************* START/PAUSE *****************************/
const start = document.querySelector("#start") as HTMLInputElement;
const pause = document.querySelector("#pause") as HTMLInputElement;
const reset = document.querySelector("#reset") as HTMLInputElement;

/** Toggle button to show Stop or Start */
// function toggleStartButton() {
//   if (toggleStart.innerText === "Start") toggleStart.innerText = "Stop";
//   else toggleStart.innerText = "Start";
// }

/** Handles starting/Stopping metronome */
async function handleStart() {
  if (mn.isPlaying) return; // disable is playing
  anF = requestAnimationFrame(animatePads);
  await mn.start();
}

start?.addEventListener("mousedown", handleStart);
/** Handles starting/Stopping metronome */
async function handlePause() {
  if (!mn.isPlaying) return; // disable if !is playing
  cancelAnimationFrame(anF);
  await mn.pause();
}

pause.addEventListener("mousedown", handlePause);
/** Handles starting/Stopping metronome */
async function handleReset() {
  cancelAnimationFrame(anF);
  await mn.reset();
  const pads = document.querySelectorAll(".beat");
  resetPadsUi(pads);
}

reset?.addEventListener("mousedown", handleReset);
/** reset pad ui */

function resetPadsUi(pads: NodeListOf<Element>) {
  pads.forEach((e) => e.classList.remove("active"));
}
/******************* TEMPO CONTROL *****************************/
const tempoSlider: HTMLInputElement = document.querySelector(
  "input[name=tempo]"
) as HTMLInputElement;
tempoSlider.value = mn.tempo.toString();
const tempoLabel = document.querySelector(
  "label[for=tempo] span"
) as HTMLElement;
tempoLabel.innerText = mn.tempo.toString();
/** Handler to change Tempo */
function changeTempoHandler(e: Event) {
  const target = e.target as HTMLInputElement;
  const tempo = +target.value;
  mn.tempo = tempo;

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

  mn.subdivideBeats(target.value);
}

subdivisions?.addEventListener("input", changeSubdivisionsHandler);

/***************SELECT TIME SIG***********************/
const selectTimeSig = document.querySelector("#time-sig");

/** Handles resetting pads to proper amount of beats */
function selectTimeSigHandler(e: Event) {
  const target = e.target as HTMLSelectElement;
  const padContainer = document.querySelector(
    "#beats-container"
  ) as HTMLElement;
  padContainer.innerHTML = "";
  mn.timeSig = target.value;

  const beats = mn.timeSig.beats;
  for (let i = 0; i < beats; i++) {
    const pad = document.createElement("div");
    pad.className = "beat";
    padContainer?.appendChild(pad);
  }
}

selectTimeSig?.addEventListener("input", selectTimeSigHandler);

/******************* DRAW PADS CONTROL *****************************/
/** function to update the UI, so we can see when the beat progress.
 This is a loop: it reschedules itself to redraw at the end. */
function animatePads() {
  // console.log("animate");

  const drawNote = mn.shouldDrawNote();
  const pads = document.querySelectorAll(".beat");
  if (drawNote !== false) {
    pads.forEach((pad, idx) => {
      //  To highlight beat every n beats drawNote/ n
      // idx === drawNote / 2 will act like eight notes, must
      //  also set time sig beats to 8

      if (idx === (drawNote as number) / mn.drawBeatModifier) {
        pad.classList.toggle("active");
      } else pad.setAttribute("class", "beat");
    });
  }
  // Set up to draw again
  anF = requestAnimationFrame(animatePads);
}
