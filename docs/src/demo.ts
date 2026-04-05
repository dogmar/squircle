import {
  correctedRadius,
  superellipsePoints,
  circleArcPoints,
  perceivedRadius,
  pointsToPath,
} from "./math.ts";

// ── Shared controls ──

const radiusSlider = document.getElementById("radius-slider") as HTMLInputElement;
const exponentSlider = document.getElementById("exponent-slider") as HTMLInputElement;
const correctionToggle = document.getElementById("correction-toggle")!;
const toggleTrack = document.getElementById("toggle-track")!;
const toggleKnob = document.getElementById("toggle-knob")!;
const correctionStatus = document.getElementById("correction-status")!;
const radiusValue = document.getElementById("radius-value")!;
const exponentValue = document.getElementById("exponent-value")!;

let correctionOn = true;

correctionToggle.addEventListener("click", () => {
  correctionOn = !correctionOn;
  correctionToggle.setAttribute("aria-checked", String(correctionOn));
  toggleTrack.className = correctionOn
    ? "w-11 h-6 bg-indigo-600 rounded-full relative transition-colors"
    : "w-11 h-6 bg-zinc-700 rounded-full relative transition-colors";
  toggleKnob.className = correctionOn
    ? "absolute top-0.5 left-[1.375rem] w-5 h-5 bg-white rounded-full transition-all"
    : "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-all";
  update();
});

radiusSlider.addEventListener("input", update);
exponentSlider.addEventListener("input", update);

// ── Section 1: Overlay Comparison ──

const circleBox = document.getElementById("overlay-box-circle")!;
const squircleBox = document.getElementById("overlay-box-squircle")!;
const readoutCircleR = document.getElementById("readout-circle-r")!;
const readoutSquircleR = document.getElementById("readout-squircle-r")!;

function updateOverlay(r: number, cssN: number, mathN: number): void {
  const squircleR = correctionOn ? correctedRadius(r, mathN) : r;

  circleBox.style.borderTopRightRadius = `${r}px`;
  squircleBox.style.borderTopRightRadius = `${squircleR.toFixed(1)}px`;
  squircleBox.style.setProperty("corner-shape", `superellipse(${cssN})`);

  correctionStatus.textContent = correctionOn ? "ON" : "OFF";
  correctionStatus.className = correctionOn
    ? "text-xs text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded"
    : "text-xs text-red-400 bg-red-400/10 px-2 py-0.5 rounded";
  readoutCircleR.textContent = String(r);
  readoutSquircleR.textContent = squircleR.toFixed(1);
}

// ── Section 2: Interactive Math Explorer ──

const svgEl = document.getElementById("math-svg")!;
const NS = "http://www.w3.org/2000/svg";

// Fixed square — the box whose corner we're rounding
const BOX = 180;
const PAD = 10;
const cornerX = PAD + BOX;
const cornerY = PAD;

const boxRect = document.createElementNS(NS, "rect");
boxRect.setAttribute("x", String(PAD));
boxRect.setAttribute("y", String(PAD));
boxRect.setAttribute("width", String(BOX));
boxRect.setAttribute("height", String(BOX));
boxRect.setAttribute("fill", "none");
boxRect.setAttribute("stroke", "#3f3f46");
boxRect.setAttribute("stroke-width", "1");
svgEl.appendChild(boxRect);

const circlePath = document.createElementNS(NS, "path");
circlePath.setAttribute("fill", "none");
circlePath.setAttribute("stroke", "#ef4444");
circlePath.setAttribute("stroke-width", "2");
circlePath.setAttribute("stroke-dasharray", "4 3");
svgEl.appendChild(circlePath);

const superPath = document.createElementNS(NS, "path");
superPath.setAttribute("fill", "none");
superPath.setAttribute("stroke", "#6366f1");
superPath.setAttribute("stroke-width", "2");
svgEl.appendChild(superPath);

const corrPath = document.createElementNS(NS, "path");
corrPath.setAttribute("fill", "none");
corrPath.setAttribute("stroke", "#10b981");
corrPath.setAttribute("stroke-width", "2");
svgEl.appendChild(corrPath);

function makeDot(color: string): SVGCircleElement {
  const dot = document.createElementNS(NS, "circle");
  dot.setAttribute("r", "3.5");
  dot.setAttribute("fill", color);
  svgEl.appendChild(dot);
  return dot;
}
const cDotTop = makeDot("#ef4444");
const cDotRight = makeDot("#ef4444");
const sDotTop = makeDot("#6366f1");
const sDotRight = makeDot("#6366f1");
const corrDotTop = makeDot("#10b981");
const corrDotRight = makeDot("#10b981");


