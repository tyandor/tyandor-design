/**
 * Visual verification for @tyandor/ui, per component per theme.
 *
 * NOT a pixel-baseline suite, deliberately. Playwright's screenshot
 * comparison is bound to the OS font renderer, so a baseline generated on
 * macOS never matches Linux CI — the suite ends up either permanently red
 * or permanently regenerated, and a regenerated baseline verifies nothing.
 *
 * What PLAN.md actually wants from "a screenshot per component per theme"
 * is proof that the token -> component -> theme chain still works. So this
 * asserts computed styles against the values in tokens.json: reading
 * .ty-card's backgroundColor and comparing it to roles["layer-01"][theme]
 * is platform-independent, and it fails with a token name rather than
 * "3 pixels differ". Full-page screenshots are still captured, as report
 * artifacts for human review.
 */
import { expect, test, type Page } from "@playwright/test";
import raw from "../../packages/tokens/dist/tokens.json" with { type: "json" };

const tokens = raw as unknown as {
  roles: { mcrn: Record<string, string>; earth: Record<string, string> };
  type: { scale: Record<string, { size: string; weight: string; letterSpacing: string }> };
};

const ROOT_PX = 16;
/** tokens.json holds rem; getComputedStyle reports px. */
const remToPx = (rem: string): string => `${parseFloat(rem) * ROOT_PX}px`;

type Theme = "mcrn" | "earth";
const THEMES: readonly Theme[] = ["mcrn", "earth"];

/** getComputedStyle reports colours as `rgb(r, g, b)`; tokens.json holds hex. */
function hexToRgb(hex: string): string {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
}

const roleColor = (theme: Theme, role: string): string => {
  const hex = tokens.roles[theme][role];
  if (!hex) throw new Error(`tokens.json has no role "${role}"`);
  return hexToRgb(hex);
};

/**
 * Every assertion is (selector, CSS property, role token). Adding a
 * component to the gallery means adding a line here — which is the point:
 * the list is the inventory of what has been checked in both themes.
 */
interface Probe {
  readonly selector: string;
  /** Kebab-case: this is what getPropertyValue() accepts, not the camelCase form. */
  readonly property: string;
  readonly role: string;
}

const PAGES: readonly { path: string; name: string; probes: readonly Probe[] }[] = [
  {
    path: "/components/foundation",
    name: "foundation",
    probes: [
      { selector: ".ty-type-body-02", property: "color", role: "text-primary" },
      { selector: ".ty-tone-secondary", property: "color", role: "text-secondary" },
      { selector: ".ty-tone-success", property: "color", role: "support-success" },
      { selector: ".ty-tone-error", property: "color", role: "support-error" },
      { selector: ".ty-tone-link", property: "color", role: "link" },
      {
        selector: '.ty-theme-toggle__option[aria-checked="true"]',
        property: "background-color",
        role: "interactive",
      },
      { selector: ".ty-theme-toggle", property: "border-top-color", role: "border-subtle" },
    ],
  },
  {
    path: "/components/navigation",
    name: "navigation",
    probes: [
      { selector: ".ty-header", property: "border-bottom-color", role: "border-subtle" },
      { selector: ".ty-header__brand", property: "color", role: "text-emphasis" },
      { selector: ".ty-breadcrumb__link", property: "color", role: "link" },
      // State-qualified: the gallery renders an active pill first, and a
      // bare .ty-pill would match that one and read `interactive`.
      {
        selector: '.ty-pill:not([aria-current="page"]):not([aria-pressed="true"])',
        property: "background-color",
        role: "layer-01",
      },
      {
        selector: '.ty-pill[aria-current="page"]',
        property: "background-color",
        role: "interactive",
      },
      { selector: ".ty-footer__heading", property: "color", role: "text-secondary" },
    ],
  },
  {
    path: "/components/content",
    name: "content",
    probes: [
      { selector: ".ty-card", property: "background-color", role: "layer-01" },
      { selector: ".ty-card--raised", property: "background-color", role: "layer-02" },
      { selector: ".ty-card", property: "border-top-color", role: "border-subtle" },
      { selector: ".ty-card__title", property: "color", role: "text-emphasis" },
      { selector: ".ty-tag--success", property: "border-top-color", role: "support-success" },
      { selector: ".ty-tag--error", property: "border-top-color", role: "support-error" },
      { selector: ".ty-divider", property: "background-color", role: "border-subtle" },
      { selector: ".ty-quote", property: "border-left-color", role: "interactive" },
      { selector: ".ty-prose", property: "color", role: "text-primary" },
    ],
  },
];

/**
 * Seed the theme the way a returning visitor arrives with one: in
 * localStorage, before the document loads, so the pre-hydration script in
 * <head> is what applies it. Setting data-theme directly would test the
 * stylesheet but skip themeScript entirely.
 */
