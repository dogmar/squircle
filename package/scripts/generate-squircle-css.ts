import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  getCornerShape,
  DEFAULT_AMT,
  VARIANTS,
  correctedRadius,
  isComment,
  usesIntermediateVar,
} from "../src/variants";
import { SUPPORTS_RULE } from "../src/variants";

const __dirname = dirname(fileURLToPath(import.meta.url));

const formula = correctedRadius("--value(--radius- *)");

function multiPropUtility(name: string, props: string[]) {
  const fallbacks = props.map((p) => `  ${p}: --value(--radius-*);`).join("\n");
  const corrected = props.map((p) => `    ${p}: var(--squircle-r);`).join("\n");
  return `\
@utility ${name} {
${fallbacks}
  ${SUPPORTS_RULE} {
    --squircle-r: ${formula};
${corrected}
    corner-shape: ${getCornerShape()};
  }
}`;
}

function singlePropUtility(name: string, prop: string) {
  return `\
@utility ${name} {
  ${prop}: --value(--radius-*);
  ${SUPPORTS_RULE} {
    ${prop}: ${formula};
    corner-shape: ${getCornerShape()};
  }
}`;
}

function generateCss(): string {
  const blocks: string[] = [];

  blocks.push(`\
/* ── Squircle utilities ─────────────────────────────────────── */
/* squircle-amt-[n] sets the superellipse amount (default ${DEFAULT_AMT})    */
/* squircle-* mirrors rounded-* variants: all, t, r, b, l, s, e, tl, tr, br, bl, ss, se, es, ee */

@utility squircle-amt-* {
  --squircle-amt: --value(--squircle-amt-*, number);
  ${SUPPORTS_RULE} {
    corner-shape: superellipse(var(--squircle-amt));
  }
}`);

  for (const [suffix, entry] of Object.entries(VARIANTS)) {
    if (isComment(entry)) {
      blocks.push(entry.comment);
      continue;
    }

    const name = suffix ? `squircle-${suffix}-*` : "squircle-*";

    if (usesIntermediateVar(suffix)) {
      blocks.push(multiPropUtility(name, entry));
    } else {
      blocks.push(singlePropUtility(name, entry[0]!));
    }
  }

  return blocks.join("\n\n") + "\n";
}

const output = generateCss();
const distDir = join(__dirname, "..", "dist");
mkdirSync(distDir, { recursive: true });
const outPath = join(distDir, "tw-utils.css");
writeFileSync(outPath, output);
execFileSync("npx", ["vp", "fmt", outPath], { stdio: "inherit" });
console.log(`Generated ${outPath}`);
