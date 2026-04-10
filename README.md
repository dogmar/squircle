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
| `squircle-amt-*` | —              | Superellipse exponent (default 1.5) |

All `squircle-*` utilities accept the same values as `rounded-*` (`sm`, `md`, `lg`, `xl`, `2xl`, `3xl`, `full`, arbitrary `[16px]`).

`squircle-amt-*` accepts a number (`squircle-amt-[2]`, `squircle-amt-[3.5]`). Higher values = more square.

## Copy/Paste

If you'd rather not add a dependency, copy the source directly:

### tw-utils.css

<!-- BEGIN:dist/tw-utils.css -->

```css
/* ── Squircle utilities ─────────────────────────────────────── */
/* squircle-amt-[n] sets the superellipse amount (default 1.5)  */
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
        (1 - pow(2, -1 * pow(2, -1 * var(--squircle-amt, 1.5))))
    );
    border-radius: var(--squircle-r);
    corner-shape: superellipse(var(--squircle-amt, 1.5));
  }
}

/* --- Per-side physical variants --- */

@utility squircle-t-* {
  border-top-left-radius: --value(--radius-*);
  border-top-right-radius: --value(--radius-*);
  @supports (corner-shape: superellipse(2)) {
    --squircle-r: calc(
      --value(--radius- *) * (1 - pow(2, -0.5)) /
        (1 - pow(2, -1 * pow(2, -1 * var(--squircle-amt, 1.5))))
    );
    border-top-left-radius: var(--squircle-r);
    border-top-right-radius: var(--squircle-r);
    corner-shape: superellipse(var(--squircle-amt, 1.5));
  }
}

@utility squircle-r-* {
  border-top-right-radius: --value(--radius-*);
  border-bottom-right-radius: --value(--radius-*);
  @supports (corner-shape: superellipse(2)) {
    --squircle-r: calc(
      --value(--radius- *) * (1 - pow(2, -0.5)) /
        (1 - pow(2, -1 * pow(2, -1 * var(--squircle-amt, 1.5))))
    );
    border-top-right-radius: var(--squircle-r);
    border-bottom-right-radius: var(--squircle-r);
    corner-shape: superellipse(var(--squircle-amt, 1.5));
  }
}

@utility squircle-b-* {
  border-bottom-left-radius: --value(--radius-*);
  border-bottom-right-radius: --value(--radius-*);
  @supports (corner-shape: superellipse(2)) {
    --squircle-r: calc(
      --value(--radius- *) * (1 - pow(2, -0.5)) /
        (1 - pow(2, -1 * pow(2, -1 * var(--squircle-amt, 1.5))))
    );
    border-bottom-left-radius: var(--squircle-r);
    border-bottom-right-radius: var(--squircle-r);
    corner-shape: superellipse(var(--squircle-amt, 1.5));
  }
}

@utility squircle-l-* {
  border-top-left-radius: --value(--radius-*);
  border-bottom-left-radius: --value(--radius-*);
  @supports (corner-shape: superellipse(2)) {
    --squircle-r: calc(
      --value(--radius- *) * (1 - pow(2, -0.5)) /
        (1 - pow(2, -1 * pow(2, -1 * var(--squircle-amt, 1.5))))
    );
    border-top-left-radius: var(--squircle-r);
    border-bottom-left-radius: var(--squircle-r);
    corner-shape: superellipse(var(--squircle-amt, 1.5));
  }
}

/* --- Per-side logical variants --- */

@utility squircle-s-* {
  border-start-start-radius: --value(--radius-*);
  border-end-start-radius: --value(--radius-*);
  @supports (corner-shape: superellipse(2)) {
    --squircle-r: calc(
      --value(--radius- *) * (1 - pow(2, -0.5)) /
        (1 - pow(2, -1 * pow(2, -1 * var(--squircle-amt, 1.5))))
    );
    border-start-start-radius: var(--squircle-r);
    border-end-start-radius: var(--squircle-r);
    corner-shape: superellipse(var(--squircle-amt, 1.5));
  }
}

@utility squircle-e-* {
  border-start-end-radius: --value(--radius-*);
  border-end-end-radius: --value(--radius-*);
  @supports (corner-shape: superellipse(2)) {
    --squircle-r: calc(
      --value(--radius- *) * (1 - pow(2, -0.5)) /
        (1 - pow(2, -1 * pow(2, -1 * var(--squircle-amt, 1.5))))
    );
    border-start-end-radius: var(--squircle-r);
    border-end-end-radius: var(--squircle-r);
    corner-shape: superellipse(var(--squircle-amt, 1.5));
  }
}

/* --- Per-corner physical variants --- */

@utility squircle-tl-* {
  border-top-left-radius: --value(--radius-*);
  @supports (corner-shape: superellipse(2)) {
    border-top-left-radius: calc(
      --value(--radius- *) * (1 - pow(2, -0.5)) /
        (1 - pow(2, -1 * pow(2, -1 * var(--squircle-amt, 1.5))))
    );
    corner-shape: superellipse(var(--squircle-amt, 1.5));
  }
}

@utility squircle-tr-* {
  border-top-right-radius: --value(--radius-*);
  @supports (corner-shape: superellipse(2)) {
    border-top-right-radius: calc(
      --value(--radius- *) * (1 - pow(2, -0.5)) /
        (1 - pow(2, -1 * pow(2, -1 * var(--squircle-amt, 1.5))))
    );
    corner-shape: superellipse(var(--squircle-amt, 1.5));
  }
}

@utility squircle-br-* {
  border-bottom-right-radius: --value(--radius-*);
  @supports (corner-shape: superellipse(2)) {
    border-bottom-right-radius: calc(
      --value(--radius- *) * (1 - pow(2, -0.5)) /
        (1 - pow(2, -1 * pow(2, -1 * var(--squircle-amt, 1.5))))
    );
    corner-shape: superellipse(var(--squircle-amt, 1.5));
  }
}

@utility squircle-bl-* {
  border-bottom-left-radius: --value(--radius-*);
  @supports (corner-shape: superellipse(2)) {
    border-bottom-left-radius: calc(
      --value(--radius- *) * (1 - pow(2, -0.5)) /
        (1 - pow(2, -1 * pow(2, -1 * var(--squircle-amt, 1.5))))
    );
    corner-shape: superellipse(var(--squircle-amt, 1.5));
  }
}

/* --- Per-corner logical variants --- */

@utility squircle-ss-* {
  border-start-start-radius: --value(--radius-*);
  @supports (corner-shape: superellipse(2)) {
    border-start-start-radius: calc(
      --value(--radius- *) * (1 - pow(2, -0.5)) /
        (1 - pow(2, -1 * pow(2, -1 * var(--squircle-amt, 1.5))))
    );
    corner-shape: superellipse(var(--squircle-amt, 1.5));
  }
}

@utility squircle-se-* {
  border-start-end-radius: --value(--radius-*);
  @supports (corner-shape: superellipse(2)) {
    border-start-end-radius: calc(
      --value(--radius- *) * (1 - pow(2, -0.5)) /
        (1 - pow(2, -1 * pow(2, -1 * var(--squircle-amt, 1.5))))
    );
    corner-shape: superellipse(var(--squircle-amt, 1.5));
  }
}

@utility squircle-es-* {
  border-end-start-radius: --value(--radius-*);
  @supports (corner-shape: superellipse(2)) {
    border-end-start-radius: calc(
      --value(--radius- *) * (1 - pow(2, -0.5)) /
        (1 - pow(2, -1 * pow(2, -1 * var(--squircle-amt, 1.5))))
    );
    corner-shape: superellipse(var(--squircle-amt, 1.5));
  }
}

@utility squircle-ee-* {
  border-end-end-radius: --value(--radius-*);
  @supports (corner-shape: superellipse(2)) {
    border-end-end-radius: calc(
      --value(--radius- *) * (1 - pow(2, -0.5)) /
        (1 - pow(2, -1 * pow(2, -1 * var(--squircle-amt, 1.5))))
    );
    corner-shape: superellipse(var(--squircle-amt, 1.5));
  }
}
```

