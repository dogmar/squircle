# Astro + React Islands Migration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the `website/` package from vanilla TypeScript to Astro with two independent React island components (MathExplorer, CodeGenerator).

**Architecture:** Astro renders static HTML (header, footer). Two React islands hydrate independently with their own state — no shared state between them. Each island has its own superellipse amount slider. `math.ts` is reused unchanged.

**Tech Stack:** Astro, @astrojs/react, React 19, @tailwindcss/vite (Tailwind CSS v4), TypeScript

**Spec:** `docs/superpowers/specs/2026-04-05-astro-react-islands-design.md`

---

## File Structure

```
website/
├── astro.config.mjs          (NEW — Astro + React + Tailwind v4 config)
├── package.json               (MODIFY — swap deps, update scripts)
├── tsconfig.json              (NEW — extends astro/tsconfigs/strict)
├── src/
│   ├── pages/
│   │   └── index.astro        (NEW — replaces index.html)
│   ├── components/
│   │   ├── MathExplorer.tsx   (NEW — SVG curves + formula + table + amount slider)
│   │   └── CodeGenerator.tsx  (NEW — amount/radius sliders + mode + preview + output)
│   ├── math.ts                (MOVE from src/math.ts — unchanged)
│   └── styles/
│       └── global.css         (MOVE from src/style.css — unchanged)
├── index.html                 (DELETE)
├── src/demo.ts                (DELETE)
├── src/style.css              (DELETE — moved to styles/global.css)
├── src/math.ts                (DELETE — moved to src/math.ts under new structure)
├── vite.config.ts             (DELETE — replaced by astro.config.mjs)
```

---

### Task 1: Scaffold Astro project

**Files:**

- Modify: `website/package.json`
- Create: `website/astro.config.mjs`
- Create: `website/tsconfig.json`
- Delete: `website/vite.config.ts`

- [ ] **Step 1: Update package.json**

Replace the contents of `website/package.json`:

```json
{
  "name": "website",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview"
  },
  "dependencies": {
    "@astrojs/react": "^4",
    "astro": "^5",
    "react": "^19",
    "react-dom": "^19"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.2.2",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "tailwindcss": "^4.2.2",
    "typescript": "~5.9.3"
  }
}
```

- [ ] **Step 2: Create astro.config.mjs**

```js
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
```

- [ ] **Step 3: Create tsconfig.json**

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "react"
  }
}
```

- [ ] **Step 4: Delete vite.config.ts**

```bash
rm website/vite.config.ts
```

- [ ] **Step 5: Install dependencies**

```bash
cd website && pnpm install
```

If the monorepo `vite` override in `pnpm-workspace.yaml` causes issues with Astro, add `vite` as a direct dependency in website/package.json pinned to the real vite version (e.g. `"vite": "^6"`), which will take precedence over the workspace override.

- [ ] **Step 6: Verify Astro starts**

```bash
cd website && pnpm dev
```

Expected: Astro dev server starts (will 404 since no pages exist yet). Kill it.

- [ ] **Step 7: Commit**

```bash
git add website/
git commit -m "chore(website): scaffold Astro project, swap vite-plus for astro"
```

---

### Task 2: Move static assets and create page shell

**Files:**

- Move: `website/src/style.css` → `website/src/styles/global.css`
- Move: `website/src/math.ts` stays at `website/src/math.ts`
- Create: `website/src/pages/index.astro`
- Delete: `website/index.html`
- Delete: `website/src/demo.ts`

- [ ] **Step 1: Reorganize files**

```bash
mkdir -p website/src/styles website/src/pages website/src/components
mv website/src/style.css website/src/styles/global.css
rm website/index.html website/src/demo.ts
```

- [ ] **Step 2: Create index.astro with static content**

Create `website/src/pages/index.astro`:

```astro
---
import "../styles/global.css";
---

