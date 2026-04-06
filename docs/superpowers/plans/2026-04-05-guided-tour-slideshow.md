# Guided Tour Slideshow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the static MathExplorer with an animated guided tour that teaches how superellipse radius correction works, then transitions into free exploration.

**Architecture:** A `GuidedExplorer` component orchestrates navigation state across a flat list of slides. Each slide defines React content with `<Animate inStep outStep>` elements for progressive reveal, plus a `steps[]` array controlling SVG graphic state. The SVG rendering is extracted into `ExplorerGraphic` and animated via Framer Motion. After the tour, the component transitions to free-explore mode with sliders.

**Tech Stack:** React 19, Framer Motion, Tailwind CSS v4, Astro 5

**Spec:** `docs/superpowers/specs/2026-04-05-guided-tour-slideshow-design.md`

---

## File Map

| File                                         | Action    | Responsibility                                                                             |
| -------------------------------------------- | --------- | ------------------------------------------------------------------------------------------ |
| `website/src/components/Animate.tsx`         | Create    | `<Animate inStep outStep>` visibility component + `SlideStepContext` + `useSlideStep` hook |
| `website/src/components/ExplorerGraphic.tsx` | Create    | Animated SVG visualization (extracted from MathExplorer, uses `motion.*` elements)         |
| `website/src/components/SlideControls.tsx`   | Create    | Back/Next buttons + step dot indicator                                                     |
| `website/src/components/slides.tsx`          | Create    | Slide definitions (content + steps array)                                                  |
| `website/src/components/FreeExplorer.tsx`    | Create    | Slider/toggle controls for free exploration mode                                           |
| `website/src/components/GuidedExplorer.tsx`  | Create    | Orchestrator: state, navigation logic, layout, mode switching                              |
| `website/src/pages/index.astro`              | Modify    | Replace `<MathExplorer>` with `<GuidedExplorer>`                                           |
| `website/src/components/MathExplorer.tsx`    | Delete    | Replaced by ExplorerGraphic + GuidedExplorer                                               |
| `website/src/math.ts`                        | No change | Pure math functions stay as-is                                                             |

---

### Task 1: Install Framer Motion

**Files:**

- Modify: `website/package.json`

- [ ] **Step 1: Install framer-motion**

```bash
cd website && npm install framer-motion
```

- [ ] **Step 2: Verify installation**

```bash
cd website && node -e "require('framer-motion'); console.log('OK')"
```

Expected: `OK`

- [ ] **Step 3: Verify dev server still starts**

```bash
cd website && npm run dev &
sleep 3 && curl -s http://localhost:4321 | head -5
kill %1
```

Expected: HTML output from Astro

- [ ] **Step 4: Commit**

```bash
cd website && git add package.json package-lock.json
git commit -m "chore: add framer-motion dependency"
```

---

### Task 2: Create Animate Component + SlideStepContext

**Files:**

- Create: `website/src/components/Animate.tsx`

This is the foundational building block. It provides:

1. `SlideStepContext` — React context holding the current step index
2. `SlideStepProvider` — context provider wrapping slide content
3. `useSlideStep()` — hook to read the current step
4. `<Animate inStep outStep>` — component that shows/hides children based on step

- [ ] **Step 1: Create Animate.tsx**

```tsx
// website/src/components/Animate.tsx
import { createContext, useContext } from "react";
import { AnimatePresence, motion, type MotionProps } from "framer-motion";

const SlideStepContext = createContext<number>(0);

export function SlideStepProvider({ step, children }: { step: number; children: React.ReactNode }) {
  return <SlideStepContext.Provider value={step}>{children}</SlideStepContext.Provider>;
}

export function useSlideStep() {
  return useContext(SlideStepContext);
}

const defaultInitial: MotionProps = { initial: { opacity: 0, y: 8 } };
const defaultAnimate: MotionProps = { animate: { opacity: 1, y: 0 } };
const defaultExit: MotionProps = { exit: { opacity: 0, y: -8 } };

export function Animate({
  inStep,
  outStep,
  children,
  initial,
  animate,
  exit,
}: {
  inStep: number;
  outStep?: number;
  children: React.ReactNode;
  initial?: MotionProps["initial"];
  animate?: MotionProps["animate"];
  exit?: MotionProps["exit"];
}) {
  const currentStep = useSlideStep();
  const visible = currentStep >= inStep && (outStep == null || currentStep < outStep);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key={`animate-${inStep}`}
          initial={initial ?? { opacity: 0, y: 8 }}
          animate={animate ?? { opacity: 1, y: 0 }}
          exit={exit ?? { opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: Verify the file compiles**

```bash
cd website && npx tsc --noEmit src/components/Animate.tsx 2>&1 || npx astro check 2>&1 | head -20
```

Expected: No type errors related to Animate.tsx

- [ ] **Step 3: Commit**

```bash
git add website/src/components/Animate.tsx
git commit -m "feat: add Animate component and SlideStepContext"
```

---

### Task 3: Extract ExplorerGraphic from MathExplorer

**Files:**

- Create: `website/src/components/ExplorerGraphic.tsx`
- Reference: `website/src/components/MathExplorer.tsx` (read only — don't modify yet)
- Reference: `website/src/math.ts` (unchanged)

Extract the SVG rendering from MathExplorer into a standalone component that takes `GraphicState` as props. Key differences from MathExplorer:

- No internal state — all values come from props
- Uses `motion.g` for animated visibility (opacity transitions on show/hide)
- The `amount` prop drives the math computation via `useMemo` (same as before)

The `amount` animation (smooth K-value sweeps) will be handled by the parent `GuidedExplorer` via Framer Motion's `useSpring` — this component just renders whatever `amount` it receives.

- [ ] **Step 1: Define the GraphicState type and create ExplorerGraphic**

Create `website/src/components/ExplorerGraphic.tsx`. This component:

- Exports the `GraphicState` type
- Accepts `GraphicState` as props
- Contains all SVG rendering logic from MathExplorer (lines 18-425)
- Keeps the same constants (`BOX`, `PAD`, `cornerX`, etc.) and helper functions (`arcToSvg`, `buildCurvePath`)
- Uses `motion.g` with animated `opacity` for curve group visibility instead of conditional rendering (`{showRounded && ...}` → always render, animate opacity)
- Keeps the `useMemo` computation for math data

```tsx
// website/src/components/ExplorerGraphic.tsx
import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  circleArcPoints,
  correctedRadius,
  perceivedRadius,
  pointsToPath,
  superellipsePoints,
} from "../math";

