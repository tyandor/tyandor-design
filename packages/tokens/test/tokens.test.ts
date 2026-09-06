/**
 * Contract tests. These guard the promises in PLAN.md's principles —
 * especially "two themes, one contract" and "no raw hex".
 */
import { describe, expect, test } from "bun:test";
import { roles, type RoleName } from "../src/themes.ts";
import { spacing, spacingOrder } from "../src/spacing.ts";
import { typeScale } from "../src/type.ts";
import { accents } from "../src/color.ts";
import { contrastRatio, hexToRgb, rgbChannels } from "../src/contrast.ts";

const ROLE_NAMES = Object.keys(roles) as RoleName[];
const dist = (f: string) => Bun.file(new URL(`../dist/${f}`, import.meta.url)).text();

const HEX_OR_RGBA = /^(#[0-9a-f]{6}|rgba?\([\d.,\s/%]+\))$/i;

describe("role contract", () => {
  test("every role resolves in both themes", () => {
    for (const name of ROLE_NAMES) {
      const { mcrn, earth } = roles[name].value;
      expect(mcrn, `${name}.mcrn`).toMatch(HEX_OR_RGBA);
      expect(earth, `${name}.earth`).toMatch(HEX_OR_RGBA);
    }
  });

  test("every foreground role declares the surfaces it sits on", () => {
    for (const name of ROLE_NAMES) {
      const role = roles[name];
      if (role.kind === "text" || role.kind === "nontext") {
        expect(role.over?.length, `${name} must declare .over for the contrast gate`).toBeGreaterThan(0);
      }
    }
  });

  test("every .over target is a real role", () => {
    for (const name of ROLE_NAMES) {
      for (const target of roles[name].over ?? []) {
        expect(ROLE_NAMES, `${name}.over -> ${target}`).toContain(target as RoleName);
      }
    }
  });
});

describe("generated css", () => {
  test("defines every role in the default block and the earth override", async () => {
    const css = await dist("tokens.css");
    const earthBlock = css.slice(css.indexOf('[data-theme="earth"]'));
    for (const name of ROLE_NAMES) {
      expect(css, `:root --ty-${name}`).toContain(`--ty-${name}:`);
      expect(earthBlock, `earth --ty-${name}`).toContain(`--ty-${name}:`);
    }
  });

  test("sets color-scheme so native controls follow the theme", async () => {
    const css = await dist("tokens.css");
    expect(css).toContain("color-scheme: dark;");
    expect(css).toContain("color-scheme: light;");
  });

  test("both selection mechanisms are shipped for both themes", async () => {
    const css = await dist("tokens.css");
    for (const theme of ["earth", "mcrn"]) {
      expect(css, `[data-theme="${theme}"]`).toContain(`[data-theme="${theme}"]`);
      expect(css, `.ty-theme-${theme}`).toContain(`.ty-theme-${theme}`);
    }
  });

  test("the light media query cannot override an explicit choice", async () => {
    const css = await dist("tokens.css");
    // Slice from the media block, not from the first ":root:not(" in the
    // file — the header comment discusses that selector, and anchoring on it
    // silently produced an empty slice that "failed" for the wrong reason.
    const mediaAt = css.indexOf("@media (prefers-color-scheme: light)");
    expect(mediaAt).toBeGreaterThan(-1);
    const guard = css.slice(mediaAt, css.indexOf("{", css.indexOf(":root", mediaAt)));

    // Assert the property, not the spelling. The earlier version of this test
    // only checked that :root:not([data-theme]) appeared, which the attribute
    // mechanism satisfied on its own — so it went green while a class-based
    // choice was still being overridden by this very block. Every selector a
    // consumer can use to state a preference has to disarm the fallback, so
    // derive the list from the selectors we actually ship rather than
    // restating it here.
    // Each block heads two lines: `[data-theme="x"],` then `.ty-theme-x {`.
    // Match both terminators — anchoring on the comma alone collected only the
    // attribute selectors, so the class assertions never ran at all.
    const selectors = [
      ...css.matchAll(/^(\[data-theme="\w+"\]|\.ty-theme-[\w-]+)\s*[,{]$/gm),
    ].map((m) => m[1]!);
    expect(selectors.length, "found no theme selectors to check").toBe(4);

    for (const selector of new Set(selectors)) {
      // A class disarms via :not(.foo); an attribute via the bare :not([data-theme]),
      // which covers every value at once.
      const disarm = selector.startsWith(".") ? `:not(${selector})` : ":not([data-theme])";
      expect(guard, `${selector} must disarm the light fallback`).toContain(disarm);
    }
  });
});

describe("tailwind preset", () => {
  test("contains no raw hex values — principle 1", async () => {
    const preset = await dist("tailwind-preset.cjs");
    const body = preset.slice(preset.indexOf("module.exports"));
    expect(body).not.toMatch(/#[0-9a-fA-F]{6}/);
  });

  test("colours support opacity modifiers", async () => {
    const preset = await dist("tailwind-preset.cjs");
    expect(preset).toContain("rgb(var(--ty-layer-01-rgb) / <alpha-value>)");
  });

  /*
   * Loaded through node, not bun, and through the package's export subpath
   * rather than a relative file URL — because that is precisely what a
   * Tailwind 3 config does: `presets: [require("@tyandor/tokens/tailwind-preset")]`.
   *
   * The previous version of this test used `await import()` from bun and
   * passed for two years' worth of the file being broken. This package is
   * "type": "module", so node parsed the then-.js preset as ESM and handed
   * require() an empty object — no error, no warning, every token class
   * silently resolving to nothing. Bun's loader is lenient about CommonJS in
   * a .js file and papered straight over it. Testing the real runtime is the
   * only version of this test that can fail.
   */
  test("node can require() it through the package export — the Tailwind 3 path", () => {
    const root = new URL("../../../", import.meta.url);
    const probe = `
      const preset = require("@tyandor/tokens/tailwind-preset");
      process.stdout.write(JSON.stringify({
        colors: Object.keys(preset.theme.extend.colors).length,
        lg: preset.theme.extend.screens.lg,
      }));
    `;
    const proc = Bun.spawnSync(["node", "-e", probe], { cwd: root.pathname });

    expect(proc.stderr.toString().trim(), "node require() must not error").toBe("");
    expect(proc.exitCode).toBe(0);

    const theme = JSON.parse(proc.stdout.toString());
    expect(theme.colors, "an empty preset is the failure mode this guards").toBeGreaterThan(
      ROLE_NAMES.length,
    );
    expect(theme.lg).toBe("66rem");
  });

  /*
   * Adding the preset must not change what a class the consumer already uses
   * means. Carbon numbers spacing 01–13 and Tailwind numbers its own scale
   * 0–96; they collide at 10/11/12, where Carbon says 64/80/96px and Tailwind
   * says 40/44/48px. Emitting bare keys silently doubled `h-10`, `p-12` and
   * `mt-12` — no error, just a site that reflows. Hence the `ty-` prefix, and
   * hence this test, which compares a resolved Tailwind config with and
   * without the preset rather than restating the scale.
   *
   * The allow-list below is the line between the two cases. A redefinition is
   * fine where the design system legitimately owns the concept and keeps its
   * meaning — `screens` are Carbon's grid, `font-mono` is iA Writer Mono, and
   * a consumer adopting the preset is adopting both on purpose. It is not fine
   * where a name silently comes to mean something else, which is what
   * spacing 10/11/12 did. Anything new showing up here is an oversight until
   * someone decides otherwise and writes down which of the two it is.
   */
  test("redefines no key Tailwind already defines, except screens", () => {
    // Run from packages/tokens, not the workspace root: apps/docs pulls
    // Tailwind 4 to the hoisted root, and this preset is the Tailwind 3
    // artifact. The v3 copy is this package's own devDependency, nested here.
    const root = new URL("../", import.meta.url);
    const probe = `
      const resolve = require("tailwindcss/resolveConfig");
      const preset  = require("@tyandor/tokens/tailwind-preset");
      const before  = resolve({ content: [] });
      const after   = resolve({ content: [], presets: [preset] });
      const clashes = [];
      for (const section of Object.keys(before.theme)) {
        const b = before.theme[section], a = after.theme[section];
        if (!b || typeof b !== "object") continue;
        for (const key of Object.keys(b)) {
          if (JSON.stringify(a[key]) !== JSON.stringify(b[key])) clashes.push(section + "." + key);
        }
      }
      process.stdout.write(JSON.stringify(clashes));
    `;
    // tailwindcss is not a dependency of this package; skip rather than fail
    // if no consumer in the workspace has pulled it in.
    const has = Bun.spawnSync(["node", "-e", "require.resolve('tailwindcss/resolveConfig')"], {
      cwd: root.pathname,
    });
    if (has.exitCode !== 0) return;

    const proc = Bun.spawnSync(["node", "-e", probe], { cwd: root.pathname });
    expect(proc.stderr.toString().trim()).toBe("");

    const owned = new Set([
      "screens.sm", // Carbon's breakpoints, adopted deliberately.
      "screens.md",
      "screens.lg",
      "maxWidth.screen-sm", // Tailwind derives these from screens.
      "maxWidth.screen-md",
      "maxWidth.screen-lg",
      "fontFamily.mono", // font-mono means iA Writer Mono here. Same concept.
    ]);

    const clashes: string[] = JSON.parse(proc.stdout.toString());
    expect(clashes.filter((k) => !owned.has(k))).toEqual([]);
  });
});

describe("tokens.json", () => {
  test("resolves both variants for every role", async () => {
    const json = JSON.parse(await dist("tokens.json"));
    for (const name of ROLE_NAMES) {
      expect(json.roles.mcrn[name], name).toMatch(HEX_OR_RGBA);
      expect(json.roles.earth[name], name).toMatch(HEX_OR_RGBA);
    }
    expect(json.palette.accents.amber.mcrn).toBe(accents.amber.mcrn);
  });
});

describe("scales", () => {
  test("spacing is strictly increasing", () => {
    const rems = spacingOrder.map((k) => parseFloat(spacing[k]));
    for (let i = 1; i < rems.length; i++) {
      expect(rems[i]!, `step ${i + 1}`).toBeGreaterThan(rems[i - 1]!);
    }
  });

  test("type scale is strictly increasing from label through display", () => {
    // label-01 leads the list on purpose: it is the scale's floor, and the
    // reason it exists is that apps/docs kept reaching below code-01. If a
    // later token undercuts it, this fails rather than quietly reopening
    // the gap that label-01 was added to close.
    const order = [
      "label-01", "code-01", "body-01", "body-02",
      "heading-03", "heading-04", "heading-05", "display-02",
    ] as const;
    const sizes = order.map((k) => parseFloat(typeScale[k].size));
    for (let i = 1; i < sizes.length; i++) expect(sizes[i]!).toBeGreaterThan(sizes[i - 1]!);
  });
});

describe("contrast maths", () => {
  test("matches known WCAG anchors", () => {
    expect(contrastRatio("#ffffff", "#000000")).toBeCloseTo(21, 5);
    expect(contrastRatio("#7ecfcf", "#7ecfcf")).toBeCloseTo(1, 5);
  });

  test("parses shorthand hex", () => {
    expect(hexToRgb("#fff")).toEqual({ r: 255, g: 255, b: 255 });
    expect(rgbChannels("#050910")).toBe("5 9 16");
  });

  test("rejects malformed colours rather than silently returning black", () => {
    expect(() => hexToRgb("not-a-colour")).toThrow();
  });
});

describe("serialisation order", () => {
  test("css emits the spacing scale in ascending order, not JS key order", async () => {
    const css = await dist("tokens.css");
    const emitted = [...css.matchAll(/--ty-spacing-(\d{2}):/g)].map((m) => m[1]!);
    expect(emitted.slice(0, 13)).toEqual([...spacingOrder]);
  });
});

describe("json manifest", () => {
  test("type.scale keys are exactly the TypeToken union", async () => {
    // apps/docs casts Object.entries(tokens.type.scale) to TypeToken keys —
    // tokens.json carries no type information, so this is what makes that
    // cast true rather than merely plausible.
    const manifest = JSON.parse(await dist("tokens.json")) as {
      type: { scale: Record<string, unknown> };
    };
    expect(Object.keys(manifest.type.scale).sort()).toEqual(Object.keys(typeScale).sort());
  });
});
