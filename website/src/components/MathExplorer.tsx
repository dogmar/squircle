import { useMemo, useState } from "react";
import {
  circleArcPoints,
  correctedRadius,
  perceivedRadius,
  pointsToPath,
  superellipsePoints,
} from "../math";

interface MathExplorerProps {
  showRounded?: boolean;
  showSuperellipse?: boolean;
  showCorrected?: boolean;
  amount?: number;
  measureArc?: "rounded" | "superellipse" | "corrected";
}

const BOX = 180;
const PAD = 10;
const cornerX = PAD + BOX; // 190
const cornerY = PAD; // 10
const DASH = "4 3";
const DASH_PERIOD = 7;

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

export default function MathExplorer({
  showRounded: showRoundedProp = true,
  showSuperellipse: showSuperellipseProp = true,
  showCorrected: showCorrectedProp = true,
  amount: initialAmount = 1.5,
  measureArc,
}: MathExplorerProps) {
  const [amount, setAmount] = useState(initialAmount);
  const [amountText, setAmountText] = useState(String(initialAmount));

  const data = useMemo(() => {
    const mathN = Math.pow(2, amount);
    const corrFactor = correctedRadius(1, mathN);
    const largestFactor = Math.max(1, corrFactor);
    const r = BOX / largestFactor;
    const corrR = correctedRadius(r, mathN);

    // Circle arc points
    const circleRaw = circleArcPoints(r);
    const circleSvg = circleRaw.map((p) => arcToSvg(p.x, p.y, r));

    // Superellipse points
    const superRaw = superellipsePoints(r, mathN);
    const superSvg = superRaw.map((p) => arcToSvg(p.x, p.y, r));

    // Corrected superellipse points
    const corrRaw = superellipsePoints(corrR, mathN);
    const corrSvg = corrRaw.map((p) => arcToSvg(p.x, p.y, corrR));

    // Paths
    const circlePath = buildCurvePath(circleSvg);
    const superPath = buildCurvePath(superSvg);
    const corrPath = buildCurvePath(corrSvg);

    // Interior clip: same shape as the curve path, closed
    const circleClip = circlePath + " Z";
    const superClip = superPath + " Z";
    const corrClip = corrPath + " Z";

    // Perceived radii
    const circlePerceived = perceivedRadius(r, r, 2);
    const superPerceived = perceivedRadius(r, r, mathN);
    const corrPerceived = perceivedRadius(r, corrR, mathN);

    // Measurement line data
    let measure: { endX: number; endY: number; ratio: number; cssVar: string } | null = null;
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
            : "--color-squircle-adjusted-border";
      measure = { endX, endY, ratio, cssVar };
    }

    return {
      mathN,
      r,
      corrR,
      circleSvg,
      superSvg,
      corrSvg,
      circlePath,
      superPath,
      corrPath,
      circleClip,
      superClip,
      corrClip,
      circlePerceived,
      superPerceived,
      corrPerceived,
      measure,
      // Reference line: circle arc center outward at 45° toward corner (length = r)
      refLine: {
        x1: cornerX - r,
        y1: cornerY + r,
        x2: cornerX - r + r / Math.SQRT2,
        y2: cornerY + r - r / Math.SQRT2,
      },
    };
  }, [amount, measureArc]);

  function handleTextCommit(value: string) {
    const parsed = parseFloat(value);
    if (isNaN(parsed)) {
      setAmountText(String(amount));
      return;
    }
    const clamped = Math.min(3, Math.max(-3, parsed));
    setAmount(clamped);
    setAmountText(String(clamped));
  }

  const {
    mathN,
    r,
    corrR,
    circleSvg,
    superSvg,
    corrSvg,
    circlePath,
    superPath,
    corrPath,
    circleClip,
    superClip,
    corrClip,
    circlePerceived,
    superPerceived,
    corrPerceived,
    measure,
    refLine,
  } = data;

  const circleDiff = circlePerceived - circlePerceived;
  const superDiff = superPerceived - circlePerceived;
  const corrDiff = corrPerceived - circlePerceived;

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
          value={amount}
          className="slider-unfilled"
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            setAmount(v);
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

      {/* SVG visualization */}
      <svg viewBox={`0 0 ${PAD * 2 + BOX} ${PAD * 2 + BOX}`} className="w-full max-w-md">
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

        {/* Circle arc */}
        {showRoundedProp && (
          <g>
            <path
              d={circlePath}
              fill="none"
              style={{ stroke: "var(--color-rounded-border)" }}
              strokeWidth={3}
              strokeDasharray={DASH}
              strokeDashoffset={0}
              clipPath="url(#clip-circle)"
            />
            <circle
              cx={circleSvg[0]!.x}
              cy={circleSvg[0]!.y}
              r={2}
              style={{ fill: "var(--color-rounded-border)" }}
            />
            <circle
              cx={circleSvg[circleSvg.length - 1]!.x}
              cy={circleSvg[circleSvg.length - 1]!.y}
              r={2}
              style={{ fill: "var(--color-rounded-border)" }}
            />
          </g>
        )}

        {/* Superellipse */}
        {showSuperellipseProp && (
          <g>
            <path
              d={superPath}
              fill="none"
              style={{ stroke: "var(--color-squircle-border)" }}
              strokeWidth={3}
              strokeDasharray={DASH}
              strokeDashoffset={-DASH_PERIOD / 3}
              clipPath="url(#clip-super)"
            />
            <circle
              cx={superSvg[0]!.x}
              cy={superSvg[0]!.y}
              r={3.5}
              fill="none"
              style={{ stroke: "var(--color-squircle-border)" }}
              strokeWidth={1}
            />
            <circle
              cx={superSvg[superSvg.length - 1]!.x}
              cy={superSvg[superSvg.length - 1]!.y}
              r={3.5}
              fill="none"
              style={{ stroke: "var(--color-squircle-border)" }}
              strokeWidth={1}
            />
          </g>
        )}

        {/* Corrected superellipse */}
        {showCorrectedProp && (
          <g>
            <path
              d={corrPath}
              fill="none"
              style={{ stroke: "var(--color-squircle-adjusted-border)" }}
              strokeWidth={3}
              strokeDasharray={DASH}
              strokeDashoffset={(-2 * DASH_PERIOD) / 3}
              clipPath="url(#clip-corr)"
            />
            <circle
              cx={corrSvg[0]!.x}
              cy={corrSvg[0]!.y}
              r={5.5}
              fill="none"
              style={{ stroke: "var(--color-squircle-adjusted-border)" }}
              strokeWidth={1}
            />
            <circle
              cx={corrSvg[corrSvg.length - 1]!.x}
              cy={corrSvg[corrSvg.length - 1]!.y}
              r={5.5}
              fill="none"
              style={{ stroke: "var(--color-squircle-adjusted-border)" }}
              strokeWidth={1}
            />
          </g>
        )}

        {/* Measurement line */}
        {measure && (
          <g>
            {/* Diagonal line from corner to curve apex */}
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
            {/* Perpendicular serif at the curve end */}
            <line
              x1={measure.endX - 24 / Math.SQRT2}
              y1={measure.endY - 24 / Math.SQRT2}
              x2={measure.endX + 24 / Math.SQRT2}
              y2={measure.endY + 24 / Math.SQRT2}
              style={{ stroke: `var(${measure.cssVar})` }}
              strokeWidth={0.75}
            />
            {/* Ratio label */}
            {(() => {
              const midX = (cornerX + measure.endX) / 2;
              const midY = (cornerY + measure.endY) / 2;
              const svgW = PAD * 2 + BOX;
              // Place label upper-right of line; flip to lower-left if near edge
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
          </g>
        )}

        {/* Reference line: circle center to bottom-right edge, labeled "1" */}
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
          {/* Perpendicular serif at the outer end */}
          <line
            x1={refLine.x2 - 5 / Math.SQRT2}
            y1={refLine.y2 - 5 / Math.SQRT2}
            x2={refLine.x2 + 5 / Math.SQRT2}
            y2={refLine.y2 + 5 / Math.SQRT2}
            style={{ stroke: "var(--color-rounded-border)" }}
            strokeWidth={0.75}
          />
          {/* Label */}
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

      {/* Formula readout */}
      <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-900 p-4 text-sm">
        <p className="font-mono text-zinc-300">
          r' = {r.toFixed(1)} &times; (1 - 2<sup>-1/2</sup>) / (1 - 2
          <sup>-1/{mathN.toFixed(2)}</sup>)
        </p>
        <p className="font-mono text-zinc-400">= {corrR.toFixed(1)}px</p>

        {/* Comparison table */}
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
              <td className="py-1 pr-4">{r.toFixed(1)}px</td>
              <td className="py-1 pr-4">{circlePerceived.toFixed(1)}px</td>
              <td className="py-1">{formatDiff(circleDiff)}</td>
            </tr>
            <tr>
              <td className="py-1 pr-4" style={{ color: "var(--color-squircle-border)" }}>
                Superellipse
              </td>
              <td className="py-1 pr-4">{r.toFixed(1)}px</td>
              <td className="py-1 pr-4">{superPerceived.toFixed(1)}px</td>
              <td className="py-1">{formatDiff(superDiff)}</td>
            </tr>
            <tr>
              <td className="py-1 pr-4" style={{ color: "var(--color-squircle-adjusted-border)" }}>
                Corrected
              </td>
              <td className="py-1 pr-4">{corrR.toFixed(1)}px</td>
              <td className="py-1 pr-4">{corrPerceived.toFixed(1)}px</td>
              <td className="py-1">{formatDiff(corrDiff)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