<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>@klinking/tw-squircle — Interactive Demo</title>
  </head>
  <body class="min-h-screen bg-zinc-950 text-zinc-100">
    <div class="mx-auto max-w-5xl px-4 py-12">
      <header class="mb-8">
        <h1 class="text-3xl font-bold">@klinking/tw-squircle</h1>
        <p class="mt-2 text-zinc-400">
          Tailwind CSS v4 superellipse corner utilities with visual radius correction
        </p>
        <a
          href="https://github.com/dogmar/tw-squircle"
          class="mt-1 inline-block text-sm text-indigo-400 hover:underline"
        >GitHub</a>
      </header>
    </div>

    <div class="mx-auto max-w-5xl px-4 pt-8">
      <!-- MathExplorer island will go here -->
      <section class="mb-16">
        <p class="text-zinc-500">MathExplorer placeholder</p>
      </section>

      <!-- CodeGenerator island will go here -->
      <section class="mb-16">
        <p class="text-zinc-500">CodeGenerator placeholder</p>
      </section>

      <footer class="flex gap-4 border-t border-zinc-800 pt-6 text-xs text-zinc-600">
        <a href="https://www.npmjs.com/package/@klinking/tw-squircle" class="hover:text-zinc-400">npm</a>
        <a href="https://github.com/dogmar/tw-squircle" class="hover:text-zinc-400">GitHub</a>
        <a href="https://caniuse.com/?search=corner-shape" class="hover:text-zinc-400">Browser Support</a>
      </footer>
    </div>
  </body>
</html>
```

- [ ] **Step 3: Verify page loads**

```bash
cd website && pnpm dev
```

Expected: Page loads with header, placeholder text, and footer. Tailwind styles applied (dark background, white text).

- [ ] **Step 4: Commit**

```bash
git add website/
git commit -m "chore(website): create Astro page shell, move styles"
```

---

### Task 3: Build MathExplorer component

**Files:**

- Create: `website/src/components/MathExplorer.tsx`
- Modify: `website/src/pages/index.astro`

- [ ] **Step 1: Create MathExplorer.tsx**

Create `website/src/components/MathExplorer.tsx`. This component owns its amount slider, renders the SVG, formula readout, and comparison table.

```tsx
import { useState, useMemo } from "react";
import {
  correctedRadius,
  superellipsePoints,
  circleArcPoints,
  perceivedRadius,
  pointsToPath,
} from "../math";

interface Props {
  showRounded?: boolean;
  showSuperellipse?: boolean;
  showCorrected?: boolean;
  amount?: number;
}

const BOX = 180;
const PAD = 10;
const CORNER_X = PAD + BOX;
const CORNER_Y = PAD;
const DASH = "4 3";
const DASH_PERIOD = 7;

function arcToSvg(mathX: number, mathY: number, arcR: number) {
  return { x: CORNER_X - arcR + mathX, y: CORNER_Y + arcR - mathY };
}

function buildCurvePath(points: { x: number; y: number }[]) {
  const first = points[0]!;
  return (
    `M ${CORNER_X} ${PAD + BOX} L ${first.x} ${first.y} ` +
    pointsToPath(points).slice(2) +
    ` L ${PAD} ${CORNER_Y}`
  );
}

