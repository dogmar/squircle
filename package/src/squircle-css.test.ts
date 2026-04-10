import { describe, expect, it } from "vitest";
import { createCompiler, VARIANTS } from "./test-utils";

const { compileCss } = createCompiler(import.meta.dirname);

describe("squircle.css utilities", () => {
  it("squircle-amt-* sets --squircle-amt and corner-shape", async () => {
    const css = await compileCss(["squircle-amt-2"]);
    expect(css).toContain("--squircle-amt: 2");
    expect(css).toContain("corner-shape: superellipse(var(--squircle-amt))");
  });

  for (const [suffix, props] of Object.entries(VARIANTS)) {
    const className = suffix ? `squircle-${suffix}-md` : "squircle-md";

    it(`${className} sets fallback radius properties`, async () => {
      const css = await compileCss([className]);
      for (const prop of props) {
        expect(css).toContain(prop);
      }
    });

    it(`${className} applies corrected radius in @supports block`, async () => {
      const css = await compileCss([className]);
      expect(css).toContain("@supports (corner-shape: superellipse(2))");
      expect(css).toContain("corner-shape: superellipse(var(--squircle-amt, 2))");
      expect(css).toContain("pow(2, -0.5)");
    });

    const usesIntermediateVar = props.length > 1 || suffix === "";
    if (usesIntermediateVar) {
      it(`${className} uses --squircle-r intermediate variable`, async () => {
        const css = await compileCss([className]);
        expect(css).toContain("--squircle-r:");
        for (const prop of props) {
          expect(css).toContain(`${prop}: var(--squircle-r)`);
        }
      });
    } else {
      it(`${className} inlines calc directly`, async () => {
        const css = await compileCss([className]);
        expect(css).not.toContain("--squircle-r:");
        expect(css).toContain(`${props[0]}: calc(`);
      });
    }

    it(`${className} snapshot`, async () => {
      const css = await compileCss([className]);
      expect(css).toMatchSnapshot();
    });
  }
});