function arcToSvg(mathX: number, mathY: number, arcR: number): { x: number; y: number } {
  return { x: cornerX - arcR + mathX, y: cornerY + arcR - mathY };
}



function updateMathSvg(r: number, cssN: number, mathN: number): void {
  const maxR = BOX;
  const clampedR = Math.min(r, maxR);
  const corrR = Math.min(correctedRadius(clampedR, mathN), maxR);

  // Circle
  const cArc = circleArcPoints(clampedR).map((p) => arcToSvg(p.x, p.y, clampedR));
  circlePath.setAttribute("d",
    `M ${cornerX} ${PAD + BOX} L ${cArc[0]!.x} ${cArc[0]!.y} ` +
    pointsToPath(cArc).slice(2) +
    ` L ${PAD} ${cornerY}`);

  // Superellipse at same radius
  const sArc = superellipsePoints(clampedR, mathN).map((p) => arcToSvg(p.x, p.y, clampedR));
  superPath.setAttribute("d",
    `M ${cornerX} ${PAD + BOX} L ${sArc[0]!.x} ${sArc[0]!.y} ` +
    pointsToPath(sArc).slice(2) +
    ` L ${PAD} ${cornerY}`);

  // Corrected superellipse
  const corrArc = superellipsePoints(corrR, mathN).map((p) => arcToSvg(p.x, p.y, corrR));
  corrPath.setAttribute("d",
    `M ${cornerX} ${PAD + BOX} L ${corrArc[0]!.x} ${corrArc[0]!.y} ` +
    pointsToPath(corrArc).slice(2) +
    ` L ${PAD} ${cornerY}`);

  // Junction dots
  const cFirst = cArc[0]!, cLast = cArc[cArc.length - 1]!;
  cDotRight.setAttribute("cx", String(cFirst.x)); cDotRight.setAttribute("cy", String(cFirst.y));
  cDotTop.setAttribute("cx", String(cLast.x));    cDotTop.setAttribute("cy", String(cLast.y));

  const sFirst = sArc[0]!, sLast = sArc[sArc.length - 1]!;
  sDotRight.setAttribute("cx", String(sFirst.x)); sDotRight.setAttribute("cy", String(sFirst.y));
  sDotTop.setAttribute("cx", String(sLast.x));    sDotTop.setAttribute("cy", String(sLast.y));

  const corrFirst = corrArc[0]!, corrLast = corrArc[corrArc.length - 1]!;
  corrDotRight.setAttribute("cx", String(corrFirst.x)); corrDotRight.setAttribute("cy", String(corrFirst.y));
  corrDotTop.setAttribute("cx", String(corrLast.x));    corrDotTop.setAttribute("cy", String(corrLast.y));

  // Readouts
  document.getElementById("formula-n")!.textContent = mathN.toFixed(1);
  document.getElementById("formula-r")!.textContent = String(r);
  document.getElementById("formula-result")!.textContent = correctedRadius(r, mathN).toFixed(1);

  const prc = perceivedRadius(clampedR, clampedR, 2);
  const prs = perceivedRadius(clampedR, clampedR, mathN);
  const prCorr = perceivedRadius(clampedR, corrR, mathN);

  document.getElementById("radius-circle")!.textContent = `${clampedR}px`;
  document.getElementById("radius-superellipse")!.textContent = `${clampedR}px`;
  document.getElementById("radius-corrected")!.textContent = `${corrR.toFixed(1)}px`;

  document.getElementById("bevel-circle")!.textContent = `${prc.toFixed(1)}px`;
  document.getElementById("bevel-superellipse")!.textContent = `${prs.toFixed(1)}px`;
  document.getElementById("bevel-corrected")!.textContent = `${prCorr.toFixed(1)}px`;

  const fmt = (v: number): string => `${v >= 0 ? "+" : ""}${v.toFixed(1)}px`;
  document.getElementById("diff-circle")!.textContent = fmt(prc - prc);
  document.getElementById("diff-superellipse")!.textContent = fmt(prs - prc);
  document.getElementById("diff-corrected")!.textContent = fmt(prCorr - prc);
}

// ── Unified update ──

function update(): void {
  const r = Number(radiusSlider.value);
  const cssN = Number(exponentSlider.value);
  const mathN = Math.pow(2, cssN);

  radiusValue.textContent = `${r}px`;
  exponentValue.textContent = `n = ${cssN}`;

  updateOverlay(r, cssN, mathN);
  updateMathSvg(r, cssN, mathN);
}

// Initialize
update();
