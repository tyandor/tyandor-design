/**
 * Contract tests for @tyandor/ui.
 *
 * Two halves. The stylesheet half re-asserts the build gates against the
 * committed dist — build.ts can only vouch for the file it just wrote, and
 * dist/ is checked in, so a hand-edit would otherwise ship unnoticed. The
 * component half renders to static markup and asserts the accessibility
 * contracts, which are the part of a design system most likely to rot.
 */
import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement as h } from "react";
import { typeScale } from "@tyandor/tokens";
import { Breadcrumb } from "../src/navigation/breadcrumb.tsx";
import { Card } from "../src/content/card.tsx";
import { Divider } from "../src/content/divider.tsx";
import { Grid, Stack } from "../src/primitives/stack.tsx";
import { Heading, Text } from "../src/primitives/text.tsx";
import { Pill } from "../src/navigation/pill.tsx";
import { Tag, Badge } from "../src/content/tag.tsx";
import { DEFAULT_STORAGE_KEY, themeScript } from "../src/theme/theme-script.ts";

const uiCss = await Bun.file(new URL("../dist/ui.css", import.meta.url)).text();
const tokensCss = await Bun.file(
  new URL("../../tokens/dist/tokens.css", import.meta.url),
).text();

/** Comments and string literals must not be scanned for colours or selectors. */
const strip = (css: string) =>
  css.replace(/\/\*[\s\S]*?\*\//g, "").replace(/"[^"]*"/g, '""');

const classesIn = (css: string) =>
  new Set([...strip(css).matchAll(/\.(ty-[a-z0-9_-]+)/gi)].map((m) => m[1]!));

const render = (el: Parameters<typeof renderToStaticMarkup>[0]) => renderToStaticMarkup(el);

describe("stylesheet contract", () => {
  test("no literal colour values reach the component layer", () => {
    // Principle 1: no component may use a raw hex. rgba() is allowed only
    // in the var(--ty-*-rgb) form, which starts with a letter, not a digit.
    const raw = strip(uiCss).match(/#[0-9a-f]{3,8}\b|\b(?:rgb|hsl)a?\(\s*[\d.]/gi);
    expect(raw ?? []).toEqual([]);
  });

  test("every referenced token exists in tokens.css", () => {
    const defined = new Set(
      strip(tokensCss)
        .match(/(--ty-[a-z0-9-]+)\s*:/gi)
        ?.map((m) => m.split(":")[0]!.trim()) ?? [],
    );
    const selfDefined = new Set(
      strip(uiCss)
        .match(/(--ty-[a-z0-9-]+)\s*:/gi)
        ?.map((m) => m.split(":")[0]!.trim()) ?? [],
    );
    // Set inline by components, never declared in a stylesheet.
    const componentSet = new Set([
      "--ty-stack-gap",
      "--ty-grid-layout-gap",
      "--ty-grid-layout-columns",
      "--ty-grid-layout-min",
      "--ty-container-max",
    ]);

    const referenced = [...strip(uiCss).matchAll(/var\(\s*(--ty-[a-z0-9-]+)/gi)].map((m) => m[1]!);
    const unknown = referenced.filter(
      (v) => !defined.has(v) && !selfDefined.has(v) && !componentSet.has(v),
    );
    expect(unknown).toEqual([]);
  });

  test("does not shadow a class tokens.css already defines", () => {
    // tokens.css ships .ty-grid and .ty-measure for vanilla-CSS consumers who
    // never install this package; redefining them would change their pages.
    const overlap = [...classesIn(uiCss)].filter((c) => classesIn(tokensCss).has(c));
    expect(overlap).toEqual([]);
  });

  test("every type-scale role has a generated class", () => {
    for (const token of Object.keys(typeScale)) {
      expect(uiCss, `.ty-type-${token}`).toContain(`.ty-type-${token} {`);
    }
  });

  test("code roles are set in Mono, everything else in the body stack", () => {
    const block = (token: string) =>
      uiCss.slice(uiCss.indexOf(`.ty-type-${token} {`), uiCss.indexOf(`.ty-type-${token} {`) + 220);
    expect(block("code-01")).toContain("var(--ty-font-mono)");
    expect(block("body-02")).toContain("var(--ty-font-body)");
    expect(block("heading-04")).toContain("var(--ty-font-body)");
  });
});

describe("Text and Heading", () => {
  test("size names a role, which becomes the generated class", () => {
    expect(render(h(Text, { size: "body-02" }, "x"))).toContain("ty-type-body-02");
  });

  test("readout replaces the scale class rather than stacking with it", () => {
    const html = render(h(Text, { readout: true, size: "body-02" }, "x"));
    expect(html).toContain("ty-readout");
    expect(html).not.toContain("ty-type-body-02");
  });

  test("level drives the tag, size drives the look, independently", () => {
    const html = render(h(Heading, { level: 2, size: "heading-02" }, "x"));
    expect(html).toStartWith("<h2");
    expect(html).toContain("ty-type-heading-02");
  });

  test("heading level picks a default size when none is given", () => {
    expect(render(h(Heading, { level: 1 }, "x"))).toContain("ty-type-heading-06");
  });
});

describe("Stack and Grid", () => {
  test("gap resolves to a token variable, never a raw length", () => {
    const html = render(h(Stack, { gap: "07" }, "x"));
    expect(html).toContain("--ty-stack-gap:var(--ty-spacing-07)");
    expect(html).not.toContain("2rem");
  });

  test("horizontal stacks wrap by default, vertical ones do not", () => {
    expect(render(h(Stack, { direction: "horizontal" }, "x"))).toContain("ty-stack--wrap");
    expect(render(h(Stack, {}, "x"))).toContain("ty-stack--nowrap");
  });

  test("minItemWidth takes precedence over columns", () => {
    const html = render(h(Grid, { columns: 4, minItemWidth: "12rem" }, "x"));
    expect(html).toContain("ty-grid-layout--auto");
    expect(html).toContain("--ty-grid-layout-min:12rem");
    expect(html).not.toContain("--ty-grid-layout-columns");
  });

  test("renders .ty-grid-layout, not the .ty-grid tokens.css owns", () => {
    const html = render(h(Grid, { columns: 2 }, "x"));
    // Split on whitespace rather than pattern-matching: \b treats the hyphen
    // in "ty-grid-layout" as a boundary, so /\bty-grid\b/ matches its prefix.
    const classes = (html.match(/class="([^"]*)"/)?.[1] ?? "").split(/\s+/);
    expect(classes).toContain("ty-grid-layout");
    expect(classes).not.toContain("ty-grid");
  });
});

describe("accessibility contracts", () => {
  test("Breadcrumb renders the last crumb as current, not as a link", () => {
    const html = render(
      h(Breadcrumb, {
        items: [
          { label: "Home", href: "/" },
          { label: "Here", href: "/here" },
        ],
      }),
    );
    // A link to the page you are already on is a dead end for keyboard users.
    expect(html).toContain('aria-current="page"');
    expect(html).toContain('href="/"');
    expect(html).not.toContain('href="/here"');
  });

  test("Breadcrumb separators are hidden from assistive tech", () => {
    const html = render(h(Breadcrumb, { items: [{ label: "a", href: "/" }, { label: "b" }] }));
    expect(html).toContain('aria-hidden="true"');
  });

  test("Pill announces navigation and toggling differently", () => {
    expect(render(h(Pill, { href: "/x", active: true }, "x"))).toContain('aria-current="page"');
    const button = render(h(Pill, { active: true }, "x"));
    expect(button).toStartWith("<button");
    expect(button).toContain('aria-pressed="true"');
  });

  test("vertical Divider is a separator, not an hr", () => {
    // hr is a paragraph-level thematic break; using one inside a row of
    // controls is a semantic claim the markup cannot honour.
    const vertical = render(h(Divider, { orientation: "vertical" }));
    expect(vertical).toContain('role="separator"');
    expect(vertical).not.toStartWith("<hr");
    expect(render(h(Divider, {}))).toStartWith("<hr");
  });

  test("Card renders an anchor only when it is actually a link", () => {
    expect(render(h(Card, { href: "/x" }, "x"))).toStartWith("<a");
    expect(render(h(Card, {}, "x"))).toStartWith("<div");
    expect(render(h(Card, {}, "x"))).not.toContain("ty-card--link");
  });

  test("Tag dots are decorative", () => {
    expect(render(h(Tag, { variant: "success", dot: true }, "ok"))).toContain('aria-hidden="true"');
  });

  test("Badge is an alias for Tag, not a copy of it", () => {
    expect(Badge).toBe(Tag);
  });
});

describe("themeScript", () => {
  test("carries the storage key it will be read back with", () => {
    expect(themeScript()).toContain(JSON.stringify(DEFAULT_STORAGE_KEY));
    expect(themeScript("custom-key")).toContain('"custom-key"');
  });

  test("only ever sets data-theme, never removes it", () => {
    // "system" is encoded as the absence of the attribute, which is also the
    // document's initial state — so there is nothing for the script to undo.
    expect(themeScript()).toContain("setAttribute");
    expect(themeScript()).not.toContain("removeAttribute");
  });

  test("survives a localStorage access that throws", () => {
    // Safari in private mode throws rather than returning null. A theme
    // preference is not worth a blank page.
    expect(themeScript()).toContain("catch");
  });
});
