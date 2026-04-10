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
const radiusValue = document.getElementById("radius-value") as HTMLInputElement;
const exponentValue = document.getElementById("exponent-value") as HTMLInputElement;

radiusSlider.addEventListener("input", () => {
  radiusValue.value = `${radiusSlider.value}px`;
  update();
  updateGenerator();
});
exponentSlider.addEventListener("input", () => {
  exponentValue.value = exponentSlider.value;
  update();
  updateGenerator();
});
radiusValue.addEventListener("change", () => {
  const num = parseFloat(radiusValue.value);
  if (!Number.isNaN(num)) {
    radiusSlider.value = String(Math.min(Math.max(num, 0), 160));
  }
  update();
  updateGenerator();
});
exponentValue.addEventListener("change", () => {
  const num = parseFloat(exponentValue.value);
  if (!Number.isNaN(num)) {
    exponentSlider.value = String(Math.min(Math.max(num, -3), 3));
  }
  update();
  updateGenerator();
});

// ── Math Explorer ──

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

const DASH = "4 3";
const DASH_PERIOD = 7;

const circlePath = document.createElementNS(NS, "path");
circlePath.setAttribute("fill", "none");
circlePath.style.stroke = "var(--color-rounded-border)";
circlePath.setAttribute("stroke-width", "1.5");
circlePath.setAttribute("stroke-dasharray", DASH);
circlePath.setAttribute("stroke-dashoffset", "0");
svgEl.appendChild(circlePath);

const superPath = document.createElementNS(NS, "path");
superPath.setAttribute("fill", "none");
superPath.style.stroke = "var(--color-squircle-border)";
superPath.setAttribute("stroke-width", "1.5");
superPath.setAttribute("stroke-dasharray", DASH);
superPath.setAttribute("stroke-dashoffset", String(-DASH_PERIOD / 3));
svgEl.appendChild(superPath);

const corrPath = document.createElementNS(NS, "path");
corrPath.setAttribute("fill", "none");
corrPath.style.stroke = "var(--color-adjusted-border)";
corrPath.setAttribute("stroke-width", "1.5");
corrPath.setAttribute("stroke-dasharray", DASH);
corrPath.setAttribute("stroke-dashoffset", String((-2 * DASH_PERIOD) / 3));
svgEl.appendChild(corrPath);

function makeFilledDot(cssVar: string, diameter: number): SVGCircleElement {
  const dot = document.createElementNS(NS, "circle");
  dot.setAttribute("r", String(diameter / 2));
  dot.style.fill = `var(${cssVar})`;
  svgEl.appendChild(dot);
  return dot;
}

function makeRingDot(cssVar: string, diameter: number, strokeWidth: number): SVGCircleElement {
  const dot = document.createElementNS(NS, "circle");
  dot.setAttribute("r", String((diameter - strokeWidth) / 2));
  dot.setAttribute("fill", "none");
  dot.style.stroke = `var(${cssVar})`;
  dot.setAttribute("stroke-width", String(strokeWidth));
  svgEl.appendChild(dot);
  return dot;
}

const cDotTop = makeFilledDot("--color-rounded-border", 4);
const cDotRight = makeFilledDot("--color-rounded-border", 4);
const sDotTop = makeRingDot("--color-squircle-border", 8, 1);
const sDotRight = makeRingDot("--color-squircle-border", 8, 1);
const corrDotTop = makeRingDot("--color-adjusted-border", 12, 1);
const corrDotRight = makeRingDot("--color-adjusted-border", 12, 1);

function arcToSvg(mathX: number, mathY: number, arcR: number): { x: number; y: number } {
  return { x: cornerX - arcR + mathX, y: cornerY + arcR - mathY };
}

function updateMathSvg(cssN: number, mathN: number): void {
  // Auto-scale: find r so the largest curve exactly fills the box
  const corrFactor = correctedRadius(1, mathN);
  const largestFactor = Math.max(1, corrFactor);
  const r = BOX / largestFactor;
  const corrR = correctedRadius(r, mathN);

  // Circle
  const cArc = circleArcPoints(r).map((p) => arcToSvg(p.x, p.y, r));
  circlePath.setAttribute(
    "d",
    `M ${cornerX} ${PAD + BOX} L ${cArc[0]!.x} ${cArc[0]!.y} ` +
      pointsToPath(cArc).slice(2) +
      ` L ${PAD} ${cornerY}`,
  );

  // Superellipse at same radius
  const sArc = superellipsePoints(r, mathN).map((p) => arcToSvg(p.x, p.y, r));
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
  document.getElementById("formula-r")!.textContent = r.toFixed(1);
  document.getElementById("formula-result")!.textContent = corrR.toFixed(1);

  const prc = perceivedRadius(r, r, 2);
  const prs = perceivedRadius(r, r, mathN);
  const prCorr = perceivedRadius(r, corrR, mathN);

  document.getElementById("radius-circle")!.textContent = `${r.toFixed(1)}px`;
  document.getElementById("radius-superellipse")!.textContent = `${r.toFixed(1)}px`;
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

  radiusValue.value = `${r}px`;
  exponentValue.value = String(cssN);

  updateMathSvg(cssN, mathN);
}