export type GraphicState = {
  showRounded: boolean;
  showSuperellipse: boolean;
  showCorrected: boolean;
  amount: number;
  showMeasurement: boolean;
  measureArc?: "rounded" | "superellipse" | "corrected";
};

const BOX = 180;
const PAD = 10;
const PAD_EXTRA = 20;
const cornerX = PAD + BOX;
const cornerY = PAD;
const DASH = "4 3";
const DASH_PERIOD = 7;
const SERIF_LEN = 14;
const SERIF_W = 1;

function arcToSvg(mathX: number, mathY: number, arcR: number) {
  return { x: cornerX - arcR + mathX, y: cornerY + arcR - mathY };
}

function buildCurvePath(points: { x: number; y: number }[]) {
  const first = points[0]!;
  return (
    `M ${cornerX} ${PAD + BOX} L ${first.x} ${first.y} ` +
    pointsToPath(points).slice(2) +
    ` L ${PAD} ${cornerY}`
  );
}

export default function ExplorerGraphic({
  showRounded,
  showSuperellipse,
  showCorrected,
  amount,
  showMeasurement,
  measureArc,
}: GraphicState) {
  const data = useMemo(() => {
    // Same math computation as MathExplorer lines 52-128
    const mathN = Math.pow(2, amount);
    const corrFactor = correctedRadius(1, mathN);
    const largestFactor = Math.max(1, corrFactor);
    const r = BOX / largestFactor;
    const corrR = correctedRadius(r, mathN);

    const circleRaw = circleArcPoints(r);
    const circleSvg = circleRaw.map((p) => arcToSvg(p.x, p.y, r));
    const superRaw = superellipsePoints(r, mathN);
    const superSvg = superRaw.map((p) => arcToSvg(p.x, p.y, r));
    const corrRaw = superellipsePoints(corrR, mathN);
    const corrSvg = corrRaw.map((p) => arcToSvg(p.x, p.y, corrR));

    const circlePath = buildCurvePath(circleSvg);
    const superPath = buildCurvePath(superSvg);
    const corrPath = buildCurvePath(corrSvg);
    const circleClip = circlePath + " Z";
    const superClip = superPath + " Z";
    const corrClip = corrPath + " Z";

    let measure: {
      endX: number;
      endY: number;
      ratio: number;
      cssVar: string;
    } | null = null;
    if (measureArc) {
      const arcR = measureArc === "corrected" ? corrR : r;
      const n = measureArc === "rounded" ? 2 : mathN;
      const d = arcR * (1 - Math.pow(2, -1 / n));
      const endX = cornerX - d;
      const endY = cornerY + d;
      const lineLen = Math.sqrt(2) * d;
      const ratio = lineLen / r;
      const cssVar =
        measureArc === "rounded"
          ? "--color-rounded-border"
          : measureArc === "superellipse"
            ? "--color-squircle-border"
            : "--color-adjusted-border";
      measure = { endX, endY, ratio, cssVar };
    }

    return {
      r,
      circleSvg,
      superSvg,
      corrSvg,
      circlePath,
      superPath,
      corrPath,
      circleClip,
      superClip,
      corrClip,
      measure,
      refLine: {
        x1: cornerX - r,
        y1: cornerY + r,
        x2: cornerX - r + r / Math.SQRT2,
        y2: cornerY + r - r / Math.SQRT2,
      },
    };
  }, [amount, measureArc]);

  const {
    circleSvg,
    superSvg,
    corrSvg,
    circlePath,
    superPath,
    corrPath,
    circleClip,
    superClip,
    corrClip,
    measure,
    refLine,
  } = data;

  return (
    <svg
      viewBox={`${PAD} ${PAD - PAD_EXTRA} ${BOX + PAD_EXTRA} ${BOX + PAD_EXTRA}`}
      className="w-full max-w-md"
    >
      <defs>
        <clipPath id="clip-circle">
          <path d={circleClip} />
        </clipPath>
        <clipPath id="clip-super">
          <path d={superClip} />
        </clipPath>
        <clipPath id="clip-corr">
          <path d={corrClip} />
        </clipPath>
      </defs>

      {/* Circle arc group — animated opacity for show/hide */}
      <motion.g animate={{ opacity: showRounded ? 1 : 0 }} transition={{ duration: 0.4 }}>
        {/* Same SVG elements as MathExplorer lines 221-248 */}
        <path
          d={circlePath}
          fill="none"
          style={{ stroke: "var(--color-rounded-border)" }}
          strokeWidth={3}
          strokeDasharray={DASH}
          strokeDashoffset={0}
          clipPath="url(#clip-circle)"
        />
        <line
          x1={circleSvg[0]!.x}
          y1={circleSvg[0]!.y - SERIF_W / 2}
          x2={circleSvg[0]!.x - SERIF_LEN}
          y2={circleSvg[0]!.y - SERIF_W / 2}
          style={{ stroke: "var(--color-rounded-border)" }}
          strokeWidth={SERIF_W}
        />
        <line
          x1={circleSvg[circleSvg.length - 1]!.x + SERIF_W / 2}
          y1={circleSvg[circleSvg.length - 1]!.y}
          x2={circleSvg[circleSvg.length - 1]!.x + SERIF_W / 2}
          y2={circleSvg[circleSvg.length - 1]!.y + SERIF_LEN}
          style={{ stroke: "var(--color-rounded-border)" }}
          strokeWidth={SERIF_W}
        />
      </motion.g>

      {/* Superellipse group — animated opacity */}
      <motion.g animate={{ opacity: showSuperellipse ? 1 : 0 }} transition={{ duration: 0.4 }}>
        {/* Same SVG elements as MathExplorer lines 253-281 */}
        <path
          d={superPath}
          fill="none"
          style={{ stroke: "var(--color-squircle-border)" }}
          strokeWidth={3}
          strokeDasharray={DASH}
          strokeDashoffset={-DASH_PERIOD / 3}
          clipPath="url(#clip-super)"
        />
        <line
          x1={superSvg[0]!.x}
          y1={superSvg[0]!.y - SERIF_W / 2}
          x2={superSvg[0]!.x + SERIF_LEN}
          y2={superSvg[0]!.y - SERIF_W / 2}
          style={{ stroke: "var(--color-squircle-border)" }}
          strokeWidth={SERIF_W}
        />
        <line
          x1={superSvg[superSvg.length - 1]!.x + SERIF_W / 2}
          y1={superSvg[superSvg.length - 1]!.y}
          x2={superSvg[superSvg.length - 1]!.x + SERIF_W / 2}
          y2={superSvg[superSvg.length - 1]!.y - SERIF_LEN}
          style={{ stroke: "var(--color-squircle-border)" }}
          strokeWidth={SERIF_W}
        />
      </motion.g>

      {/* Corrected superellipse group — animated opacity */}
      <motion.g animate={{ opacity: showCorrected ? 1 : 0 }} transition={{ duration: 0.4 }}>
        {/* Same SVG elements as MathExplorer lines 285-348 */}
        <path
          d={corrPath}
          fill="none"
          style={{ stroke: "var(--color-adjusted-border)" }}
          strokeWidth={3}
          strokeDasharray={DASH}
          strokeDashoffset={(-2 * DASH_PERIOD) / 3}
          clipPath="url(#clip-corr)"
        />
        <line
          x1={corrSvg[0]!.x + SERIF_LEN / 2}
          y1={corrSvg[0]!.y - SERIF_W / 2}
          x2={corrSvg[0]!.x - SERIF_LEN / 2}
          y2={corrSvg[0]!.y - SERIF_W / 2}
          style={{ stroke: "var(--color-adjusted-border)" }}
          strokeWidth={SERIF_W}
        />
        <line
          x1={corrSvg[0]!.x + SERIF_LEN / 2}
          y1={corrSvg[0]!.y - SERIF_W / 2 - 4}
          x2={corrSvg[0]!.x + SERIF_LEN / 2}
          y2={corrSvg[0]!.y - SERIF_W / 2 + 4}
          stroke="black"
          strokeWidth={1}
        />
        <line
          x1={corrSvg[0]!.x - SERIF_LEN / 2}
          y1={corrSvg[0]!.y - SERIF_W / 2 - 4}
          x2={corrSvg[0]!.x - SERIF_LEN / 2}
          y2={corrSvg[0]!.y - SERIF_W / 2 + 4}
          stroke="black"
          strokeWidth={1}
        />
        <line
          x1={corrSvg[corrSvg.length - 1]!.x + SERIF_W / 2}
          y1={corrSvg[corrSvg.length - 1]!.y - SERIF_LEN / 2}
          x2={corrSvg[corrSvg.length - 1]!.x + SERIF_W / 2}
          y2={corrSvg[corrSvg.length - 1]!.y + SERIF_LEN / 2}
          style={{ stroke: "var(--color-adjusted-border)" }}
          strokeWidth={SERIF_W}
        />
        <line
          x1={corrSvg[corrSvg.length - 1]!.x + SERIF_W / 2 - 4}
          y1={corrSvg[corrSvg.length - 1]!.y - SERIF_LEN / 2}
          x2={corrSvg[corrSvg.length - 1]!.x + SERIF_W / 2 + 4}
          y2={corrSvg[corrSvg.length - 1]!.y - SERIF_LEN / 2}
          stroke="black"
          strokeWidth={1}
        />
        <line
          x1={corrSvg[corrSvg.length - 1]!.x + SERIF_W / 2 - 4}
          y1={corrSvg[corrSvg.length - 1]!.y + SERIF_LEN / 2}
          x2={corrSvg[corrSvg.length - 1]!.x + SERIF_W / 2 + 4}
          y2={corrSvg[corrSvg.length - 1]!.y + SERIF_LEN / 2}
          stroke="black"
          strokeWidth={1}
        />
      </motion.g>

      {/* Measurement line — animated opacity */}
      <motion.g
        animate={{ opacity: showMeasurement && measure ? 1 : 0 }}
        transition={{ duration: 0.4 }}
      >
        {measure && (
          <>
            <line
              x1={cornerX}
              y1={cornerY}
              x2={measure.endX}
              y2={measure.endY}
              style={{ stroke: `var(${measure.cssVar})` }}
              strokeWidth={0.75}
              strokeDasharray="1 4"
              strokeLinecap="round"
            />
            <line
              x1={measure.endX - 24 / Math.SQRT2}
              y1={measure.endY - 24 / Math.SQRT2}
              x2={measure.endX + 24 / Math.SQRT2}
              y2={measure.endY + 24 / Math.SQRT2}
              style={{ stroke: `var(${measure.cssVar})` }}
              strokeWidth={0.75}
            />
            {(() => {
              const midX = (cornerX + measure.endX) / 2;
              const midY = (cornerY + measure.endY) / 2;
              const svgW = PAD * 2 + BOX;
              const nearTop = midY - 6 < 12;
              const nearRight = midX + 6 + 24 > svgW;
              const lx = nearRight ? midX - 28 : midX + 6;
              const ly = nearTop ? midY + 12 : midY - 6;
              return (
                <text x={lx} y={ly} fill="currentColor" fontSize={9} className="text-zinc-400">
                  {measure.ratio.toFixed(2)}
                </text>
              );
            })()}
          </>
        )}
      </motion.g>

      {/* Reference line (always visible) */}
      <g>
        <line
          x1={refLine.x1}
          y1={refLine.y1}
          x2={refLine.x2}
          y2={refLine.y2}
          style={{ stroke: "var(--color-rounded-border)" }}
          strokeWidth={0.75}
          strokeDasharray="1 4"
          strokeLinecap="round"
        />
        <line
          x1={refLine.x2 - 5 / Math.SQRT2}
          y1={refLine.y2 - 5 / Math.SQRT2}
          x2={refLine.x2 + 5 / Math.SQRT2}
          y2={refLine.y2 + 5 / Math.SQRT2}
          style={{ stroke: "var(--color-rounded-border)" }}
          strokeWidth={0.75}
        />
        <text
          x={(refLine.x1 + refLine.x2) / 2 - 10}
          y={(refLine.y1 + refLine.y2) / 2 - 4}
          fill="currentColor"
          fontSize={9}
          className="text-zinc-400"
        >
          1
        </text>
      </g>
    </svg>
  );
}
```

- [ ] **Step 2: Verify it compiles**

```bash
cd website && npx tsc --noEmit 2>&1 | head -20
```

Expected: No errors for ExplorerGraphic.tsx

- [ ] **Step 3: Commit**

```bash
git add website/src/components/ExplorerGraphic.tsx
git commit -m "feat: extract ExplorerGraphic from MathExplorer with motion.g animation"
```

---

### Task 4: Create SlideControls

**Files:**

- Create: `website/src/components/SlideControls.tsx`

Simple Back/Next buttons with a step dot indicator showing progress within the current slide.

- [ ] **Step 1: Create SlideControls.tsx**

```tsx
// website/src/components/SlideControls.tsx
export default function SlideControls({
  onBack,
  onNext,
  canGoBack,
  canGoNext,
  currentStep,
  totalSteps,
  nextLabel,
}: {
  onBack: () => void;
  onNext: () => void;
  canGoBack: boolean;
  canGoNext: boolean;
  currentStep: number;
  totalSteps: number;
  nextLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between pt-4">
      <button
        onClick={onBack}
        disabled={!canGoBack}
        className="rounded-md px-4 py-2 text-sm font-medium text-zinc-400 transition-colors hover:text-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        Back
      </button>

      {/* Step dots */}
      <div className="flex gap-1.5">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div
            key={i}
            className={`h-1.5 w-1.5 rounded-full transition-colors ${
              i <= currentStep ? "bg-zinc-300" : "bg-zinc-700"
            }`}
          />
        ))}
      </div>

      <button
        onClick={onNext}
        disabled={!canGoNext}
        className="rounded-md bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-200 transition-colors hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        {nextLabel ?? "Next"}
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

