# @klinking/squircle

Tailwind CSS v4 squircle (superellipse) corner utilities with visual radius correction.

[![npm version](https://img.shields.io/npm/v/@klinking/squircle.svg)](https://www.npmjs.com/package/@klinking/squircle)

> **[Interactive Demo →](https://dogmar.github.io/squircle)**

## Install

```bash
npm install @klinking/squircle
```

## Usage

**CSS import** (recommended):

```css
@import "@klinking/squircle/tw-utils.css";
```

**JS plugin** (alternative):

```css
@plugin "@klinking/squircle/tw-plugin";
```

**tw-merge** (optional — if you use tailwind-merge):

```js
import { squircleMergeConfig } from "@klinking/squircle/tw-merge-cfg";
import { extendTailwindMerge } from "tailwind-merge";

const twMerge = extendTailwindMerge(squircleMergeConfig, {
  // your other customizations
});
```

## What it does

CSS `corner-shape: superellipse()` makes corners follow a superellipse curve instead of a circular arc. But at the same `border-radius` value, superellipse corners look visually smaller. This package auto-adjusts the radius so `squircle-lg` visually matches `rounded-lg`.

The adjusted radius is wrapped in a `@supports (corner-shape: superellipse(2))` rule, so browsers without support simply use the original `border-radius` unchanged. This means your corners will look visually consistent regardless of browser — no sudden changes when support lands, no broken fallbacks. Since browser support for `corner-shape` is still not universal, this gives you consistent visual border-radius forever.

The correction formula:

$$r' = r \cdot \frac{1 - 2^{-\frac{1}{2}}}{1 - 2^{-\frac{1}{n}}}$$

where $n = 2^K$ and $K$ is the CSS `superellipse()` parameter.

See the [interactive demo](https://dogmar.github.io/squircle) for a visual explanation.

## Utilities

| Utility          | Equivalent     | Description                         |
| ---------------- | -------------- | ----------------------------------- |
| `squircle-*`     | `rounded-*`    | All corners                         |
| `squircle-t-*`   | `rounded-t-*`  | Top corners                         |
| `squircle-r-*`   | `rounded-r-*`  | Right corners                       |
| `squircle-b-*`   | `rounded-b-*`  | Bottom corners                      |
| `squircle-l-*`   | `rounded-l-*`  | Left corners                        |
| `squircle-tl-*`  | `rounded-tl-*` | Top-left corner                     |
| `squircle-tr-*`  | `rounded-tr-*` | Top-right corner                    |
| `squircle-br-*`  | `rounded-br-*` | Bottom-right corner                 |
| `squircle-bl-*`  | `rounded-bl-*` | Bottom-left corner                  |
| `squircle-amt-*` | —              | Superellipse exponent (default 2) |

All `squircle-*` utilities accept the same values as `rounded-*` (`sm`, `md`, `lg`, `xl`, `2xl`, `3xl`, `full`, arbitrary `[16px]`).

`squircle-amt-*` accepts a number (`squircle-amt-[2]`, `squircle-amt-[3.5]`). Higher values = more square.

## Copy/Paste

If you'd rather not add a dependency, copy the source directly:

### tw-utils.css

<!-- BEGIN:dist/tw-utils.css -->
```css
/* ── Squircle utilities ─────────────────────────────────────── */
/* squircle-amt-[n] sets the superellipse amount (default 2)    */
/* squircle-* mirrors rounded-* variants: all, t, r, b, l, s, e, tl, tr, br, bl, ss, se, es, ee */

@utility squircle-amt-* {
  --squircle-amt: --value(--squircle-amt-*, number);
  @supports (corner-shape: superellipse(2)) {
    corner-shape: superellipse(var(--squircle-amt));
  }
}

@utility squircle-* {
  border-radius: --value(--radius-*);
  @supports (corner-shape: superellipse(2)) {
    --squircle-r: calc(
      --value(--radius- *) * (1 - pow(2, -0.5)) /
        (1 - pow(2, -1 * pow(2, -1 * var(--squircle-amt, 2))))
    );
    border-radius: var(--squircle-r);
    corner-shape: superellipse(var(--squircle-amt, 2));
  }
}

/* --- Per-side physical variants --- */

@utility squircle-t-* {
  border-top-left-radius: --value(--radius-*);
  border-top-right-radius: --value(--radius-*);
  @supports (corner-shape: superellipse(2)) {
    --squircle-r: calc(
      --value(--radius- *) * (1 - pow(2, -0.5)) /
        (1 - pow(2, -1 * pow(2, -1 * var(--squircle-amt, 2))))
    );
    border-top-left-radius: var(--squircle-r);
    border-top-right-radius: var(--squircle-r);
    corner-shape: superellipse(var(--squircle-amt, 2));
  }
}

@utility squircle-r-* {
  border-top-right-radius: --value(--radius-*);
  border-bottom-right-radius: --value(--radius-*);
  @supports (corner-shape: superellipse(2)) {
    --squircle-r: calc(
      --value(--radius- *) * (1 - pow(2, -0.5)) /
        (1 - pow(2, -1 * pow(2, -1 * var(--squircle-amt, 2))))
    );
    border-top-right-radius: var(--squircle-r);
    border-bottom-right-radius: var(--squircle-r);
    corner-shape: superellipse(var(--squircle-amt, 2));
  }
}

@utility squircle-b-* {
  border-bottom-left-radius: --value(--radius-*);
  border-bottom-right-radius: --value(--radius-*);
  @supports (corner-shape: superellipse(2)) {
    --squircle-r: calc(
      --value(--radius- *) * (1 - pow(2, -0.5)) /
        (1 - pow(2, -1 * pow(2, -1 * var(--squircle-amt, 2))))
    );
    border-bottom-left-radius: var(--squircle-r);
    border-bottom-right-radius: var(--squircle-r);
    corner-shape: superellipse(var(--squircle-amt, 2));
  }
}

@utility squircle-l-* {
  border-top-left-radius: --value(--radius-*);
  border-bottom-left-radius: --value(--radius-*);
  @supports (corner-shape: superellipse(2)) {
    --squircle-r: calc(
      --value(--radius- *) * (1 - pow(2, -0.5)) /
        (1 - pow(2, -1 * pow(2, -1 * var(--squircle-amt, 2))))
    );
    border-top-left-radius: var(--squircle-r);
    border-bottom-left-radius: var(--squircle-r);
    corner-shape: superellipse(var(--squircle-amt, 2));
  }
}

/* --- Per-side logical variants --- */

@utility squircle-s-* {
  border-start-start-radius: --value(--radius-*);
  border-end-start-radius: --value(--radius-*);
  @supports (corner-shape: superellipse(2)) {
    --squircle-r: calc(
      --value(--radius- *) * (1 - pow(2, -0.5)) /
        (1 - pow(2, -1 * pow(2, -1 * var(--squircle-amt, 2))))
    );
    border-start-start-radius: var(--squircle-r);
    border-end-start-radius: var(--squircle-r);
    corner-shape: superellipse(var(--squircle-amt, 2));
  }
}

@utility squircle-e-* {
  border-start-end-radius: --value(--radius-*);
  border-end-end-radius: --value(--radius-*);
  @supports (corner-shape: superellipse(2)) {
    --squircle-r: calc(
      --value(--radius- *) * (1 - pow(2, -0.5)) /
        (1 - pow(2, -1 * pow(2, -1 * var(--squircle-amt, 2))))
    );
    border-start-end-radius: var(--squircle-r);
    border-end-end-radius: var(--squircle-r);
    corner-shape: superellipse(var(--squircle-amt, 2));
  }
}

/* --- Per-corner physical variants --- */

@utility squircle-tl-* {
  border-top-left-radius: --value(--radius-*);
  @supports (corner-shape: superellipse(2)) {
    border-top-left-radius: calc(
      --value(--radius- *) * (1 - pow(2, -0.5)) /
        (1 - pow(2, -1 * pow(2, -1 * var(--squircle-amt, 2))))
    );
    corner-shape: superellipse(var(--squircle-amt, 2));
  }
}

@utility squircle-tr-* {
  border-top-right-radius: --value(--radius-*);
  @supports (corner-shape: superellipse(2)) {
    border-top-right-radius: calc(
      --value(--radius- *) * (1 - pow(2, -0.5)) /
        (1 - pow(2, -1 * pow(2, -1 * var(--squircle-amt, 2))))
    );
    corner-shape: superellipse(var(--squircle-amt, 2));
  }
}

@utility squircle-br-* {
  border-bottom-right-radius: --value(--radius-*);
  @supports (corner-shape: superellipse(2)) {
    border-bottom-right-radius: calc(
      --value(--radius- *) * (1 - pow(2, -0.5)) /
        (1 - pow(2, -1 * pow(2, -1 * var(--squircle-amt, 2))))
    );
    corner-shape: superellipse(var(--squircle-amt, 2));
  }
}

@utility squircle-bl-* {
  border-bottom-left-radius: --value(--radius-*);
  @supports (corner-shape: superellipse(2)) {
    border-bottom-left-radius: calc(
      --value(--radius- *) * (1 - pow(2, -0.5)) /
        (1 - pow(2, -1 * pow(2, -1 * var(--squircle-amt, 2))))
    );
    corner-shape: superellipse(var(--squircle-amt, 2));
  }
}

/* --- Per-corner logical variants --- */

@utility squircle-ss-* {
  border-start-start-radius: --value(--radius-*);
  @supports (corner-shape: superellipse(2)) {
    border-start-start-radius: calc(
      --value(--radius- *) * (1 - pow(2, -0.5)) /
        (1 - pow(2, -1 * pow(2, -1 * var(--squircle-amt, 2))))
    );
    corner-shape: superellipse(var(--squircle-amt, 2));
  }
}

@utility squircle-se-* {
  border-start-end-radius: --value(--radius-*);
  @supports (corner-shape: superellipse(2)) {
    border-start-end-radius: calc(
      --value(--radius- *) * (1 - pow(2, -0.5)) /
        (1 - pow(2, -1 * pow(2, -1 * var(--squircle-amt, 2))))
    );
    corner-shape: superellipse(var(--squircle-amt, 2));
  }
}

@utility squircle-es-* {
  border-end-start-radius: --value(--radius-*);
  @supports (corner-shape: superellipse(2)) {
    border-end-start-radius: calc(
      --value(--radius- *) * (1 - pow(2, -0.5)) /
        (1 - pow(2, -1 * pow(2, -1 * var(--squircle-amt, 2))))
    );
    corner-shape: superellipse(var(--squircle-amt, 2));
  }
}

@utility squircle-ee-* {
  border-end-end-radius: --value(--radius-*);
  @supports (corner-shape: superellipse(2)) {
    border-end-end-radius: calc(
      --value(--radius- *) * (1 - pow(2, -0.5)) /
        (1 - pow(2, -1 * pow(2, -1 * var(--squircle-amt, 2))))
    );
    corner-shape: superellipse(var(--squircle-amt, 2));
  }
}
```
<!-- END:dist/tw-utils.css -->

### tw-plugin.js

<!-- BEGIN:dist/tw-plugin.mjs -->
```js
import plugin from "tailwindcss/plugin";
const DEFAULT_AMOUNT_VAR_NAME = "--squircle-amt";
const DEFAULT_AMT_CSS = `var(${DEFAULT_AMOUNT_VAR_NAME}, 2)`;
const getCornerShape = (varName = DEFAULT_AMOUNT_VAR_NAME) => `superellipse(var(${varName}, 2))`;
function correctedRadius(radius, amt = DEFAULT_AMT_CSS) {
	return `calc(${radius} * (1 - pow(2, -0.5)) / (1 - pow(2, -1 * pow(2, -1 * ${amt}))))`;
}
function isComment(entry) {
	return !Array.isArray(entry);
}
const SUPPORTS_RULE = "@supports (corner-shape: superellipse(2))";
const VARIANTS = {
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
	ee: ["border-end-end-radius"]
};
function variantEntries() {
	return Object.entries(VARIANTS).filter((entry) => !isComment(entry[1]));
}
function usesIntermediateVar(suffix) {
	const entry = VARIANTS[suffix];
	if (!entry || isComment(entry)) return false;
	return suffix === "" || entry.length > 1;
}
//#endregion
//#region src/tw-plugin.ts
const squircle = plugin.withOptions((options = {}) => ({ matchUtilities, theme }) => {
	const amtVar = options.amtVar ?? options["amt-var"] ?? "--squircle-amt";
	const prefix = options.prefix ?? "squircle";
	const radiusValues = theme("borderRadius");
	const amtCss = `var(${amtVar}, 2)`;
	const cornerShape = getCornerShape(amtVar);
	matchUtilities({ [`${prefix}-amt`]: (value) => ({
		[amtVar]: value,
		[SUPPORTS_RULE]: { "corner-shape": `superellipse(var(${amtVar}))` }
	}) }, { type: "number" });
	for (const [suffix, props] of variantEntries()) {
		const name = suffix ? `${prefix}-${suffix}` : prefix;
		if (usesIntermediateVar(suffix)) matchUtilities({ [name]: (value) => ({
			...Object.fromEntries(props.map((p) => [p, value])),
			[SUPPORTS_RULE]: {
				"--squircle-r": correctedRadius(value, amtCss),
				...Object.fromEntries(props.map((p) => [p, "var(--squircle-r)"])),
				"corner-shape": cornerShape
			}
		}) }, {
			type: "length",
			values: radiusValues
		});
		else {
			const prop = props[0];
			matchUtilities({ [name]: (value) => {
				const result = { [prop]: value };
				result[SUPPORTS_RULE] = {
					[prop]: correctedRadius(value, amtCss),
					"corner-shape": cornerShape
				};
				return result;
			} }, {
				type: "length",
				values: radiusValues
			});
		}
	}
});
//#endregion
export { squircle as default };

//# sourceMappingURL=tw-plugin.mjs.map```
<!-- END:dist/tw-plugin.mjs -->

### tw-merge-cfg.js

<!-- BEGIN:dist/tw-merge-cfg.mjs -->
```js
//#region src/tw-merge-cfg.ts
const allRoundedGroups = [
	"rounded",
	"rounded-s",
	"rounded-e",
	"rounded-t",
	"rounded-r",
	"rounded-b",
	"rounded-l",
	"rounded-ss",
	"rounded-se",
	"rounded-es",
	"rounded-ee",
	"rounded-tl",
	"rounded-tr",
	"rounded-br",
	"rounded-bl"
];
const squircleMergeConfig = { extend: {
	classGroups: {
		squircle: [
			{ squircle: [() => true] },
			{ "squircle-t": [() => true] },
			{ "squircle-r": [() => true] },
			{ "squircle-b": [() => true] },
			{ "squircle-l": [() => true] },
			{ "squircle-s": [() => true] },
			{ "squircle-e": [() => true] },
			{ "squircle-tl": [() => true] },
			{ "squircle-tr": [() => true] },
			{ "squircle-br": [() => true] },
			{ "squircle-bl": [() => true] },
			{ "squircle-ss": [() => true] },
			{ "squircle-se": [() => true] },
			{ "squircle-es": [() => true] },
			{ "squircle-ee": [() => true] }
		],
		"squircle-amt": [{ "squircle-amt": [() => true] }]
	},
	conflictingClassGroups: {
		squircle: [...allRoundedGroups, "squircle-amt"],
		...Object.fromEntries(allRoundedGroups.map((g) => [g, ["squircle", "squircle-amt"]]))
	}
} };
//#endregion
export { squircleMergeConfig };

//# sourceMappingURL=tw-merge-cfg.mjs.map```
<!-- END:dist/tw-merge-cfg.mjs -->

## Browser Support

`corner-shape: superellipse()` is a new CSS property. Check [caniuse](https://caniuse.com/?search=corner-shape) for current browser support. In unsupported browsers, the corners degrade gracefully to regular `border-radius` — the superellipse shape is simply ignored.

## License

MIT