// ── Section 3: Code Generator ──

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

// Parse a CSS value into numeric part + unit, or null if dynamic
function parseCssLength(value: string): { num: number; unit: string } | null {
  const match = value.match(/^(-?[\d.]+)\s*(%|[a-z]+)?$/i);
  if (!match) return null;
  return { num: Number(match[1]), unit: match[2] ?? "px" };
}

// Correction factor: (1 - 2^(-0.5)) / (1 - 2^(-1/n)) where n = 2^cssK
function correctionFactor(cssK: number): number {
  const n = Math.pow(2, cssK);
  return (1 - Math.pow(2, -0.5)) / (1 - Math.pow(2, -1 / n));
}

// Build the smartest possible corrected radius expression
function cssCorrectedRadius(value: string, cssK: number): string {
  const factor = correctionFactor(cssK);
  const parsed = parseCssLength(value);
  if (parsed) {
    // Fully static — compute the final value
    const result = parsed.num * factor;
    return `${Number(result.toFixed(2))}${parsed.unit}`;
  }
  // Dynamic value — multiply by pre-computed factor
  return `calc(${value} * ${Number(factor.toFixed(6))})`;
}

function radiusShorthand(corners: string[]): string {
  const [tl, tr, br, bl] = corners;
  if (tl === tr && tr === br && br === bl) return tl!;
  return `${tl} ${tr} ${br} ${bl}`;
}

function updateGenerator(): void {
  const r = `${radiusSlider.value}px`;
  const corners = [r, r, r, r];
  const cssK = Number(exponentSlider.value);
  const mode = getGenMode();

  const SEL = ".your-selector";
  const lines: string[] = [];
  const previewDecls: string[] = [];
  const radius = radiusShorthand(corners);

  if (mode === "round") {
    lines.push(`${SEL} {`);
    lines.push(`  border-radius: ${radius};`);
    lines.push(`}`);
    previewDecls.push(`border-radius: ${radius};`);
  } else if (mode === "superellipse") {
    lines.push(`${SEL} {`);
    lines.push(`  border-radius: ${radius};`);
    lines.push(`  corner-shape: superellipse(${cssK});`);
    lines.push(`}`);
    previewDecls.push(`border-radius: ${radius};`);
    previewDecls.push(`corner-shape: superellipse(${cssK});`);
  } else {
    const corrected = corners.map((c) => cssCorrectedRadius(c, cssK));
    const correctedRadius = radiusShorthand(corrected);

    lines.push(`${SEL} {`);
    lines.push(`  border-radius: ${radius};`);
    lines.push(`}`);
    lines.push(``);
    lines.push(`@supports (corner-shape: superellipse(2)) {`);
    lines.push(`  ${SEL} {`);
    lines.push(`    border-radius: ${correctedRadius};`);
    lines.push(`    corner-shape: superellipse(${cssK});`);
    lines.push(`  }`);
    lines.push(`}`);

    previewDecls.push(`border-radius: ${correctedRadius};`);
    previewDecls.push(`corner-shape: superellipse(${cssK});`);
  }

  // Apply to preview via <style> element and show user-facing CSS in textarea
  genPreview.removeAttribute("style");
  genStyle.textContent = `#gen-preview { ${previewDecls.join(" ")} }`;
  genCss.value = lines.join("\n");

  // Generate Tailwind classes
  const parsed = corners.map(parseCssLength);
  const allNumericPx = parsed.every((p) => p !== null && (p.unit === "px" || p.unit === ""));
  let twClasses: string[];

  if (mode === "round") {
    const prefixes = ["rounded-tl", "rounded-tr", "rounded-br", "rounded-bl"] as const;
    if (allNumericPx) {
      twClasses = prefixes.map((p, i) => twRadiusClass(p, closestTwRadius(parsed[i]!.num)));
    } else {
      twClasses = prefixes.map((p, i) => `${p}-[${corners[i]}]`);
    }
  } else {
    const prefixes = ["squircle-tl", "squircle-tr", "squircle-br", "squircle-bl"] as const;
    if (allNumericPx) {
      twClasses = prefixes.map((p, i) => twRadiusClass(p, closestTwRadius(parsed[i]!.num)));
    } else {
      twClasses = prefixes.map((p, i) => `${p}-[${corners[i]}]`);
    }
    if (cssK !== 2) twClasses.push(`squircle-amt-[${cssK}]`);
  }
  genTw.value = twClasses.join(" ");
}

document.querySelectorAll('input[name="gen-mode"]').forEach((el) => {
  el.addEventListener("change", updateGenerator);
});

// Initialize
update();
updateGenerator();
