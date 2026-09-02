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

  test("the light media query cannot override an explicit choice", async () => {
    const css = await dist("tokens.css");
    expect(css).toContain(":root:not([data-theme])");
  });
});

describe("tailwind preset", () => {
  test("contains no raw hex values — principle 1", async () => {
    const preset = await dist("tailwind-preset.js");
    const body = preset.slice(preset.indexOf("module.exports"));
    expect(body).not.toMatch(/#[0-9a-fA-F]{6}/);
  });

  test("colours support opacity modifiers", async () => {
    const preset = await dist("tailwind-preset.js");
    expect(preset).toContain("rgb(var(--ty-layer-01-rgb) / <alpha-value>)");
  });

  test("is requireable and well-formed", async () => {
    const mod = await import(new URL("../dist/tailwind-preset.js", import.meta.url).href);
    const theme = (mod.default ?? mod).theme.extend;
    expect(Object.keys(theme.colors).length).toBeGreaterThan(ROLE_NAMES.length);
    expect(theme.screens.lg).toBe("66rem");
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

  test("type scale is non-decreasing from body through display", () => {
    const order = ["body-01", "body-02", "heading-03", "heading-04", "heading-05", "display-02"] as const;
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
