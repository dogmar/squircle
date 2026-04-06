// CSS loaded via <link> tag in index.html
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
  circlePath.setAttribute(
    "d",
    `M ${cornerX} ${PAD + BOX} L ${cArc[0]!.x} ${cArc[0]!.y} ` +
      pointsToPath(cArc).slice(2) +
      ` L ${PAD} ${cornerY}`,
  );

  // Superellipse at same radius
  const sArc = superellipsePoints(clampedR, mathN).map((p) => arcToSvg(p.x, p.y, clampedR));
  superPath.setAttribute(
    "d",
    `M ${cornerX} ${PAD + BOX} L ${sArc[0]!.x} ${sArc[0]!.y} ` +
      pointsToPath(sArc).slice(2) +
      ` L ${PAD} ${cornerY}`,
  );

  // Corrected superellipse
  const corrArc = superellipsePoints(corrR, mathN).map((p) => arcToSvg(p.x, p.y, corrR));
  corrPath.setAttribute(
    "d",
    `M ${cornerX} ${PAD + BOX} L ${corrArc[0]!.x} ${corrArc[0]!.y} ` +
      pointsToPath(corrArc).slice(2) +
      ` L ${PAD} ${cornerY}`,
  );

  // Junction dots
  const cFirst = cArc[0]!,
    cLast = cArc[cArc.length - 1]!;
  cDotRight.setAttribute("cx", String(cFirst.x));
  cDotRight.setAttribute("cy", String(cFirst.y));
  cDotTop.setAttribute("cx", String(cLast.x));
  cDotTop.setAttribute("cy", String(cLast.y));

  const sFirst = sArc[0]!,
    sLast = sArc[sArc.length - 1]!;
  sDotRight.setAttribute("cx", String(sFirst.x));
  sDotRight.setAttribute("cy", String(sFirst.y));
  sDotTop.setAttribute("cx", String(sLast.x));
  sDotTop.setAttribute("cy", String(sLast.y));

  const corrFirst = corrArc[0]!,
    corrLast = corrArc[corrArc.length - 1]!;
  corrDotRight.setAttribute("cx", String(corrFirst.x));
  corrDotRight.setAttribute("cy", String(corrFirst.y));
  corrDotTop.setAttribute("cx", String(corrLast.x));
  corrDotTop.setAttribute("cy", String(corrLast.y));

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

// ── Section 3: Code Generator ──

const genTL = document.getElementById("gen-tl") as HTMLInputElement;
const genTR = document.getElementById("gen-tr") as HTMLInputElement;
const genBL = document.getElementById("gen-bl") as HTMLInputElement;
const genBR = document.getElementById("gen-br") as HTMLInputElement;
const genExponent = document.getElementById("gen-exponent") as HTMLInputElement;
const genExponentValue = document.getElementById("gen-exponent-value")!;
const genPreview = document.getElementById("gen-preview")!;
const genStyle = document.createElement("style");
document.head.appendChild(genStyle);
const genCss = document.getElementById("gen-css") as HTMLTextAreaElement;
const genTw = document.getElementById("gen-tw") as HTMLTextAreaElement;

function getGenMode(): string {
  const checked = document.querySelector<HTMLInputElement>('input[name="gen-mode"]:checked');
  return checked?.value ?? "corrected";
}

// Map pixel values to closest Tailwind radius token
const TW_RADII: [string, number][] = [
  ["none", 0],
  ["xs", 2],
  ["sm", 4],
  ["", 4],
  ["md", 6],
  ["lg", 8],
  ["xl", 12],
  ["2xl", 16],
  ["3xl", 24],
  ["4xl", 32],
  ["full", 9999],
];

function closestTwRadius(px: number): string {
  let best = TW_RADII[0]!;
  let bestDist = Math.abs(px - best[1]);
  for (const entry of TW_RADII) {
    const dist = Math.abs(px - entry[1]);
    if (dist < bestDist) {
      best = entry;
      bestDist = dist;
    }
  }
  // If no close match, use arbitrary value
  if (bestDist > 1) return `[${px}px]`;
  return best[0];
}

