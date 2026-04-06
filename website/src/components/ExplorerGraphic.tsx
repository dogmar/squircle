import { useId, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import {
  circleArcPoints,
  correctedRadius,
  perceivedRadius,
  pointsToPath,
  superellipsePoints,
} from "../math";

export interface GraphicState {
  showRounded: boolean;
  showSuperellipse: boolean;
  correctionAmount: number; // 0 = uncorrected superellipse, 1 = fully corrected
  amount: number;
  showRefLine: boolean;
  showMeasurement: boolean;
  measureArc?: "rounded" | "superellipse" | "corrected";
  showFill: boolean;
  showStroke: boolean;
  zoom: number;
}

const BOX = 180;
const PAD = 10;
const PAD_EXTRA = 20; // extra padding on top and right for serifs/labels
const cornerX = PAD + BOX; // 190
const cornerY = PAD; // 10
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
  amount,
  showRefLine,
  showMeasurement,
  measureArc,
  correctionAmount,
  showFill,
  showStroke,
  zoom,
}: GraphicState) {
  const id = useId();
  const clipCircle = `${id}-clip-circle`;
  const clipSuper = `${id}-clip-super`;

  // Track discrete measurement state changes to decide when to animate vs instant update
  const measureKey = `${showRefLine}-${showMeasurement}-${measureArc}`;
  const prevMeasureKey = useRef(measureKey);
  const isMorphing = prevMeasureKey.current !== measureKey;
  prevMeasureKey.current = measureKey;

  const data = useMemo(() => {
    const mathN = Math.pow(2, amount);
    const r = BOX * zoom;
    const corrR = correctedRadius(r, mathN);

    // Interpolated superellipse radius based on correction amount
    const superR = r + correctionAmount * (corrR - r);

    // Circle arc points
    const circleRaw = circleArcPoints(r);
    const circleSvg = circleRaw.map((p) => arcToSvg(p.x, p.y, r));

    // Superellipse points (interpolated between uncorrected and corrected)
    const superRaw = superellipsePoints(superR, mathN);
    const superSvg = superRaw.map((p) => arcToSvg(p.x, p.y, superR));

    // Paths
    const circlePath = buildCurvePath(circleSvg);
    const superPath = buildCurvePath(superSvg);

    // Interior clip: same shape as the curve path, closed
    const circleClip = circlePath + " Z";
    const superClip = superPath + " Z";

    // Determine z-order: superellipse above circle when its perceived radius
    // is smaller (curve closer to corner), below when larger (curve past circle)
    const circlePerceived = perceivedRadius(r, r, 2);
    const superPerceived = perceivedRadius(r, superR, mathN);
    const superAboveCircle = superPerceived <= circlePerceived;

    // Measurement line data
    let measure: { endX: number; endY: number; ratio: number; cssVar: string } | null = null;
    if (measureArc) {
      const arcR = measureArc === "corrected" ? superR : r;
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
      mathN,
      r,
      superR,
      circleSvg,
      superSvg,
      circlePath,
      superPath,
      circleClip,
      superClip,
      superAboveCircle,
      measure,
      // Reference line: circle arc center outward at 45° toward corner (length = r)
      refLine: {
        x1: cornerX - r,
        y1: cornerY + r,
        x2: cornerX - r + r / Math.SQRT2,
        y2: cornerY + r - r / Math.SQRT2,
      },
    };
  }, [amount, measureArc, zoom, correctionAmount]);

  const {
    circleSvg,
    superSvg,
    circlePath,
    superPath,
    circleClip,
    superClip,
    superAboveCircle,
    measure,
    refLine,
  } = data;

  return (
    <svg
      viewBox={`${PAD} ${PAD - PAD_EXTRA} ${BOX + PAD_EXTRA} ${BOX + PAD_EXTRA}`}
      className="w-full max-w-md"
    >
      <defs>
        <clipPath id={clipCircle}>
          <path d={circleClip} />
        </clipPath>
        <clipPath id={clipSuper}>
          <path d={superClip} />
        </clipPath>
      </defs>

      {/* Superellipse and circle — z-order swaps when superellipse crosses circle */}
      {(() => {
        const isCorrepting = correctionAmount > 0;
        const superFillColor = isCorrepting
          ? "var(--color-adjusted-fill)"
          : "var(--color-squircle-fill)";
        const superStrokeColor = isCorrepting
          ? "var(--color-adjusted-border)"
          : "var(--color-squircle-border)";

        const superellipseGroup = (
          <motion.g
            key="super"
            animate={{ opacity: showSuperellipse ? 1 : 0 }}
            transition={{ duration: 0.4 }}
          >
            <g style={{ color: superStrokeColor, transition: "color 0.5s" }}>
              {showFill && (
                <path
                  d={`${superPath} L ${PAD} ${PAD + BOX} Z`}
                  style={{ fill: superFillColor, transition: "fill 0.5s" }}
                  stroke="none"
                />
              )}
              {showStroke && (
                <>
                  <path
                    d={superPath}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={3}
                    strokeDasharray={DASH}
                    strokeDashoffset={-DASH_PERIOD / 3}
                    clipPath={`url(#${clipSuper})`}
                  />
                  <line
                    x1={superSvg[0]!.x}
                    y1={superSvg[0]!.y - SERIF_W / 2}
                    x2={superSvg[0]!.x + SERIF_LEN}
                    y2={superSvg[0]!.y - SERIF_W / 2}
                    stroke="currentColor"
                    strokeWidth={SERIF_W}
                  />
                  <line
                    x1={superSvg[superSvg.length - 1]!.x + SERIF_W / 2}
                    y1={superSvg[superSvg.length - 1]!.y}
                    x2={superSvg[superSvg.length - 1]!.x + SERIF_W / 2}
                    y2={superSvg[superSvg.length - 1]!.y - SERIF_LEN}
                    stroke="currentColor"
                    strokeWidth={SERIF_W}
                  />
                </>
              )}
            </g>
          </motion.g>
        );

        const circleGroup = (
          <motion.g
            key="circle"
            animate={{ opacity: showRounded ? 1 : 0 }}
            transition={{ duration: 0.4 }}
          >
            {showFill && (
              <path
                d={`${circlePath} L ${PAD} ${PAD + BOX} Z`}
                style={{ fill: "var(--color-rounded-fill)" }}
                stroke="none"
              />
            )}
            {showStroke && (
              <>
                <path
                  d={circlePath}
                  fill="none"
                  style={{ stroke: "var(--color-rounded-border)" }}
                  strokeWidth={3}
                  strokeDasharray={DASH}
                  strokeDashoffset={0}
                  clipPath={`url(#${clipCircle})`}
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
              </>
            )}
          </motion.g>
        );

        return superAboveCircle ? (
          <>
            {circleGroup}
            {superellipseGroup}
          </>
        ) : (
          <>
            {superellipseGroup}
            {circleGroup}
          </>
        );
      })()}

      {/* Animated diagonal line — morphs between reference line and measurement line */}
      {(() => {
        const visible = showRefLine || (showMeasurement && measure);
        // When measurement is active, use measurement coords; otherwise use reference line
        const useMeasure = showMeasurement && measure;
        const x1 = useMeasure ? cornerX : refLine.x1;
        const y1 = useMeasure ? cornerY : refLine.y1;
        const x2 = useMeasure ? measure!.endX : refLine.x2;
        const y2 = useMeasure ? measure!.endY : refLine.y2;
        const serifLen = useMeasure ? 24 : 5;
        const label = useMeasure ? measure!.ratio.toFixed(2) : "1";
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        const svgW = PAD * 2 + BOX;
        const nearTop = midY - 6 < 12;
        const nearRight = midX + 6 + 24 > svgW;
        const lx = nearRight ? midX - 28 : midX + 6;
        const ly = nearTop ? midY + 12 : midY - 6;

        const strokeColor = useMeasure ? `var(${measure!.cssVar})` : "var(--color-rounded-border)";

        const morphTransition = isMorphing
          ? { type: "spring" as const, stiffness: 200, damping: 25 }
          : { duration: 0 };

        return (
          <motion.g animate={{ opacity: visible ? 1 : 0 }} transition={{ duration: 0.4 }}>
            <g style={{ color: strokeColor, transition: "color 0.5s" }}>
              {/* Main diagonal line */}
              <motion.line
                animate={{ x1, y1, x2, y2 }}
                transition={morphTransition}
                stroke="currentColor"
                strokeWidth={0.75}
                strokeDasharray="1 4"
                strokeLinecap="round"
              />
              {/* Perpendicular serif at the end point */}
              <motion.line
                animate={{
                  x1: x2 - serifLen / Math.SQRT2,
                  y1: y2 - serifLen / Math.SQRT2,
                  x2: x2 + serifLen / Math.SQRT2,
                  y2: y2 + serifLen / Math.SQRT2,
                }}
                transition={morphTransition}
                stroke="currentColor"
                strokeWidth={0.75}
              />
              {/* Label */}
              <motion.text
                animate={{ x: lx, y: ly }}
                transition={morphTransition}
                fill="currentColor"
                fontSize={9}
                className="text-zinc-400"
              >
                {label}
              </motion.text>
            </g>
          </motion.g>
        );
      })()}
    </svg>
  );
}
