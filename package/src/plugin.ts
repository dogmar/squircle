import plugin from "tailwindcss/plugin";
import {
  DEFAULT_AMOUNT_VAR_NAME,
  correctedRadius,
  getCornerShape,
  usesIntermediateVar,
  variantEntries,
} from "./variants";

export interface SquirclePluginOptions {
  /** CSS custom property name for the superellipse amount (default: "--squircle-amt") */
  amtVar?: string;
  /** @plugin CSS alias for amtVar */
  "amt-var"?: string;
  /** Class name prefix for utilities (default: "squircle") */
  prefix?: string;
}

const squircle: ReturnType<typeof plugin.withOptions<SquirclePluginOptions>> =
  plugin.withOptions<SquirclePluginOptions>((options = {}) =>
    // eslint-disable-next-line @typescript-eslint/unbound-method
    ({ matchUtilities, theme }) => {
    const amtVar = options.amtVar ?? options["amt-var"] ?? DEFAULT_AMOUNT_VAR_NAME;
    const prefix = options.prefix ?? "squircle";
    const radiusValues = theme("borderRadius");

    const amtCss = `var(${amtVar}, 2)`;
    const cornerShape = getCornerShape(amtVar);
    const supportsCornerShape: string = "@supports (corner-shape: superellipse())";

    matchUtilities(
      {
        [`${prefix}-amt`]: (value: string) => ({
          [amtVar]: value,
          [supportsCornerShape]: {
            "corner-shape": `superellipse(var(${amtVar}))`,
          },
        }),
      },
      { type: "number" },
    );

    for (const [suffix, props] of variantEntries()) {
      const name = suffix ? `${prefix}-${suffix}` : prefix;

      if (usesIntermediateVar(suffix)) {
        matchUtilities(
          {
            [name]: (value: string) => ({
              ...Object.fromEntries(props.map((p) => [p, value])),
              [supportsCornerShape]: {
                "--squircle-r": correctedRadius(value, amtCss),
                ...Object.fromEntries(props.map((p) => [p, "var(--squircle-r)"])),
                "corner-shape": cornerShape,
              },
            }),
          },
          { type: "length", values: radiusValues },
        );
      } else {
        const prop = props[0]!;
        matchUtilities(
          {
            [name]: (value: string) => {
              const result: Record<string, string | Record<string, string>> = {
                [prop]: value,
              };
              result[supportsCornerShape] = {
                [prop]: correctedRadius(value, amtCss),
                "corner-shape": cornerShape,
              };
              return result;
            },
          },
          { type: "length", values: radiusValues },
        );
      }
    }
  });

export default squircle;