```bash
cd website && npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add website/src/components/SlideControls.tsx
git commit -m "feat: add SlideControls component with Back/Next and step dots"
```

---

### Task 5: Create FreeExplorer

**Files:**

- Create: `website/src/components/FreeExplorer.tsx`
- Reference: `website/src/components/MathExplorer.tsx:131-199` (slider + text input logic)

Extract the slider controls and comparison table from MathExplorer into FreeExplorer. This component is shown after the tour ends. It receives the current `GraphicState` and a callback to update it.

- [ ] **Step 1: Create FreeExplorer.tsx**

```tsx
// website/src/components/FreeExplorer.tsx
import { useState } from "react";
import { useMemo } from "react";
import { correctedRadius, perceivedRadius } from "../math";
import type { GraphicState } from "./ExplorerGraphic";

export default function FreeExplorer({
  graphicState,
  onGraphicStateChange,
}: {
  graphicState: GraphicState;
  onGraphicStateChange: (state: Partial<GraphicState>) => void;
}) {
  const [amountText, setAmountText] = useState(String(graphicState.amount));

  function handleTextCommit(value: string) {
    const parsed = parseFloat(value);
    if (isNaN(parsed)) {
      setAmountText(String(graphicState.amount));
      return;
    }
    const clamped = Math.min(3, Math.max(-3, parsed));
    onGraphicStateChange({ amount: clamped });
    setAmountText(String(clamped));
  }

  const stats = useMemo(() => {
    const mathN = Math.pow(2, graphicState.amount);
    const corrFactor = correctedRadius(1, mathN);
    const largestFactor = Math.max(1, corrFactor);
    const r = 180 / largestFactor;
    const corrR = correctedRadius(r, mathN);
    const circlePerceived = perceivedRadius(r, r, 2);
    const superPerceived = perceivedRadius(r, r, mathN);
    const corrPerceived = perceivedRadius(r, corrR, mathN);
    return { mathN, r, corrR, circlePerceived, superPerceived, corrPerceived };
  }, [graphicState.amount]);

  function formatDiff(d: number) {
    const sign = d >= 0 ? "+" : "";
    return `${sign}${d.toFixed(1)}px`;
  }

  return (
    <div>
      {/* Amount slider */}
      <div className="mb-4 flex items-center gap-3">
        <label className="text-sm font-medium text-zinc-400">Superellipse Amount</label>
        <input
          type="range"
          min={-3}
          max={3}
          step={0.1}
          value={graphicState.amount}
          className="slider-unfilled"
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            onGraphicStateChange({ amount: v });
            setAmountText(String(Math.round(v * 10) / 10));
          }}
        />
        <input
          type="text"
          value={amountText}
          className="w-10 bg-transparent text-amber-400"
          onChange={(e) => setAmountText(e.target.value)}
          onBlur={(e) => handleTextCommit(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleTextCommit(e.currentTarget.value);
          }}
        />
      </div>

      {/* Curve toggles */}
      <div className="mb-4 flex gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={graphicState.showRounded}
            onChange={(e) => onGraphicStateChange({ showRounded: e.target.checked })}
          />
          <span style={{ color: "var(--color-rounded-border)" }}>Circle</span>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={graphicState.showSuperellipse}
            onChange={(e) => onGraphicStateChange({ showSuperellipse: e.target.checked })}
          />
          <span style={{ color: "var(--color-squircle-border)" }}>Superellipse</span>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={graphicState.showCorrected}
            onChange={(e) => onGraphicStateChange({ showCorrected: e.target.checked })}
          />
          <span style={{ color: "var(--color-adjusted-border)" }}>Corrected</span>
        </label>
      </div>

      {/* Comparison table */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 text-sm">
        <p className="font-mono text-zinc-300">
          r' = {stats.r.toFixed(1)} &times; (1 - 2<sup>-1/2</sup>) / (1 - 2
          <sup>-1/{stats.mathN.toFixed(2)}</sup>)
        </p>
        <p className="font-mono text-zinc-400">= {stats.corrR.toFixed(1)}px</p>
        <table className="mt-3 w-full text-left text-xs">
          <thead>
            <tr className="text-zinc-500">
              <th className="py-1 pr-4">Curve</th>
              <th className="py-1 pr-4">Radius</th>
              <th className="py-1 pr-4">Perceived Radius</th>
              <th className="py-1">Diff</th>
            </tr>
          </thead>
          <tbody className="font-mono text-zinc-300">
            <tr>
              <td className="py-1 pr-4" style={{ color: "var(--color-rounded-border)" }}>
                Circle
              </td>
              <td className="py-1 pr-4">{stats.r.toFixed(1)}px</td>
              <td className="py-1 pr-4">{stats.circlePerceived.toFixed(1)}px</td>
              <td className="py-1">{formatDiff(0)}</td>
            </tr>
            <tr>
              <td className="py-1 pr-4" style={{ color: "var(--color-squircle-border)" }}>
                Superellipse
              </td>
              <td className="py-1 pr-4">{stats.r.toFixed(1)}px</td>
              <td className="py-1 pr-4">{stats.superPerceived.toFixed(1)}px</td>
              <td className="py-1">{formatDiff(stats.superPerceived - stats.circlePerceived)}</td>
            </tr>
            <tr>
              <td className="py-1 pr-4" style={{ color: "var(--color-adjusted-border)" }}>
                Corrected
              </td>
              <td className="py-1 pr-4">{stats.corrR.toFixed(1)}px</td>
              <td className="py-1 pr-4">{stats.corrPerceived.toFixed(1)}px</td>
              <td className="py-1">{formatDiff(stats.corrPerceived - stats.circlePerceived)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

```bash
cd website && npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add website/src/components/FreeExplorer.tsx
git commit -m "feat: add FreeExplorer with sliders, toggles, and comparison table"
```

---

### Task 6: Create Slide Definitions

**Files:**

- Create: `website/src/components/slides.tsx`
- Reference: `website/src/components/Animate.tsx` (uses `<Animate>`)
- Reference: `website/src/components/ExplorerGraphic.tsx` (uses `GraphicState`)

Define the narrative slides. Each slide has `content` (React nodes with `<Animate>` elements) and `steps[]` (graphic state partials). This is where the educational content lives.

- [ ] **Step 1: Create slides.tsx with the Slide type and initial slides**

```tsx
// website/src/components/slides.tsx
import { Animate } from "./Animate";
import type { GraphicState } from "./ExplorerGraphic";

