import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { compile } from "tailwindcss";
import { describe, expect, it } from "vitest";

const VARIANTS: Record<string, string[]> = {
  "": ["border-radius"],
  t: ["border-top-left-radius", "border-top-right-radius"],
  r: ["border-top-right-radius", "border-bottom-right-radius"],
  b: ["border-bottom-left-radius", "border-bottom-right-radius"],
  l: ["border-top-left-radius", "border-bottom-left-radius"],
  s: ["border-start-start-radius", "border-end-start-radius"],
  e: ["border-start-end-radius", "border-end-end-radius"],
  tl: ["border-top-left-radius"],
  tr: ["border-top-right-radius"],
  br: ["border-bottom-right-radius"],
  bl: ["border-bottom-left-radius"],
  ss: ["border-start-start-radius"],
  se: ["border-start-end-radius"],
  es: ["border-end-start-radius"],
  ee: ["border-end-end-radius"],
};

const srcDir = import.meta.dirname;
const require = createRequire(import.meta.url);

function resolveStylesheetPath(id: string, base: string): string {
  if (id === "tailwindcss") {
    return require.resolve("tailwindcss/index.css");
  }
  if (id.startsWith("tailwindcss/")) {
    return require.resolve(id.endsWith(".css") ? id : `${id}.css`);
  }
  return join(base, id);
}

async function loadStylesheet(id: string, base: string) {
  const path = resolveStylesheetPath(id, base);
  const content = await readFile(path, "utf-8");
  return { path, base: dirname(path), content };
}

async function loadModule(id: string, base: string, _resourceHint: "plugin" | "config") {
  const path = join(base, id);
  const module = await import(path);
  return { path, base, module: module.default ?? module };
}

function extractUtilitiesLayer(css: string): string {
  const match = /@layer utilities \{([\s\S]*)\}\s*$/.exec(css);
  return match?.[1]?.trim() ?? "";
}

async function compileCss(candidates: string[]): Promise<string> {
  const input = `
@import "tailwindcss";
@import "../dist/squircle.css";
`;
  const compiler = await compile(input, {
    base: srcDir,
    loadStylesheet,
    loadModule,
  });
  return extractUtilitiesLayer(compiler.build(candidates));
}

async function compilePlugin(candidates: string[], pluginBlock = ""): Promise<string> {
  const pluginDecl = pluginBlock
    ? `@plugin "./plugin.ts" {\n${pluginBlock}\n}`
    : `@plugin "./plugin.ts";`;
  const input = `
@import "tailwindcss";
${pluginDecl}
`;
  const compiler = await compile(input, {
    base: srcDir,
    loadStylesheet,
    loadModule,
  });
  return extractUtilitiesLayer(compiler.build(candidates));
}

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
      expect(css).toContain("@supports (corner-shape: superellipse())");
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
      expect(css).toContain("@supports (corner-shape: superellipse())");
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
