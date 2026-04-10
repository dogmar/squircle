import { describe, expect, it } from "vitest";
import { createCompiler, VARIANTS } from "./test-utils";

const { compilePlugin } = createCompiler(import.meta.dirname);

describe("plugin.ts utilities", () => {
  it("squircle-amt-* sets --squircle-amt and corner-shape", async () => {
    const css = await compilePlugin(["squircle-amt-[2]"]);
    expect(css).toContain("--squircle-amt: 2");
    expect(css).toContain("corner-shape: superellipse(var(--squircle-amt))");
  });

  for (const [suffix, props] of Object.entries(VARIANTS)) {
    const className = suffix ? `squircle-${suffix}-md` : "squircle-md";

    it(`${className} sets fallback radius properties`, async () => {
      const css = await compilePlugin([className]);
      for (const prop of props) {
        expect(css).toContain(prop);
      }
    });

    it(`${className} applies corrected radius in @supports block`, async () => {
      const css = await compilePlugin([className]);
      expect(css).toContain("@supports (corner-shape: superellipse(2))");
      expect(css).toContain("pow(2, -0.5)");
    });

    const usesIntermediateVar = props.length > 1 || suffix === "";
    if (usesIntermediateVar) {
      it(`${className} uses --squircle-r intermediate variable`, async () => {
        const css = await compilePlugin([className]);
        expect(css).toContain("--squircle-r:");
        for (const prop of props) {
          expect(css).toContain(`${prop}: var(--squircle-r)`);
        }
      });
    } else {
      it(`${className} inlines corrected radius directly`, async () => {
        const css = await compilePlugin([className]);
        expect(css).not.toContain("--squircle-r:");
      });
    }

    it(`${className} snapshot`, async () => {
      const css = await compilePlugin([className]);
      expect(css).toMatchSnapshot();
    });
  }
});

describe("plugin.ts custom options", () => {
  it("custom prefix changes class names", async () => {
    const css = await compilePlugin(["se-md"], "prefix: se;");
    expect(css).toContain(".se-md");
    expect(css).toContain("border-radius");
    expect(css).toContain("corner-shape");
  });

  it("custom prefix works for side variants", async () => {
    const css = await compilePlugin(["se-t-md"], "prefix: se;");
    expect(css).toContain(".se-t-md");
    expect(css).toContain("border-top-left-radius");
    expect(css).toContain("border-top-right-radius");
  });

  it("custom prefix works for amt utility", async () => {
    const css = await compilePlugin(["se-amt-[3]"], "prefix: se;");
    expect(css).toContain(".se-amt-\\[3\\]");
    expect(css).toContain("corner-shape: superellipse");
  });

  it("custom amt-var changes the CSS variable name", async () => {
    const css = await compilePlugin(["squircle-md"], "amt-var: --se-amt;");
    expect(css).toContain("var(--se-amt, 2)");
    expect(css).not.toContain("var(--squircle-amt");
  });

  it("custom amt-var applies to amt utility", async () => {
    const css = await compilePlugin(["squircle-amt-[3]"], "amt-var: --se-amt;");
    expect(css).toContain("--se-amt: 3");
    expect(css).toContain("superellipse(var(--se-amt))");
  });

  it("both options together", async () => {
    const opts = "prefix: round;\namt-var: --round-amt;";
    const css = await compilePlugin(["round-md"], opts);
    expect(css).toContain(".round-md");
    expect(css).toContain("var(--round-amt, 2)");
    expect(css).toContain("superellipse(var(--round-amt, 2))");
  });
});