export type StepDef = {
  graphic?: Partial<GraphicState>;
  transition?: { duration?: number; ease?: string };
};

export type Slide = {
  content: React.ReactNode;
  steps: StepDef[];
};

export const slides: Slide[] = [
  // Slide 0: The Rounded Corner
  {
    content: (
      <>
        <Animate inStep={0}>
          <h2 className="text-xl font-bold text-zinc-100">The Rounded Corner</h2>
        </Animate>
        <Animate inStep={0}>
          <p className="mt-3 text-zinc-400">
            CSS <code className="text-zinc-300">border-radius</code> draws a quarter-circle arc to
            round each corner. It's the standard way to soften a rectangle.
          </p>
        </Animate>
        <Animate inStep={1}>
          <p className="mt-3 text-zinc-400">
            The arc starts and ends abruptly — there's a sharp change in curvature where the circle
            meets the straight edge.
          </p>
        </Animate>
      </>
    ),
    steps: [
      { graphic: { showRounded: true, amount: 1.5 } },
      { graphic: { showMeasurement: true, measureArc: "rounded" } },
    ],
  },

  // Slide 1: The Superellipse
  {
    content: (
      <>
        <Animate inStep={0}>
          <h2 className="text-xl font-bold text-zinc-100">The Superellipse</h2>
        </Animate>
        <Animate inStep={0}>
          <p className="mt-3 text-zinc-400">
            A superellipse (or "squircle") uses the formula{" "}
            <code className="text-zinc-300">
              |x|<sup>n</sup> + |y|<sup>n</sup> = r<sup>n</sup>
            </code>{" "}
            to create a smoother curve that tapers gradually into the straight edge.
          </p>
        </Animate>
        <Animate inStep={1}>
          <p className="mt-3 text-zinc-400">
            But look closely — with the same radius value, the superellipse appears{" "}
            <em className="text-zinc-200">smaller</em> than the circular arc. The perceived corner
            radius shrinks.
          </p>
        </Animate>
        <Animate inStep={2}>
          <p className="mt-3 text-zinc-400">
            Watch what happens as we increase the superellipse exponent K...
          </p>
        </Animate>
        <Animate inStep={2} outStep={3}>
          <p className="mt-2 text-sm text-zinc-500 italic">
            The gap between the curves grows larger.
          </p>
        </Animate>
      </>
    ),
    steps: [
      { graphic: { showSuperellipse: true } },
      { graphic: { measureArc: "superellipse" } },
      { graphic: { amount: 3 }, transition: { duration: 1.5 } },
      { graphic: { amount: 1.5 }, transition: { duration: 1 } },
    ],
  },

  // Slide 2: The Correction
  {
    content: (
      <>
        <Animate inStep={0}>
          <h2 className="text-xl font-bold text-zinc-100">The Correction</h2>
        </Animate>
        <Animate inStep={0}>
          <p className="mt-3 text-zinc-400">
            We can compute a corrected radius that compensates for the superellipse geometry, so the{" "}
            <em>perceived</em> corner size matches the original circle.
          </p>
        </Animate>
        <Animate inStep={1}>
          <p className="mt-3 text-zinc-400">
            The corrected curve (gold) now has the same visual weight as the circular arc — the
            perceived radii match exactly.
          </p>
        </Animate>
        <Animate inStep={2}>
          <p className="mt-3 text-zinc-400">
            This is what <code className="text-zinc-300">@klinking/tw-squircle</code> does
            automatically — you specify the visual radius you want, and it calculates the
            mathematical radius needed.
          </p>
        </Animate>
      </>
    ),
    steps: [
      {
        graphic: {
          showCorrected: true,
          showMeasurement: true,
          measureArc: "corrected",
        },
      },
      { graphic: {} },
      { graphic: {} },
    ],
  },
];
```

- [ ] **Step 2: Verify it compiles**

```bash
cd website && npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add website/src/components/slides.tsx
git commit -m "feat: add slide definitions for guided tour narrative"
```

---

### Task 7: Create GuidedExplorer Orchestrator

**Files:**

- Create: `website/src/components/GuidedExplorer.tsx`
- Reference: `website/src/components/Animate.tsx` (SlideStepProvider)
- Reference: `website/src/components/ExplorerGraphic.tsx` (GraphicState)
- Reference: `website/src/components/SlideControls.tsx`
- Reference: `website/src/components/FreeExplorer.tsx`
- Reference: `website/src/components/slides.tsx`

This is the orchestrator. It manages:

- `slideIndex` / `stepIndex` / `mode` state
- Computing the cumulative `GraphicState` by replaying all steps
- Animated `amount` interpolation via `useSpring`
- Navigation (next/back) logic
- Layout (responsive grid)
- Mode switching (tour → explore)

- [ ] **Step 1: Create GuidedExplorer.tsx**

```tsx
// website/src/components/GuidedExplorer.tsx
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  type SpringOptions,
} from "framer-motion";
import { SlideStepProvider } from "./Animate";
import ExplorerGraphic, { type GraphicState } from "./ExplorerGraphic";
import SlideControls from "./SlideControls";
import FreeExplorer from "./FreeExplorer";
import { slides } from "./slides";

