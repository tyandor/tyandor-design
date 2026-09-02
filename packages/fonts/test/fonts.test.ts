import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync, statSync } from "node:fs";
import { faces, families, facesOf, weightOf, upstream, type Face } from "../src/index.ts";
import { fontFamily } from "../../tokens/src/type.ts";

const DIST = new URL("../dist/", import.meta.url);
const css = readFileSync(new URL("fonts.css", DIST), "utf8");
const split = faces.filter((f) => f.subset !== "all");

const expand = (ranges: readonly string[]): Set<number> => {
  const out = new Set<number>();
  for (const r of ranges) {
    const [lo, hi] = r.slice(2).split("-");
    const start = parseInt(lo!, 16);
    const end = hi === undefined ? start : parseInt(hi, 16);
    for (let c = start; c <= end; c++) out.add(c);
  }
  return out;
};

describe("manifest", () => {
  test("covers both families in both styles across three cuts", () => {
    expect(faces).toHaveLength(2 * 2 * 3);
    for (const family of families) {
      for (const style of ["normal", "italic"] as const) {
        const cuts = faces.filter((f) => f.family === family && f.style === style);
        expect(cuts.map((f) => f.subset).sort()).toEqual(["all", "latin", "latin-ext"]);
      }
    }
  });

  test("pins upstream to a full commit sha under the OFL", () => {
    expect(upstream.commit).toMatch(/^[0-9a-f]{40}$/);
    expect(upstream.license).toBe("SIL Open Font License 1.1");
  });

  test("every face keeps both variable axes", () => {
    for (const f of faces) {
      const axes = Object.fromEntries(f.axes.map((a) => [a.tag, a]));
      // One file must answer every weight token, or type.ts is lying.
      expect(axes["wght"]).toMatchObject({ min: 400, max: 700 });
      expect(f.weight).toBe("400 700");
      // iA's letter-spacing axis. Losing it costs the duospace tuning.
      expect(axes["SPCG"]).toBeDefined();
    }
  });
});

describe("binaries", () => {
  test("each manifest entry exists at the recorded size", () => {
    for (const f of faces) {
      const path = new URL(`files/${f.file}`, DIST);
      expect(existsSync(path)).toBe(true);
      expect(statSync(path).size).toBe(f.bytes);
    }
  });

  test("each file is genuinely woff2-compressed", () => {
    // Options.flavor is inert outside fontTools' CLI: it is entirely possible
    // to emit an uncompressed TTF under a .woff2 name and notice nothing.
    for (const f of faces) {
      const magic = readFileSync(new URL(`files/${f.file}`, DIST)).subarray(0, 4).toString("latin1");
      expect(magic).toBe("wOF2");
    }
  });

  test("ships the licence text beside the binaries", () => {
    // The *embedded* notice (nameID 13) is guarded in subset-fonts.py, which
    // still has the font open: woff2 brotli-compresses the name table along
    // with everything else, so it cannot be grepped for out here.
    const licence = readFileSync(new URL("../LICENSE-OFL.md", DIST), "utf8");
    expect(licence).toContain("SIL OPEN FONT LICENSE Version 1.1");
    expect(licence).toContain('Reserved Font Name "iA Writer"');
  });
});

