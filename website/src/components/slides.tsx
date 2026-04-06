import { useState } from "react";
import { Animate, useAmountControl } from "./Animate";
import type { GraphicState } from "./ExplorerGraphic";

function AmountSlider({ min, max, initial }: { min: number; max: number; initial: number }) {
  const onAmountChange = useAmountControl();
  const [value, setValue] = useState(initial);
  return (
    <div className="mt-3 flex items-center gap-3">
      <label className="text-sm font-medium text-zinc-400">Superellipse strength:</label>
      <input
        type="range"
        min={min}
        max={max}
        step={0.1}
        value={value}
        className="slider-unfilled"
        onChange={(e) => {
          const v = parseFloat(e.target.value);
          setValue(v);
          onAmountChange?.(v);
        }}
      />
      <span className="w-8 text-sm text-amber-400">{value.toFixed(1)}</span>
    </div>
  );
}

export type StepDef = {
  graphic?: Partial<GraphicState>;
  transition?: { duration?: number };
  nextLabel?: string;
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
          <h2 className="type-step-heading">border-radius</h2>
          <p className="type-step-body">
            The old standby. Makes our buttons feel smooth. But we want our corners even{" "}
            <i>smoother</i>. Let's apply <code>corner-shape: squircle()</code>
          </p>
        </Animate>
      </div>
    ),
    steps: [{ graphic: { showSuperellipse: true, amount: 1, zoom: 0.75 }, nextLabel: "Apply it" }],
  },

  // Slide 1: The Superellipse
  {
    content: (
      <div>
        <Animate inStep={0}>
          <h2 className="type-step-heading">corner-shape: squircle()</h2>
        </Animate>
        <Animate inStep={0} outStep={1}>
          <p className="type-step-body">
            <i>Smoooooooth</i>. So nice. But notice what happened? The corner sticks out more than
            before. But the <code>border-radius</code> is the same! What gives?
          </p>
        </Animate>
        <Animate inStep={1} outStep={2}>
          <p className="type-step-body">
            Its apparent radius is smaller — the distance from the corner to the curve's closest
            point along the diagonal is smaller than the same{" "}
            <code className="text-zinc-300">border-radius</code> value would suggest.
          </p>
          <p className="mt-3 text-zinc-400">
            See how the superellipse strength affects the perceived radius:
          </p>
          <AmountSlider min={1} max={3} initial={2} />
          <p className="mt-3 text-zinc-400">
            Watch as we increase <em className="text-zinc-200">K</em> (the superellipse exponent).
            Higher values create an ever-squarer corner shape.
          </p>
        </Animate>
      </div>
    ),
    steps: [
      { graphic: { showSuperellipse: true, amount: 2 }, transition: { duration: 1 } },
      { graphic: { showRounded: true }, transition: { duration: 1 } },
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
      { graphic: { correctionAmount: 1, measureArc: "corrected" } },
      { graphic: {} },
      { graphic: {} },
    ],
  },
];