const INITIAL_GRAPHIC_STATE: GraphicState = {
  showRounded: false,
  showSuperellipse: false,
  showCorrected: false,
  amount: 1.5,
  showMeasurement: false,
  measureArc: undefined,
};

const SPRING_CONFIG: SpringOptions = {
  stiffness: 80,
  damping: 20,
  mass: 1,
};

function computeGraphicState(slideIndex: number, stepIndex: number): GraphicState {
  let state = { ...INITIAL_GRAPHIC_STATE };
  for (let si = 0; si <= slideIndex; si++) {
    const slide = slides[si]!;
    const maxStep = si === slideIndex ? stepIndex : slide.steps.length - 1;
    for (let sti = 0; sti <= maxStep; sti++) {
      const step = slide.steps[sti];
      if (step?.graphic) {
        state = { ...state, ...step.graphic };
      }
    }
  }
  return state;
}

export default function GuidedExplorer() {
  const [slideIndex, setSlideIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [mode, setMode] = useState<"tour" | "explore">("tour");
  const [exploreState, setExploreState] = useState<GraphicState | null>(null);

  // Compute target graphic state from slide/step position
  const targetState = useMemo(
    () => computeGraphicState(slideIndex, stepIndex),
    [slideIndex, stepIndex],
  );

  // Get the current step's transition config
  const currentTransition = slides[slideIndex]?.steps[stepIndex]?.transition;

  // Animated amount using spring
  const amountMotion = useMotionValue(targetState.amount);
  const amountSpring = useSpring(amountMotion, {
    ...SPRING_CONFIG,
    ...(currentTransition?.duration
      ? { stiffness: 60, damping: 15, mass: currentTransition.duration }
      : {}),
  });

  // Track the animated amount value for rendering
  const [animatedAmount, setAnimatedAmount] = useState(targetState.amount);

  useEffect(() => {
    amountMotion.set(targetState.amount);
    const unsubscribe = amountSpring.on("change", (v) => {
      setAnimatedAmount(v);
    });
    return unsubscribe;
  }, [targetState.amount, amountMotion, amountSpring]);

  // The graphic state passed to ExplorerGraphic
  const graphicState: GraphicState =
    mode === "explore" && exploreState ? exploreState : { ...targetState, amount: animatedAmount };

  const currentSlide = slides[slideIndex]!;
  const isLastStep = stepIndex >= currentSlide.steps.length - 1;
  const isLastSlide = slideIndex >= slides.length - 1;

  const handleNext = useCallback(() => {
    if (mode === "explore") return;
    if (isLastStep) {
      if (isLastSlide) {
        // Transition to explore mode
        setExploreState({ ...targetState });
        setMode("explore");
      } else {
        setSlideIndex((s) => s + 1);
        setStepIndex(0);
      }
    } else {
      setStepIndex((s) => s + 1);
    }
  }, [mode, isLastStep, isLastSlide, targetState]);

  const handleBack = useCallback(() => {
    if (mode === "explore") {
      setMode("tour");
      setExploreState(null);
      return;
    }
    if (stepIndex > 0) {
      setStepIndex((s) => s - 1);
    } else if (slideIndex > 0) {
      const prevSlide = slides[slideIndex - 1]!;
      setSlideIndex((s) => s - 1);
      setStepIndex(prevSlide.steps.length - 1);
    }
  }, [mode, stepIndex, slideIndex]);

  const handleExploreChange = useCallback((partial: Partial<GraphicState>) => {
    setExploreState((prev) => (prev ? { ...prev, ...partial } : null));
  }, []);

  const canGoBack = mode === "explore" || slideIndex > 0 || stepIndex > 0;
  const canGoNext = mode !== "explore";

  return (
    <div className="grid gap-8 md:grid-cols-2 md:items-start">
      {/* Left: SVG Graphic */}
      <div>
        <ExplorerGraphic {...graphicState} />
      </div>

      {/* Right: Content Panel */}
      <div className="flex min-h-[300px] flex-col">
        <div className="flex-1">
          {mode === "tour" ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={slideIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <SlideStepProvider step={stepIndex}>{currentSlide.content}</SlideStepProvider>
              </motion.div>
            </AnimatePresence>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl font-bold text-zinc-100">Explore</h2>
              <p className="mt-2 mb-4 text-zinc-400">
                Adjust the parameters and see how they affect the curves.
              </p>
              <FreeExplorer
                graphicState={exploreState!}
                onGraphicStateChange={handleExploreChange}
              />
            </motion.div>
          )}
        </div>

        {mode === "tour" && (
          <SlideControls
            onBack={handleBack}
            onNext={handleNext}
            canGoBack={canGoBack}
            canGoNext={canGoNext}
            currentStep={stepIndex}
            totalSteps={currentSlide.steps.length}
            nextLabel={isLastStep && isLastSlide ? "Explore" : undefined}
          />
        )}

        {mode === "explore" && (
          <div className="pt-4">
            <button
              onClick={handleBack}
              className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              &larr; Back to tour
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

```bash
cd website && npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add website/src/components/GuidedExplorer.tsx
git commit -m "feat: add GuidedExplorer orchestrator with navigation and animated state"
```

---

### Task 8: Wire Up in index.astro and Delete MathExplorer

**Files:**

- Modify: `website/src/pages/index.astro`
- Delete: `website/src/components/MathExplorer.tsx`

- [ ] **Step 1: Update index.astro**

Replace the MathExplorer import and usage with GuidedExplorer:

In `website/src/pages/index.astro`:

- Change line 3: `import MathExplorer from "../components/MathExplorer";` → `import GuidedExplorer from "../components/GuidedExplorer";`
- Replace lines 32-38 (the `<MathExplorer ... />` element) with:
  ```astro
  <GuidedExplorer client:load />
  ```

The full modified section should look like:

```astro
---
import "../styles/global.css";
import GuidedExplorer from "../components/GuidedExplorer";
import CodeGenerator from "../components/CodeGenerator";
---

<!-- ... header unchanged ... -->

    <div class="mx-auto max-w-5xl px-4 pt-8">
      <section class="mb-16">
        <h3 class="mb-3 text-sm font-medium tracking-wider text-zinc-500 uppercase">
          Math Explorer
        </h3>
        <GuidedExplorer client:load />
      </section>
```

- [ ] **Step 2: Delete MathExplorer.tsx**

```bash
rm website/src/components/MathExplorer.tsx
```

- [ ] **Step 3: Verify the dev server starts and renders correctly**

```bash
cd website && npm run dev &
sleep 3 && curl -s http://localhost:4321 | grep -q "GuidedExplorer" || echo "Check manually"
kill %1
```

Then manually verify in a browser: `http://localhost:4321`

- Page loads without errors
- SVG graphic is visible
- Clicking "Next" advances through steps
- Text reveals progressively within each slide
- SVG animates smoothly between states
- At the last step, "Explore" button transitions to free mode
- "Back to tour" returns to the guided tour

- [ ] **Step 4: Commit**

```bash
git add website/src/pages/index.astro
git rm website/src/components/MathExplorer.tsx
git commit -m "feat: replace MathExplorer with GuidedExplorer in index.astro"
```

---

### Task 9: Verify End-to-End

**Files:** None (verification only)

- [ ] **Step 1: Run the dev server**

```bash
cd website && npm run dev
```

- [ ] **Step 2: Manual verification checklist**

Open `http://localhost:4321` in a browser and verify:

1. **Slide 0 loads**: "The Rounded Corner" title visible, circle arc drawn in SVG
2. **Click Next**: Step 1 reveals additional text, measurement line appears on graphic
3. **Click Next**: Advances to Slide 1 "The Superellipse", text panel transitions, superellipse curve fades in
4. **Click through Slide 1**: Measurement switches, K-value sweeps smoothly from 1.5 to 3, then back
5. **Click through Slide 2**: Corrected curve appears, measurement line updates
6. **Last step → Explore**: Button says "Explore", clicking it shows sliders/toggles
7. **Free explore**: Slider changes K value in real-time, checkboxes toggle curves
8. **Back to tour**: "Back to tour" link returns to the last slide
9. **Backward navigation**: From any step, "Back" goes to previous step/slide correctly
10. **Responsive layout**: Resize browser — side-by-side on desktop, stacked on mobile

- [ ] **Step 3: Run the build**

```bash
cd website && npm run build
```

Expected: Build completes without errors.

- [ ] **Step 4: Final commit if any fixes were needed**

```bash
git add -A && git commit -m "fix: address issues found during e2e verification"
```

Only run this if fixes were applied. Skip if verification passed cleanly.
