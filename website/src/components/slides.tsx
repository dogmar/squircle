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
      <div>
        <Animate inStep={0}>
          <h2 className="text-xl font-bold text-zinc-100">The Rounded Corner</h2>
          <p className="mt-3 text-zinc-400">
            CSS <code className="text-zinc-300">border-radius</code> draws a quarter-circle arc at
            each corner of an element. It's simple, predictable, and universally supported.
          </p>
        </Animate>
        <Animate inStep={1}>
          <p className="mt-3 text-zinc-400">
            But a circle arc meets the straight edge at a{" "}
            <em className="text-zinc-200">right angle</em> — the curvature goes from zero to maximum
            instantaneously. This abrupt transition is subtly visible, especially at larger radii.
          </p>
        </Animate>
      </div>
    ),
    steps: [
      { graphic: { showRounded: true, amount: 1.5 } },
      { graphic: { showMeasurement: true, measureArc: "rounded" } },
    ],
  },

  // Slide 1: The Superellipse
  {
    content: (
      <div>
        <Animate inStep={0}>
          <h2 className="text-xl font-bold text-zinc-100">The Superellipse</h2>
          <p className="mt-3 text-zinc-400">
            A superellipse uses the equation{" "}
            <code className="text-zinc-300">
              |x|<sup>n</sup> + |y|<sup>n</sup> = r<sup>n</sup>
            </code>{" "}
            where <code className="text-zinc-300">n &gt; 2</code>. Unlike a circle, the curvature
            increases gradually from the straight edge — producing a smoother, more continuous
            transition.
          </p>
        </Animate>
        <Animate inStep={1}>
          <p className="mt-3 text-zinc-400">
            Notice that the superellipse curve sits <em className="text-zinc-200">inside</em> the
            circle arc. Its effective radius is smaller — the corner appears less rounded than the
            same <code className="text-zinc-300">border-radius</code> value would suggest.
          </p>
        </Animate>
        <Animate inStep={2}>
          <p className="mt-3 text-zinc-400">
            Watch as we increase <em className="text-zinc-200">K</em> (the superellipse exponent).
            Higher values create an ever-squarer corner shape.
          </p>
        </Animate>
        <Animate inStep={2} outStep={3}>
          <p className="mt-2 text-sm text-zinc-500 italic">
            The gap between the curves grows larger as K increases.
          </p>
        </Animate>
        <Animate inStep={3}>
          <p className="mt-3 text-zinc-400">
            At higher K values the difference between the superellipse and the circle arc is
            striking — a correction is needed to match the intended radius.
          </p>
        </Animate>
      </div>
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
      <div>
        <Animate inStep={0}>
          <h2 className="text-xl font-bold text-zinc-100">The Correction</h2>
          <p className="mt-3 text-zinc-400">
            We can compute a <em className="text-zinc-200">corrected radius</em> that compensates
            for the superellipse's inward pull. By scaling up the radius, the curve's widest point
            aligns exactly with the circle arc.
          </p>
        </Animate>
        <Animate inStep={1}>
          <p className="mt-3 text-zinc-400">
            The corrected curve now matches the visual size of the{" "}
            <code className="text-zinc-300">border-radius</code> you specified — you get the smooth
            superellipse shape without sacrificing the intended corner size.
          </p>
        </Animate>
        <Animate inStep={2}>
          <p className="mt-3 text-zinc-400">
            <code className="text-zinc-300">tw-squircle</code> applies this correction
            automatically. Just use the <code className="text-zinc-300">squircle-*</code> utilities
            as you would <code className="text-zinc-300">rounded-*</code>, and the math is handled
            for you.
          </p>
        </Animate>
      </div>
    ),
    steps: [
      { graphic: { showCorrected: true, showMeasurement: true, measureArc: "corrected" } },
      { graphic: {} },
      { graphic: {} },
    ],
  },
];
