export const DEFAULT_AMT = 2 as const;
export const DEFAULT_AMOUNT_VAR_NAME = "--squircle-amt" as const;
export const DEFAULT_AMT_CSS = `var(${DEFAULT_AMOUNT_VAR_NAME}, ${DEFAULT_AMT})` as const;

export const getCornerShape = (varName: string = DEFAULT_AMOUNT_VAR_NAME) =>
  `superellipse(var(${varName}, ${DEFAULT_AMT}))` as const;

export function correctedRadius(radius: string, amt: string = DEFAULT_AMT_CSS): string {
  return `calc(${radius} * (1 - pow(2, -0.5)) / (1 - pow(2, -1 * pow(2, -1 * ${amt}))))` as const;
}

type SectionComment = { comment: string };
type VariantEntry = string[] | SectionComment;

function isComment(entry: VariantEntry): entry is SectionComment {
  return !Array.isArray(entry);
}

export const SUPPORTS_RULE = "@supports (corner-shape: superellipse(2))";

export const VARIANTS: Record<string, VariantEntry> & Record<`$comment-${string}`, SectionComment> =
  {
    "": ["border-radius"],
    "$comment-physical-sides": { comment: "/* --- Per-side physical variants --- */" },
    t: ["border-top-left-radius", "border-top-right-radius"],
    r: ["border-top-right-radius", "border-bottom-right-radius"],
    b: ["border-bottom-left-radius", "border-bottom-right-radius"],
    l: ["border-top-left-radius", "border-bottom-left-radius"],
    "$comment-logical-sides": { comment: "/* --- Per-side logical variants --- */" },
    s: ["border-start-start-radius", "border-end-start-radius"],
    e: ["border-start-end-radius", "border-end-end-radius"],
    "$comment-physical-corners": { comment: "/* --- Per-corner physical variants --- */" },
    tl: ["border-top-left-radius"],
    tr: ["border-top-right-radius"],
    br: ["border-bottom-right-radius"],
    bl: ["border-bottom-left-radius"],
    "$comment-logical-corners": { comment: "/* --- Per-corner logical variants --- */" },
    ss: ["border-start-start-radius"],
    se: ["border-start-end-radius"],
    es: ["border-end-start-radius"],
    ee: ["border-end-end-radius"],
  };

export function variantEntries(): [string, string[]][] {
  return Object.entries(VARIANTS).filter(
    (entry): entry is [string, string[]] => !isComment(entry[1]),
  );
}

export function usesIntermediateVar(suffix: string): boolean {
  const entry = VARIANTS[suffix];
  if (!entry || isComment(entry)) return false;
  return suffix === "" || entry.length > 1;
}

export { isComment };
export type { SectionComment, VariantEntry };
