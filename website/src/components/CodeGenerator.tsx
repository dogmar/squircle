import { useMemo, useState } from "react";

type CornerMode = "round" | "superellipse" | "corrected";

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

export default function CodeGenerator() {
  const [amount, setAmount] = useState(2);
  const [amountText, setAmountText] = useState("2");
  const [radius, setRadius] = useState(60);
  const [radiusText, setRadiusText] = useState("60px");
  const [mode, setMode] = useState<CornerMode>("corrected");

  const { cssOutput, twOutput, previewCss } = useMemo(() => {
    const corners = [`${radius}px`, `${radius}px`, `${radius}px`, `${radius}px`];
    const rv = radiusShorthand(corners);
    const cssK = amount;

    // CSS output always shows corrected mode
    const corrCorners = corners.map((c) => cssCorrectedRadius(c, cssK));
    const corrRv = radiusShorthand(corrCorners);
    const cssOutput =
      `border-radius: ${rv};\n` +
      `@supports (corner-shape: superellipse(2)) {\n` +
      `  border-radius: ${corrRv};\n` +
      `  corner-shape: superellipse(${cssK});\n` +
      `}`;

    // Preview CSS varies by mode
    let previewDecls: string;
    if (mode === "round") {
      previewDecls = `border-radius: ${rv};`;
    } else if (mode === "superellipse") {
      previewDecls = `border-radius: ${rv};\n  corner-shape: superellipse(${cssK});`;
    } else {
      previewDecls = `border-radius: ${corrRv};\n  corner-shape: superellipse(${cssK});`;
    }
    const previewCss = `#squircle-preview {\n  ${previewDecls}\n}`;

    // Tailwind classes
    const token = closestTwRadius(radius);
    const prefixes =
      mode === "round"
        ? ["rounded-tl", "rounded-tr", "rounded-br", "rounded-bl"]
        : ["squircle-tl", "squircle-tr", "squircle-br", "squircle-bl"];
    const classes = prefixes.map((p) => twRadiusClass(p, token));
    if (mode !== "round" && cssK !== 2) {
      classes.push(`squircle-amt-[${cssK}]`);
    }
    const twOutput = classes.join(" ");

    return { cssOutput, twOutput, previewCss };
  }, [amount, radius, mode]);

  function handleAmountTextCommit(value: string) {
    const parsed = parseFloat(value);
    if (isNaN(parsed)) {
      setAmountText(String(amount));
      return;
    }
    const clamped = Math.min(3, Math.max(-3, parsed));
    setAmount(clamped);
    setAmountText(String(clamped));
  }

  function handleRadiusTextCommit(value: string) {
    const parsed = parseCssLength(value.trim());
    if (!parsed || parsed.unit !== "px") {
      // try plain number
      const num = parseFloat(value);
      if (isNaN(num)) {
        setRadiusText(`${radius}px`);
        return;
      }
      const clamped = Math.min(160, Math.max(0, Math.round(num)));
      setRadius(clamped);
      setRadiusText(`${clamped}px`);
      return;
    }
    const clamped = Math.min(160, Math.max(0, Math.round(parsed.num)));
    setRadius(clamped);
    setRadiusText(`${clamped}px`);
  }

  return (
    <div>
      <h2 className="mb-2 text-xl font-semibold">Code Generator</h2>
      <p className="mb-6 text-zinc-400">
        Adjust the radius and superellipse amount to generate CSS and Tailwind classes.
      </p>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Left: Controls + Preview */}
        <div className="flex-1">
          {/* Amount slider */}
          <div className="mb-4 flex items-center gap-3">
            <label className="text-sm font-medium text-zinc-400">Amount</label>
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
              onBlur={(e) => handleAmountTextCommit(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAmountTextCommit(e.currentTarget.value);
              }}
            />
          </div>

          {/* Radius slider */}
          <div className="mb-4 flex items-center gap-3">
            <label className="text-sm font-medium text-zinc-400">Radius</label>
            <input
              type="range"
              min={0}
              max={160}
              step={1}
              value={radius}
              className="slider-filled"
              onChange={(e) => {
                const v = parseInt(e.target.value, 10);
                setRadius(v);
                setRadiusText(`${v}px`);
              }}
            />
            <input
              type="text"
              value={radiusText}
              className="w-16 bg-transparent text-indigo-400"
              onChange={(e) => setRadiusText(e.target.value)}
              onBlur={(e) => handleRadiusTextCommit(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRadiusTextCommit(e.currentTarget.value);
              }}
            />
          </div>

          {/* Corner Mode */}
          <fieldset className="mb-6">
            <legend className="mb-2 text-sm font-medium text-zinc-400">Corner Mode</legend>
            <div className="flex gap-4">
              {(
                [
                  ["round", "Round"],
                  ["superellipse", "Superellipse"],
                  ["corrected", "Corrected Superellipse"],
                ] as [CornerMode, string][]
              ).map(([value, label]) => (
                <label key={value} className="flex items-center gap-1.5 text-sm text-zinc-300">
                  <input
                    type="radio"
                    name="corner-mode"
                    value={value}
                    checked={mode === value}
                    onChange={() => setMode(value)}
                    className="accent-indigo-500"
                  />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>

          {/* Preview */}
          <div className="mb-4">
            <p className="mb-2 text-sm text-zinc-500">Preview</p>
            <style dangerouslySetInnerHTML={{ __html: previewCss }} />
            <div id="squircle-preview" className="h-40 w-56 bg-indigo-500" />
          </div>
        </div>

        {/* Right: Output */}
        <div className="flex-1">
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-zinc-400">CSS</label>
            <textarea
              readOnly
              rows={10}
              value={cssOutput}
              className="w-full rounded border border-zinc-700 bg-zinc-900 p-3 font-mono text-sm text-zinc-200"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-400">Tailwind Classes</label>
            <textarea
              readOnly
              rows={3}
              value={twOutput}
              className="w-full rounded border border-zinc-700 bg-zinc-900 p-3 font-mono text-sm text-zinc-200"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