function twRadiusClass(prefix: string, token: string): string {
  if (token === "none") return `${prefix}-none`;
  if (token === "") return prefix;
  if (token.startsWith("[")) return `${prefix}-${token}`;
  return `${prefix}-${token}`;
}

function updateGenerator(): void {
  const tl = Number(genTL.value);
  const tr = Number(genTR.value);
  const bl = Number(genBL.value);
  const br = Number(genBR.value);
  const cssK = Number(genExponent.value);
  const mathN = Math.pow(2, cssK);
  const mode = getGenMode();

  genExponentValue.textContent = String(cssK);

  // Compute corrected radii
  const corrTL = correctedRadius(tl, mathN);
  const corrTR = correctedRadius(tr, mathN);
  const corrBL = correctedRadius(bl, mathN);
  const corrBR = correctedRadius(br, mathN);

  // Generate CSS declarations
  const allSame = tl === tr && tr === br && br === bl;
  let cssBody: string;

  if (mode === "round") {
    cssBody = allSame
      ? `border-radius: ${tl}px;`
      : `border-radius: ${tl}px ${tr}px ${br}px ${bl}px;`;
  } else if (mode === "superellipse") {
    const radius = allSame
      ? `border-radius: ${tl}px;`
      : `border-radius: ${tl}px ${tr}px ${br}px ${bl}px;`;
    cssBody = `${radius}\ncorner-shape: superellipse(${cssK});`;
  } else {
    const fallback = allSame
      ? `border-radius: ${tl}px;`
      : `border-radius: ${tl}px ${tr}px ${br}px ${bl}px;`;
    const corrected = allSame
      ? `  border-radius: ${corrTL.toFixed(1)}px;`
      : `  border-radius: ${corrTL.toFixed(1)}px ${corrTR.toFixed(1)}px ${corrBR.toFixed(1)}px ${corrBL.toFixed(1)}px;`;
    cssBody = [
      fallback,
      `@supports (corner-shape: superellipse()) {`,
      corrected,
      `  corner-shape: superellipse(${cssK});`,
      `}`,
    ].join("\n");
  }

  // Apply to preview via <style> element and show in textarea
  genPreview.removeAttribute("style");
  genStyle.textContent = `#gen-preview { ${cssBody} }`;
  genCss.value = cssBody;

  // Generate Tailwind classes
  let twClasses: string[];

  if (mode === "round") {
    if (allSame) {
      twClasses = [twRadiusClass("rounded", closestTwRadius(tl))];
    } else {
      twClasses = [
        twRadiusClass("rounded-tl", closestTwRadius(tl)),
        twRadiusClass("rounded-tr", closestTwRadius(tr)),
        twRadiusClass("rounded-br", closestTwRadius(br)),
        twRadiusClass("rounded-bl", closestTwRadius(bl)),
      ];
    }
  } else {
    const amtClass = cssK !== 2 ? `squircle-amt-[${cssK}]` : "";
    if (allSame) {
      twClasses = [twRadiusClass("squircle", closestTwRadius(tl))];
    } else {
      twClasses = [
        twRadiusClass("squircle-tl", closestTwRadius(tl)),
        twRadiusClass("squircle-tr", closestTwRadius(tr)),
        twRadiusClass("squircle-br", closestTwRadius(br)),
        twRadiusClass("squircle-bl", closestTwRadius(bl)),
      ];
    }
    if (amtClass) twClasses.push(amtClass);
  }
  genTw.value = twClasses.join(" ");
}

genTL.addEventListener("input", updateGenerator);
genTR.addEventListener("input", updateGenerator);
genBL.addEventListener("input", updateGenerator);
genBR.addEventListener("input", updateGenerator);
genExponent.addEventListener("input", updateGenerator);
document.querySelectorAll('input[name="gen-mode"]').forEach((el) => {
  el.addEventListener("change", updateGenerator);
});
updateGenerator();