async function visit(page: Page, path: string, theme: Theme) {
  await page.addInitScript(
    ([key, value]) => window.localStorage.setItem(key as string, value as string),
    ["ty-theme", theme],
  );
  await page.goto(path, { waitUntil: "networkidle" });
}

const computed = (page: Page, selector: string, property: string) =>
  page.locator(selector).first().evaluate(
    (el, prop) => window.getComputedStyle(el).getPropertyValue(prop),
    property,
  );

for (const { path, name, probes } of PAGES) {
  test.describe(`${name} components`, () => {
    for (const theme of THEMES) {
      test(`resolve their role tokens under ${theme}`, async ({ page }, testInfo) => {
        await visit(page, path, theme);

        // themeScript ran before paint and set the attribute from storage.
        await expect(page.locator("html")).toHaveAttribute("data-theme", theme);

        for (const probe of probes) {
          const actual = await computed(page, probe.selector, probe.property);
          expect(
            actual,
            `${probe.selector} { ${probe.property} } should be ${probe.role}`,
          ).toBe(roleColor(theme, probe.role));
        }

        testInfo.attach(`${name}-${theme}.png`, {
          body: await page.screenshot({ fullPage: true }),
          contentType: "image/png",
        });
      });
    }

    test("themes actually repaint the page", async ({ page }) => {
      // Guards the failure mode every other assertion would miss: a
      // stylesheet that renders correctly but ignores the theme swap.
      await visit(page, path, "mcrn");
      const dark = await computed(page, "body", "background-color");
      await visit(page, path, "earth");
      const light = await computed(page, "body", "background-color");
      expect(dark).not.toBe(light);
    });
  });
}

test.describe("theme mechanics", () => {
  test('"system" is the absence of data-theme, not a resolved value', async ({ page }) => {
    // tokens.css guards its prefers-color-scheme block with
    // :root:not([data-theme]), so pinning the attribute would silently stop
    // the page tracking the OS.
    await page.goto("/components", { waitUntil: "networkidle" });
    await expect(page.locator("html")).not.toHaveAttribute("data-theme", /.*/);
  });

  test("the toggle switches theme and survives a reload", async ({ page }) => {
    await page.goto("/components", { waitUntil: "networkidle" });
    await page.getByRole("radio", { name: "Earth — light" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "earth");

    await page.reload({ waitUntil: "networkidle" });
    await expect(page.locator("html")).toHaveAttribute("data-theme", "earth");
    await expect(page.getByRole("radio", { name: "Earth — light" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });
});

/**
 * label-01 and its treatment class.
 *
 * The colour probes above assert selector -> role colour, which cannot say
 * anything about type metrics. This closes that gap for the scale's floor:
 * label-01 exists precisely because apps/docs kept hard-coding sizes below
 * code-01, so it is worth proving the token actually reaches the browser
 * rather than trusting that the build emitted it.
 */
test.describe("label-01", () => {
  test("the token reaches the browser with its own metrics", async ({ page }) => {
    await visit(page, "/components/foundation", "mcrn");
    const t = tokens.type.scale["label-01"]!;

    expect(await computed(page, ".ty-type-label-01", "font-size")).toBe(remToPx(t.size));
    expect(await computed(page, ".ty-type-label-01", "font-weight")).toBe(t.weight);

    // Neutral on purpose — the eyebrow treatment lives in .ty-label, not here.
    expect(t.letterSpacing).toBe("0");
    expect(await computed(page, ".ty-type-label-01", "text-transform")).toBe("none");
  });

  test(".ty-label adds the treatment without redefining the metrics", async ({ page }) => {
    await visit(page, "/components/foundation", "mcrn");
    const t = tokens.type.scale["label-01"]!;

    // Size comes from the token; casing, weight and tracking are the treatment.
    expect(await computed(page, ".ty-label", "font-size")).toBe(remToPx(t.size));
    expect(await computed(page, ".ty-label", "text-transform")).toBe("uppercase");
    expect(await computed(page, ".ty-label", "letter-spacing")).not.toBe("normal");
  });

  test("no element still carries a hard-coded sub-code-01 size", async ({ page }) => {
    await visit(page, "/components/foundation", "mcrn");
    const floor = parseFloat(tokens.type.scale["label-01"]!.size) * ROOT_PX;
    const strays = await page.evaluate((floorPx) => {
      const out: string[] = [];
      // Array.from, not for-of: the repo's lib config does not give
      // NodeListOf an iterator (TS2488).
      for (const el of Array.from(document.querySelectorAll<HTMLElement>("body *"))) {
        const px = parseFloat(getComputedStyle(el).fontSize);
        if (px < floorPx - 0.01) out.push(`${el.tagName}.${el.className} @ ${px}px`);
      }
      return out;
    }, floor);
    expect(strays, "elements rendering below the scale's floor").toEqual([]);
  });
});
