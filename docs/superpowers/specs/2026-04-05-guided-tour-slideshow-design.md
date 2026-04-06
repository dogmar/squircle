# Guided Tour Slideshow for MathExplorer

## Context

The current MathExplorer is an interactive SVG visualization with sliders for exploring the superellipse math. It assumes the user already understands the problem. This guided tour replaces MathExplorer with a step-by-step presentation that teaches _why_ this library exists: regular rounded corners (CSS border-radius) don't match the visual appearance of superellipse curves, and the corrected version fixes this. After the guided tour, the component transitions into free exploration mode with sliders.

## Architecture

### Component Tree

```
GuidedExplorer           — orchestrator, replaces MathExplorer in index.astro
  ├─ ExplorerGraphic     — animated SVG visualization (extracted from MathExplorer)
  ├─ SlideContent        — text/content panel per slide
  │    └─ <Animate>      — controls element visibility per step
  ├─ SlideControls       — Back / Next buttons + step indicator
  └─ FreeExplorer        — sliders + toggles (shown in "explore" mode only)
```

### File Structure

```
website/src/components/
  ├─ GuidedExplorer.tsx    — orchestrator (state, navigation, layout)
  ├─ ExplorerGraphic.tsx   — animated SVG (extracted from MathExplorer.tsx)
  ├─ Animate.tsx           — <Animate inStep outStep> component
  ├─ SlideControls.tsx     — Back/Next buttons + step dots
  ├─ slides.tsx            — slide definitions (content + steps array)
  └─ FreeExplorer.tsx      — sliders/toggles for free exploration mode
```

### Dependencies

- **framer-motion** (new) — SVG path animation, element enter/exit, spring-based number interpolation

## Data Model

### GraphicState

The visual state of the SVG graphic. All fields are required in the full state; step definitions provide partials that merge into the running state.

```typescript
type GraphicState = {
  showRounded: boolean;
  showSuperellipse: boolean;
  showCorrected: boolean;
  amount: number; // K value (-3 to 3)
  showMeasurement: boolean;
  measureArc?: "rounded" | "superellipse" | "corrected";
};
```

### Slide

Each slide defines all of its content upfront and declares an ordered list of steps. Steps control both graphic state changes and which `<Animate>` elements are visible.

```typescript
type Slide = {
  content: React.ReactNode; // Full React content, uses <Animate> for reveals
  steps: StepDef[]; // Graphic state per step
};

type StepDef = {
  graphic?: Partial<GraphicState>; // Merges into running state
  transition?: {
    duration?: number; // Seconds (default 0.5)
    ease?: string; // Easing function
  };
};
```

### Animate Component

Controls visibility of content within a slide based on the current step index.

```typescript
type AnimateProps = {
  inStep: number; // Appears when step >= inStep
  outStep?: number; // Disappears when step >= outStep (omit = stays)
  children: React.ReactNode;
  // Optional Framer Motion overrides (defaults: fade up in, fade up out)
  initial?: MotionProps;
  animate?: MotionProps;
  exit?: MotionProps;
};
```

Visibility rule: `inStep <= currentStep < outStep` (when outStep is defined) or `inStep <= currentStep` (when omitted).

Uses `AnimatePresence` internally for enter/exit animations.

A `useSlideStep()` hook (via React context) provides the current step index to `<Animate>` components.

## State Management

### Navigation State

```typescript
slideIndex: number; // Current slide (0-based)
stepIndex: number; // Current step within current slide (0-based)
mode: "tour" | "explore";
```

### Graphic State Computation

The graphic state **carries forward across slides**. To compute the current graphic state:

1. Start with an initial state (all hidden, amount: 1.5)
2. Replay all steps from slide 0, step 0 through the current slide/step
3. Each step's `graphic` partial merges into the running state
4. The result drives the SVG rendering

Going backward: decrement stepIndex (or go to previous slide's last step), then recompute by replaying from scratch.

### Transition to Free Explore

After the last step of the last slide, clicking "Next" sets `mode: "explore"`. The text panel is replaced with sliders and toggles (FreeExplorer). The graphic state becomes directly user-controlled.

## ExplorerGraphic (SVG Component)

Extracted from current `MathExplorer.tsx`. Receives `GraphicState` as props. Key changes for animation:

- **SVG paths**: Use `motion.path` with animated `d` attribute — Framer Motion interpolates SVG path data between states
- **Visibility**: Use `motion.g` with animated `opacity` (0→1 or 1→0) for showing/hiding curve groups
- **Measurement lines**: Use `motion.line` with animated coordinate attributes
- **K value (amount)**: Use Framer Motion's `useSpring` to interpolate the numeric amount value over time, triggering React re-renders through the existing `useMemo` math pipeline

The existing pure-math functions in `math.ts` are unchanged.

## Layout

**Desktop (>=768px)**: Side-by-side — ExplorerGraphic on the left, SlideContent + SlideControls on the right.

**Mobile (<768px)**: Stacked — ExplorerGraphic on top, SlideContent + SlideControls below.

Uses Tailwind responsive utilities (`md:grid-cols-2`).

## Narrative Flow (Example)

The exact slide content will be authored separately, but the general arc:

1. **The Rounded Corner**: Show CSS border-radius circular arc. Explain how it works.
2. **The Superellipse**: Overlay the superellipse curve. Point out the visual mismatch — the perceived radius is smaller.
3. **Why They Differ**: Show measurement lines. Explain the geometric reason.
4. **Increasing K**: Animate K value sweep to show the effect gets worse at higher values.
5. **The Correction**: Show the corrected superellipse overlaid, matching the perceived radius.
6. **Free Explore**: Transition to interactive mode with sliders.

## Integration

- `index.astro`: Replace `<MathExplorer client:load ... />` with `<GuidedExplorer client:load />`
- `MathExplorer.tsx` can be deleted (its SVG rendering logic moves to `ExplorerGraphic.tsx`)

## Verification

1. Run `npm run dev` in `/website` and verify the guided tour loads
2. Click through all slides — verify graphic transitions smoothly between states
3. Verify `<Animate>` elements appear/disappear at correct steps
4. Verify K-value sweep animation is smooth (not instant jumps)
5. Verify backward navigation reconstructs correct state
6. Verify transition to free explore mode shows sliders
7. Test responsive layout: side-by-side on desktop, stacked on mobile