describe("subsets", () => {
  test("latin and latin-ext never overlap", () => {
    for (const family of families) {
      for (const style of ["normal", "italic"] as const) {
        const of = (subset: Face["subset"]) =>
          faces.find((f) => f.family === family && f.style === style && f.subset === subset)!;
        const a = expand(of("latin").unicodeRange);
        const b = expand(of("latin-ext").unicodeRange);
        const overlap = [...a].filter((c) => b.has(c));
        expect(overlap).toEqual([]);
      }
    }
  });

  test("the all cut is exactly the union of the two split cuts", () => {
    for (const family of families) {
      for (const style of ["normal", "italic"] as const) {
        const cuts = faces.filter((f) => f.family === family && f.style === style);
        const of = (subset: Face["subset"]) => cuts.find((f) => f.subset === subset)!;
        const union = new Set([...expand(of("latin").unicodeRange), ...expand(of("latin-ext").unicodeRange)]);
        expect(expand(of("all").unicodeRange)).toEqual(union);
      }
    }
  });

  test("splitting pays for itself on a latin-only page", () => {
    expect(weightOf("latin")).toBeLessThan(weightOf("all"));
  });

  test("the logo's glyphs are absent upstream, as PROVENANCE records", () => {
    // U+2227 / U+2228. PLAN.md asks for them; no iA Writer face has them.
    // If a future upstream bump adds them, this fails and PROVENANCE.md and
    // the subset ranges both want revisiting.
    for (const f of faces) {
      const cps = expand(f.unicodeRange);
      expect(cps.has(0x2227)).toBe(false);
      expect(cps.has(0x2228)).toBe(false);
    }
  });
});

describe("fonts.css", () => {
  test("emits one rule per split cut and none for the all cut", () => {
    expect(css.match(/@font-face/g) ?? []).toHaveLength(split.length);
    for (const f of split) expect(css).toContain(`url("./files/${f.file}")`);
    for (const f of faces.filter((x) => x.subset === "all")) {
      expect(css).not.toContain(`url("./files/${f.file}")`);
    }
  });

  test("every rule swaps and declares a unicode-range", () => {
    const rules = css.split("@font-face").slice(1);
    expect(rules).toHaveLength(split.length);
    for (const rule of rules) {
      expect(rule).toContain("font-display: swap;");
      expect(rule).toContain("unicode-range:");
      expect(rule).toContain("font-weight: 400 700;");
    }
  });

  test("declares the families the token contract already names", () => {
    // The seam between the two packages: no import, just a shared string.
    for (const family of families) {
      expect(css).toContain(`font-family: "${family}";`);
    }
    expect(fontFamily.body).toContain('"iA Writer Duo"');
    expect(fontFamily.mono).toContain('"iA Writer Mono"');
  });

  test("no url points at a file that is not shipped", () => {
    for (const [, file] of css.matchAll(/url\("\.\/files\/([^"]+)"\)/g)) {
      expect(existsSync(new URL(`files/${file}`, DIST))).toBe(true);
    }
  });
});

describe("next bindings", () => {
  // src/next.ts cannot be imported here: next/font/local is an optional peer,
  // and its loader only exists inside a Next build. Read it as source instead.
  const source = readFileSync(new URL("../src/next.ts", DIST), "utf8");

  test("names only files that exist, and only the all cut", () => {
    const paths = [...source.matchAll(/path: "\.\.\/dist\/files\/([^"]+)"/g)].map((m) => m[1]!);
    expect(paths).toHaveLength(4);
    for (const file of paths) {
      const face = faces.find((f) => f.file === file);
      expect(face, `${file} is not in the manifest`).toBeDefined();
      // Split cuts here would leave the second @font-face masking the first.
      expect(face!.subset).toBe("all");
    }
  });

  test("binds the variables the tokens package publishes", () => {
    expect(source).toContain('variable: "--ty-font-body"');
    expect(source).toContain('variable: "--ty-font-mono"');
  });

  test("weights stay in step with the manifest", () => {
    for (const [, weight] of source.matchAll(/weight: "([^"]+)"/g)) {
      expect(faces.some((f) => f.weight === weight)).toBe(true);
    }
  });
});

describe("helpers", () => {
  test("facesOf narrows by family and subset", () => {
    expect(facesOf("iA Writer Duo")).toHaveLength(6);
    expect(facesOf("iA Writer Mono", "latin")).toHaveLength(2);
    expect(facesOf("iA Writer Duo", "all").map((f) => f.style).sort()).toEqual(["italic", "normal"]);
  });
});