export default function MathExplorer({
  showRounded = true,
  showSuperellipse = true,
  showCorrected = true,
  amount: initialAmount = 1.5,
}: Props) {
  const [amount, setAmount] = useState(initialAmount);
  const [amountText, setAmountText] = useState(String(initialAmount));

  const data = useMemo(() => {
    const mathN = Math.pow(2, amount);

    // Auto-scale so largest curve fills the box
    const corrFactor = correctedRadius(1, mathN);
    const largestFactor = Math.max(1, corrFactor);
    const r = BOX / largestFactor;
    const corrR = correctedRadius(r, mathN);

    const cArc = circleArcPoints(r).map((p) => arcToSvg(p.x, p.y, r));
    const sArc = superellipsePoints(r, mathN).map((p) => arcToSvg(p.x, p.y, r));
    const corrArc = superellipsePoints(corrR, mathN).map((p) => arcToSvg(p.x, p.y, corrR));

    const prc = perceivedRadius(r, r, 2);
    const prs = perceivedRadius(r, r, mathN);
    const prCorr = perceivedRadius(r, corrR, mathN);

    return { mathN, r, corrR, cArc, sArc, corrArc, prc, prs, prCorr };
  }, [amount]);

  const { mathN, r, corrR, cArc, sArc, corrArc, prc, prs, prCorr } = data;
  const fmt = (v: number) => `${v >= 0 ? "+" : ""}${v.toFixed(1)}px`;

  function handleSlider(e: React.ChangeEvent<HTMLInputElement>) {
    const v = Number(e.target.value);
    setAmount(v);
    setAmountText(String(v));
  }

  function handleText(e: React.ChangeEvent<HTMLInputElement>) {
    setAmountText(e.target.value);
  }

  function commitText() {
    const num = parseFloat(amountText);
    if (!Number.isNaN(num)) {
      const clamped = Math.min(Math.max(num, -3), 3);
      setAmount(clamped);
      setAmountText(String(clamped));
    } else {
      setAmountText(String(amount));
    }
  }

  return (
    <div>
      {/* Amount slider */}
      <div class="mb-4">
        <label class="text-xs tracking-wider text-zinc-500 uppercase">Superellipse Amount</label>
        <div class="mt-1 flex items-center gap-3">
          <input
            type="range"
            min="-3"
            max="3"
            step="0.1"
            value={amount}
            onChange={handleSlider}
            className="slider-unfilled"
          />
          <input
            type="text"
            value={amountText}
            onChange={handleText}
            onBlur={commitText}
            onKeyDown={(e) => e.key === "Enter" && commitText()}
            className="w-10 bg-transparent text-right font-mono text-sm text-amber-400 outline-none"
          />
        </div>
      </div>

      {/* SVG */}
      <div className="inline-block rounded-lg border border-zinc-800 bg-zinc-900 p-4">
        <svg viewBox="0 0 200 200" className="h-64 w-64">
          {/* Bounding box */}
          <rect
            x={PAD}
            y={PAD}
            width={BOX}
            height={BOX}
            fill="none"
            stroke="#3f3f46"
            strokeWidth="1"
          />

          {/* Circle curve */}
          {showRounded && (
            <>
              <path
                d={buildCurvePath(cArc)}
                fill="none"
                style={{ stroke: "var(--color-rounded-border)" }}
                strokeWidth="1.5"
                strokeDasharray={DASH}
                strokeDashoffset="0"
              />
              <circle
                cx={cArc[0]!.x}
                cy={cArc[0]!.y}
                r="2"
                style={{ fill: "var(--color-rounded-border)" }}
              />
              <circle
                cx={cArc[cArc.length - 1]!.x}
                cy={cArc[cArc.length - 1]!.y}
                r="2"
                style={{ fill: "var(--color-rounded-border)" }}
              />
            </>
          )}

          {/* Superellipse curve */}
          {showSuperellipse && (
            <>
              <path
                d={buildCurvePath(sArc)}
                fill="none"
                style={{ stroke: "var(--color-squircle-border)" }}
                strokeWidth="1.5"
                strokeDasharray={DASH}
                strokeDashoffset={String(-DASH_PERIOD / 3)}
              />
              <circle
                cx={sArc[0]!.x}
                cy={sArc[0]!.y}
                r="3.5"
                fill="none"
                style={{ stroke: "var(--color-squircle-border)" }}
                strokeWidth="1"
              />
              <circle
                cx={sArc[sArc.length - 1]!.x}
                cy={sArc[sArc.length - 1]!.y}
                r="3.5"
                fill="none"
                style={{ stroke: "var(--color-squircle-border)" }}
                strokeWidth="1"
              />
            </>
          )}

          {/* Corrected superellipse curve */}
          {showCorrected && (
            <>
              <path
                d={buildCurvePath(corrArc)}
                fill="none"
                style={{ stroke: "var(--color-adjusted-border)" }}
                strokeWidth="1.5"
                strokeDasharray={DASH}
                strokeDashoffset={String((-2 * DASH_PERIOD) / 3)}
              />
              <circle
                cx={corrArc[0]!.x}
                cy={corrArc[0]!.y}
                r="5.5"
                fill="none"
                style={{ stroke: "var(--color-adjusted-border)" }}
                strokeWidth="1"
              />
              <circle
                cx={corrArc[corrArc.length - 1]!.x}
                cy={corrArc[corrArc.length - 1]!.y}
                r="5.5"
                fill="none"
                style={{ stroke: "var(--color-adjusted-border)" }}
                strokeWidth="1"
              />
            </>
          )}
        </svg>
      </div>

      {/* Formula readout */}
      <div className="mt-6 max-w-lg">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-3 font-mono text-sm">
          <div className="mb-1 text-zinc-500">Correction formula:</div>
          <div className="text-indigo-400">
            r' = <span className="text-amber-400">{r.toFixed(1)}</span> &times; (1 - 2
            <sup>-&frac12;</sup>) / (1 - 2
            <sup>
              -1/<span className="text-amber-400">{mathN.toFixed(1)}</span>
            </sup>
            )
          </div>
          <div className="mt-1 text-zinc-100">
            = <strong>{corrR.toFixed(1)}</strong>px
          </div>

          {/* Comparison table */}
          <table className="mt-3 w-full border-t border-zinc-800 pt-2 text-xs">
            <thead>
              <tr className="text-zinc-500">
                <th className="pt-2 pb-1 text-left font-medium"></th>
                <th className="pt-2 pb-1 text-right font-medium">Radius</th>
                <th className="pt-2 pb-1 text-right font-medium">Perceived Radius</th>
                <th className="pt-2 pb-1 text-right font-medium">Diff</th>
              </tr>
            </thead>
            <tbody>
              <tr className="text-red-400">
                <td>Circle</td>
                <td className="text-right">{r.toFixed(1)}px</td>
                <td className="text-right">{prc.toFixed(1)}px</td>
                <td className="text-right">{fmt(0)}</td>
              </tr>
              <tr className="text-indigo-400">
                <td>Superellipse</td>
                <td className="text-right">{r.toFixed(1)}px</td>
                <td className="text-right">{prs.toFixed(1)}px</td>
                <td className="text-right">{fmt(prs - prc)}</td>
              </tr>
              <tr className="text-emerald-400">
                <td>Corrected</td>
                <td className="text-right">{corrR.toFixed(1)}px</td>
                <td className="text-right">{prCorr.toFixed(1)}px</td>
                <td className="text-right">{fmt(prCorr - prc)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Wire into index.astro**

Replace the MathExplorer placeholder in `website/src/pages/index.astro`:

```astro
---
import "../styles/global.css";
import MathExplorer from "../components/MathExplorer";
---
```

Replace the placeholder section:

```astro
<section class="mb-16">
  <h3 class="mb-3 text-sm font-medium tracking-wider text-zinc-500 uppercase">
    Math Explorer
  </h3>
  <MathExplorer
    client:load
    showRounded={true}
    showSuperellipse={true}
    showCorrected={true}
  />
</section>
```

- [ ] **Step 3: Verify MathExplorer renders**

```bash
cd website && pnpm dev
```

Expected: SVG curves render, amount slider controls them, formula readout and table update reactively.

- [ ] **Step 4: Commit**

```bash
git add website/src/components/MathExplorer.tsx website/src/pages/index.astro
git commit -m "feat(website): add MathExplorer React island"
```

---

### Task 4: Build CodeGenerator component

**Files:**

- Create: `website/src/components/CodeGenerator.tsx`
- Modify: `website/src/pages/index.astro`

- [ ] **Step 1: Create CodeGenerator.tsx**

Create `website/src/components/CodeGenerator.tsx`:

```tsx
import { useState, useMemo } from "react";

// ── Tailwind token mapping ──

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
  if (bestDist > 1) return `[${px}px]`;
  return best[0];
}

function twRadiusClass(prefix: string, token: string): string {
  if (token === "none") return `${prefix}-none`;
  if (token === "") return prefix;
  return `${prefix}-${token}`;
}

// ── CSS generation helpers ──

function parseCssLength(value: string): { num: number; unit: string } | null {
  const match = value.match(/^(-?[\d.]+)\s*(%|[a-z]+)?$/i);
  if (!match) return null;
  return { num: Number(match[1]), unit: match[2] ?? "px" };
}

function correctionFactor(cssK: number): number {
  const n = Math.pow(2, cssK);
  return (1 - Math.pow(2, -0.5)) / (1 - Math.pow(2, -1 / n));
}

function cssCorrectedRadius(value: string, cssK: number): string {
  const factor = correctionFactor(cssK);
  const parsed = parseCssLength(value);
  if (parsed) {
    const result = parsed.num * factor;
    return `${Number(result.toFixed(2))}${parsed.unit}`;
  }
  return `calc(${value} * ${Number(factor.toFixed(6))})`;
}

function radiusShorthand(corners: string[]): string {
  const [tl, tr, br, bl] = corners;
  if (tl === tr && tr === br && br === bl) return tl!;
  return `${tl} ${tr} ${br} ${bl}`;
}

type CornerMode = "round" | "superellipse" | "corrected";

// ── Component ──

export default function CodeGenerator() {
  const [amount, setAmount] = useState(2);
  const [amountText, setAmountText] = useState("2");
  const [radius, setRadius] = useState(60);
  const [radiusText, setRadiusText] = useState("60px");
  const [mode, setMode] = useState<CornerMode>("corrected");

  const { cssOutput, twOutput, previewStyle } = useMemo(() => {
    const r = `${radius}px`;
    const corners = [r, r, r, r];
    const cssK = amount;
    const rv = radiusShorthand(corners);
    const SEL = ".your-selector";
    const lines: string[] = [];
    let previewCss: Record<string, string> = {};

    if (mode === "round") {
      lines.push(`${SEL} {`, `  border-radius: ${rv};`, `}`);
      previewCss = { borderRadius: rv };
    } else if (mode === "superellipse") {
      lines.push(
        `${SEL} {`,
        `  border-radius: ${rv};`,
        `  corner-shape: superellipse(${cssK});`,
        `}`,
      );
      previewCss = { borderRadius: rv, cornerShape: `superellipse(${cssK})` };
    } else {
      const corrected = corners.map((c) => cssCorrectedRadius(c, cssK));
      const corrRv = radiusShorthand(corrected);
      lines.push(`${SEL} {`, `  border-radius: ${rv};`, `}`, ``);
      lines.push(`@supports (corner-shape: superellipse()) {`);
      lines.push(
        `  ${SEL} {`,
        `    border-radius: ${corrRv};`,
        `    corner-shape: superellipse(${cssK});`,
        `  }`,
        `}`,
      );
      previewCss = { borderRadius: corrRv, cornerShape: `superellipse(${cssK})` };
    }

    // Tailwind classes
    const parsed = corners.map(parseCssLength);
    const allNumericPx = parsed.every((p) => p !== null && (p.unit === "px" || p.unit === ""));
    let twClasses: string[];

    if (mode === "round") {
      const prefixes = ["rounded-tl", "rounded-tr", "rounded-br", "rounded-bl"] as const;
      twClasses = allNumericPx
        ? prefixes.map((p, i) => twRadiusClass(p, closestTwRadius(parsed[i]!.num)))
        : prefixes.map((p, i) => `${p}-[${corners[i]}]`);
    } else {
      const prefixes = ["squircle-tl", "squircle-tr", "squircle-br", "squircle-bl"] as const;
      twClasses = allNumericPx
        ? prefixes.map((p, i) => twRadiusClass(p, closestTwRadius(parsed[i]!.num)))
        : prefixes.map((p, i) => `${p}-[${corners[i]}]`);
      if (cssK !== 2) twClasses.push(`squircle-amt-[${cssK}]`);
    }

    return {
      cssOutput: lines.join("\n"),
      twOutput: twClasses.join(" "),
      previewStyle: previewCss,
    };
  }, [amount, radius, mode]);

  // ── Slider handlers ──

  function handleAmountSlider(e: React.ChangeEvent<HTMLInputElement>) {
    const v = Number(e.target.value);
    setAmount(v);
    setAmountText(String(v));
  }

  function handleAmountText(e: React.ChangeEvent<HTMLInputElement>) {
    setAmountText(e.target.value);
  }

  function commitAmountText() {
    const num = parseFloat(amountText);
    if (!Number.isNaN(num)) {
      const clamped = Math.min(Math.max(num, -3), 3);
      setAmount(clamped);
      setAmountText(String(clamped));
    } else {
      setAmountText(String(amount));
    }
  }

  function handleRadiusSlider(e: React.ChangeEvent<HTMLInputElement>) {
    const v = Number(e.target.value);
    setRadius(v);
    setRadiusText(`${v}px`);
  }

  function handleRadiusText(e: React.ChangeEvent<HTMLInputElement>) {
    setRadiusText(e.target.value);
  }

  function commitRadiusText() {
    const num = parseFloat(radiusText);
    if (!Number.isNaN(num)) {
      const clamped = Math.min(Math.max(num, 0), 160);
      setRadius(clamped);
      setRadiusText(`${clamped}px`);
    } else {
      setRadiusText(`${radius}px`);
    }
  }

  return (
    <div>
      <h2 className="mb-4 text-xl font-bold">Code Generator</h2>
      <p className="mb-6 text-sm text-zinc-400">
        Adjust the radius and superellipse amount, then copy the generated CSS or Tailwind classes.
      </p>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Left: Controls + Preview */}
        <div className="min-w-0 flex-1">
          {/* Amount slider */}
          <div className="mb-4">
            <label className="text-xs tracking-wider text-zinc-500 uppercase">
              Superellipse Amount
            </label>
            <div className="mt-1 flex items-center gap-3">
              <input
                type="range"
                min="-3"
                max="3"
                step="0.1"
                value={amount}
                onChange={handleAmountSlider}
                className="slider-unfilled"
              />
              <input
                type="text"
                value={amountText}
                onChange={handleAmountText}
                onBlur={commitAmountText}
                onKeyDown={(e) => e.key === "Enter" && commitAmountText()}
                className="w-10 bg-transparent text-right font-mono text-sm text-amber-400 outline-none"
              />
            </div>
          </div>

          {/* Radius slider */}
          <div className="mb-4">
            <label className="text-xs tracking-wider text-zinc-500 uppercase">Border Radius</label>
            <div className="mt-1 flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="160"
                step="1"
                value={radius}
                onChange={handleRadiusSlider}
                className="slider-filled"
              />
              <input
                type="text"
                value={radiusText}
                onChange={handleRadiusText}
                onBlur={commitRadiusText}
                onKeyDown={(e) => e.key === "Enter" && commitRadiusText()}
                className="w-12 bg-transparent text-right font-mono text-sm text-indigo-400 outline-none"
              />
            </div>
          </div>

          {/* Mode radio */}
          <fieldset className="mb-6">
            <legend className="mb-2 text-xs tracking-wider text-zinc-500 uppercase">
              Corner Mode
            </legend>
            <div className="flex gap-4">
              {(["round", "superellipse", "corrected"] as const).map((value) => (
                <label key={value} className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="gen-mode"
                    value={value}
                    checked={mode === value}
                    onChange={() => setMode(value)}
                    className="accent-indigo-500"
                  />
                  <span>
                    {value === "round"
                      ? "Round"
                      : value === "superellipse"
                        ? "Superellipse"
                        : "Corrected Superellipse"}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Preview */}
          <div className="flex items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 p-8">
            <div className="h-40 w-56 bg-indigo-500" style={previewStyle} />
          </div>
        </div>

        {/* Right: Generated code */}
        <div className="min-w-0 flex-1 space-y-4">
          <div>
            <label className="mb-1 block text-xs tracking-wider text-zinc-500 uppercase">CSS</label>
            <textarea
              readOnly
              rows={10}
              value={cssOutput}
              className="w-full resize-none rounded border border-zinc-700 bg-zinc-900 p-3 font-mono text-xs leading-relaxed text-zinc-300 select-all focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs tracking-wider text-zinc-500 uppercase">
              Tailwind Classes
            </label>
            <textarea
              readOnly
              rows={3}
              value={twOutput}
              className="w-full resize-none rounded border border-zinc-700 bg-zinc-900 p-3 font-mono text-xs leading-relaxed text-zinc-300 select-all focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Wire into index.astro**

Add the import at the top of `website/src/pages/index.astro`:

```astro
---
import "../styles/global.css";
import MathExplorer from "../components/MathExplorer";
import CodeGenerator from "../components/CodeGenerator";
---
```

Replace the CodeGenerator placeholder section:

```astro
<section class="mb-16">
  <CodeGenerator client:visible />
</section>
```

- [ ] **Step 3: Verify CodeGenerator renders**

```bash
cd website && pnpm dev
```

Expected: Both islands render independently. Each has its own amount slider. Radius slider and mode radios control the code output. Preview updates. CSS and Tailwind textareas populate.

- [ ] **Step 4: Commit**

```bash
git add website/src/components/CodeGenerator.tsx website/src/pages/index.astro
git commit -m "feat(website): add CodeGenerator React island"
```

---

### Task 5: Verify build and clean up

**Files:**

- Modify: `website/src/pages/index.astro` (if needed)

- [ ] **Step 1: Run production build**

```bash
cd website && pnpm build
```

Expected: Astro builds successfully, outputs static HTML to `dist/`.

- [ ] **Step 2: Preview production build**

```bash
cd website && pnpm preview
```

Expected: Site loads, both islands hydrate, all interactions work.

- [ ] **Step 3: Update deploy workflow artifact path if needed**

Check `.github/workflows/deploy-site.yml` — it references `website/dist` which should still be correct for Astro's default output.

- [ ] **Step 4: Run linter from monorepo root**

```bash
npx vp check --fix
```

Expected: No errors.

- [ ] **Step 5: Commit any fixes**

```bash
git add -A
git commit -m "chore(website): finalize Astro migration, clean up"
```