<!-- END:dist/tw-utils.css -->

### tw-plugin.js

<!-- BEGIN:dist/tw-plugin.mjs -->

```ts
import plugin from "tailwindcss/plugin";

type PluginWithConfig = ReturnType<typeof plugin>;

const correctedRadius = (value: string): string =>
  `calc(${value} * (1 - pow(2, -0.5)) / (1 - pow(2, -1 * pow(2, -1 * var(--squircle-amt, 1.5)))))`;

const cornerShape = "superellipse(var(--squircle-amt, 1.5))";

const supportsCornerShape = "@supports (corner-shape: superellipse(2))";

// eslint-disable-next-line @typescript-eslint/unbound-method
const squirclePlugin: Parameters<typeof plugin>[0] = ({ matchUtilities, theme }) => {
  const radiusValues = theme("borderRadius");

  // squircle-amt-* — sets exponent + corner-shape
  matchUtilities(
    {
      "squircle-amt": (value: string) => ({
        "--squircle-amt": value,
        [supportsCornerShape]: {
          "corner-shape": "superellipse(var(--squircle-amt))",
        },
      }),
    },
    { type: "number" },
  );

  // squircle-* — all corners (uses intermediate --squircle-r variable)
  matchUtilities(
    {
      squircle: (value: string) => ({
        "border-radius": value,
        [supportsCornerShape]: {
          "--squircle-r": correctedRadius(value),
          "border-radius": "var(--squircle-r)",
          "corner-shape": cornerShape,
        },
      }),
    },
    { type: "length", values: radiusValues },
  );

  // --- Per-side physical variants (use intermediate --squircle-r variable) ---

  // squircle-t-* — top-left + top-right
  matchUtilities(
    {
      "squircle-t": (value: string) => ({
        "border-top-left-radius": value,
        "border-top-right-radius": value,
        [supportsCornerShape]: {
          "--squircle-r": correctedRadius(value),
          "border-top-left-radius": "var(--squircle-r)",
          "border-top-right-radius": "var(--squircle-r)",
          "corner-shape": cornerShape,
        },
      }),
    },
    { type: "length", values: radiusValues },
  );

  // squircle-r-* — top-right + bottom-right
  matchUtilities(
    {
      "squircle-r": (value: string) => ({
        "border-top-right-radius": value,
        "border-bottom-right-radius": value,
        [supportsCornerShape]: {
          "--squircle-r": correctedRadius(value),
          "border-top-right-radius": "var(--squircle-r)",
          "border-bottom-right-radius": "var(--squircle-r)",
          "corner-shape": cornerShape,
        },
      }),
    },
    { type: "length", values: radiusValues },
  );

  // squircle-b-* — bottom-left + bottom-right
  matchUtilities(
    {
      "squircle-b": (value: string) => ({
        "border-bottom-left-radius": value,
        "border-bottom-right-radius": value,
        [supportsCornerShape]: {
          "--squircle-r": correctedRadius(value),
          "border-bottom-left-radius": "var(--squircle-r)",
          "border-bottom-right-radius": "var(--squircle-r)",
          "corner-shape": cornerShape,
        },
      }),
    },
    { type: "length", values: radiusValues },
  );

  // squircle-l-* — top-left + bottom-left
  matchUtilities(
    {
      "squircle-l": (value: string) => ({
        "border-top-left-radius": value,
        "border-bottom-left-radius": value,
        [supportsCornerShape]: {
          "--squircle-r": correctedRadius(value),
          "border-top-left-radius": "var(--squircle-r)",
          "border-bottom-left-radius": "var(--squircle-r)",
          "corner-shape": cornerShape,
        },
      }),
    },
    { type: "length", values: radiusValues },
  );

  // --- Per-side logical variants (use intermediate --squircle-r variable) ---

  // squircle-s-* — start-start + end-start (inline-start side)
  matchUtilities(
    {
      "squircle-s": (value: string) => ({
        "border-start-start-radius": value,
        "border-end-start-radius": value,
        [supportsCornerShape]: {
          "--squircle-r": correctedRadius(value),
          "border-start-start-radius": "var(--squircle-r)",
          "border-end-start-radius": "var(--squircle-r)",
          "corner-shape": cornerShape,
        },
      }),
    },
    { type: "length", values: radiusValues },
  );

  // squircle-e-* — start-end + end-end (inline-end side)
  matchUtilities(
    {
      "squircle-e": (value: string) => ({
        "border-start-end-radius": value,
        "border-end-end-radius": value,
        [supportsCornerShape]: {
          "--squircle-r": correctedRadius(value),
          "border-start-end-radius": "var(--squircle-r)",
          "border-end-end-radius": "var(--squircle-r)",
          "corner-shape": cornerShape,
        },
      }),
    },
    { type: "length", values: radiusValues },
  );

  // --- Per-corner physical variants (NO intermediate variable, direct calc) ---

  // squircle-tl-*
  matchUtilities(
    {
      "squircle-tl": (value: string) => ({
        "border-top-left-radius": value,
        [supportsCornerShape]: {
          "border-top-left-radius": correctedRadius(value),
          "corner-shape": cornerShape,
        },
      }),
    },
    { type: "length", values: radiusValues },
  );

  // squircle-tr-*
  matchUtilities(
    {
      "squircle-tr": (value: string) => ({
        "border-top-right-radius": value,
        [supportsCornerShape]: {
          "border-top-right-radius": correctedRadius(value),
          "corner-shape": cornerShape,
        },
      }),
    },
    { type: "length", values: radiusValues },
  );

  // squircle-br-*
  matchUtilities(
    {
      "squircle-br": (value: string) => ({
        "border-bottom-right-radius": value,
        [supportsCornerShape]: {
          "border-bottom-right-radius": correctedRadius(value),
          "corner-shape": cornerShape,
        },
      }),
    },
    { type: "length", values: radiusValues },
  );

  // squircle-bl-*
  matchUtilities(
    {
      "squircle-bl": (value: string) => ({
        "border-bottom-left-radius": value,
        [supportsCornerShape]: {
          "border-bottom-left-radius": correctedRadius(value),
          "corner-shape": cornerShape,
        },
      }),
    },
    { type: "length", values: radiusValues },
  );

  // --- Per-corner logical variants (NO intermediate variable, direct calc) ---

  // squircle-ss-*
  matchUtilities(
    {
      "squircle-ss": (value: string) => ({
        "border-start-start-radius": value,
        [supportsCornerShape]: {
          "border-start-start-radius": correctedRadius(value),
          "corner-shape": cornerShape,
        },
      }),
    },
    { type: "length", values: radiusValues },
  );

  // squircle-se-*
  matchUtilities(
    {
      "squircle-se": (value: string) => ({
        "border-start-end-radius": value,
        [supportsCornerShape]: {
          "border-start-end-radius": correctedRadius(value),
          "corner-shape": cornerShape,
        },
      }),
    },
    { type: "length", values: radiusValues },
  );

  // squircle-es-*
  matchUtilities(
    {
      "squircle-es": (value: string) => ({
        "border-end-start-radius": value,
        [supportsCornerShape]: {
          "border-end-start-radius": correctedRadius(value),
          "corner-shape": cornerShape,
        },
      }),
    },
    { type: "length", values: radiusValues },
  );

  // squircle-ee-*
  matchUtilities(
    {
      "squircle-ee": (value: string) => ({
        "border-end-end-radius": value,
        [supportsCornerShape]: {
          "border-end-end-radius": correctedRadius(value),
          "corner-shape": cornerShape,
        },
      }),
    },
    { type: "length", values: radiusValues },
  );
};

const squircle: PluginWithConfig = plugin(squirclePlugin);
export default squircle;
```

<!-- END:dist/tw-plugin.mjs -->

### tw-merge-cfg.js

<!-- BEGIN:dist/tw-merge-cfg.mjs -->

```ts
const allRoundedGroups: string[] = [
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
  "rounded-bl",
];

export const squircleMergeConfig = {
  extend: {
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
        { "squircle-ee": [() => true] },
      ],
      "squircle-amt": [{ "squircle-amt": [() => true] }],
    },
    conflictingClassGroups: {
      squircle: [...allRoundedGroups, "squircle-amt"],
      ...Object.fromEntries(allRoundedGroups.map((g) => [g, ["squircle", "squircle-amt"]])),
    },
  },
} as const;
```

<!-- END:dist/tw-merge-cfg.mjs -->

## Browser Support

`corner-shape: superellipse()` is a new CSS property. Check [caniuse](https://caniuse.com/?search=corner-shape) for current browser support. In unsupported browsers, the corners degrade gracefully to regular `border-radius` — the superellipse shape is simply ignored.

## License

MIT
