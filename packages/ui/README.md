# @tyandor/ui

Themed components for the tyandor design system. Carbon's interaction
patterns, the Expanse palette's values, iA Writer's typefaces.

## The shape of this package

Components ship as **plain CSS classes**, not Tailwind utilities.

tyandor-web is on Tailwind 3, new projects are on 4, and some consumers have
no build step at all. Utility classes would make a component import drag a
build-config change along with it — install the preset, add the package to
your `content` globs, hope the versions agree. A stylesheet of
`var(--ty-*)`-backed classes reaches all three consumers identically, and it
is what Carbon itself does (`@carbon/styles` ships CSS, not utilities).

The package has no runtime dependencies. Radix will arrive with the controls
in milestone 7 — Dialog, Tabs, Tooltip, Select genuinely need it. Nothing in
the current inventory does, and a dependency with no consumer is just a
dependency.

## Install

```json
{
  "dependencies": {
    "@tyandor/tokens": "github:tyandor/tyandor-design#path:packages/tokens",
    "@tyandor/ui":     "github:tyandor/tyandor-design#path:packages/ui"
  }
}
```

`ui.css` must load **after** `tokens.css` — every value in it resolves
through a `--ty-*` custom property, and without the token layer the rules
render as unset:

```css
@import "@tyandor/tokens/tokens.css";
@import "@tyandor/ui/ui.css";
```

The package ships raw `.tsx`. Under Next, transpile it:

```js
// next.config.mjs
export default { transpilePackages: ["@tyandor/ui"] };
```

## Theming

```tsx
import { ThemeProvider, ThemeToggle, themeScript } from "@tyandor/ui";

export default function RootLayout({ children }) {
  return (
    <html suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript() }} />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
```

Two things about that script are load-bearing:

- It is **inline and synchronous**, because it exists to run before the
  first paint. Anything deferred runs after it, which is exactly the frame
  being fixed — without it a returning visitor on Earth gets a flash of
  MCRN.
- It lives in its own module, with no `"use client"` directive. That
  directive marks a whole *module*, not individual exports, so shipping it
  alongside the provider would make it uncallable from a server component.

`system` is encoded as the **absence** of `data-theme`, not as a resolved
value. `tokens.css` guards its `prefers-color-scheme` block with
`:root:not([data-theme])`, so an absent attribute hands control to the media
query and a present one takes it back. Pinning it would silently stop the
page tracking the OS.

## Framework-agnostic links

Components that render an anchor take an `as` prop:

```tsx
import Link from "next/link";

<HeaderLink as={Link} href="/tokens">Tokens</HeaderLink>
<Breadcrumb linkAs={Link} items={crumbs} />
```

This is why the package never imports `next/link` itself — doing so would
make it unusable outside Next.

## What the build enforces

`build.ts` generates the type-scale classes from `@tyandor/tokens` and then
runs three gates. Together they turn the design system's principles into
build failures rather than documentation:

| Gate | Fails when |
|---|---|
| No raw colour | Any literal hex or numeric `rgb()`/`hsl()` reaches `ui.css` |
| No shadowing | A class here redefines one `tokens.css` already ships (`.ty-grid`, `.ty-measure`) |
| No unknown tokens | A rule reads a `--ty-*` variable nothing defines |

The third catches the quietest bug of the three: a typo'd custom property
resolves to nothing, silently, and sometimes only in one theme.

## Inventory

**Foundation** — `ThemeProvider`, `ThemeToggle`, `Text`, `Heading`,
`Stack`, `Grid`
**Navigation** — `Header`, `HeaderBrand`, `HeaderLink`, `Footer`,
`FooterColumn`, `Breadcrumb`, `Pill`
**Content** — `Card`, `CardTitle`, `CardBody`, `CardFooter`, `Tag`/`Badge`,
`Divider`, `Quote`, `Prose`

Live examples and prop tables: <https://design.tyandor.com/components>

## Notes

- Only the theme module is a client component. Everything else renders on
  the server.
- `Stack` and `Grid` pass their variable axis through a scoped custom
  property rather than a class per value — thirteen spacing steps across two
  directions and two components is 52 classes nobody wants to ship. The
  inline value is always `var(--ty-spacing-NN)`, never a raw length.
- `Grid` renders `.ty-grid-layout`, **not** `.ty-grid`. `tokens.css` owns
  `.ty-grid` for the canonical 16-column fluid 2x grid, which stays
  available to consumers who never install this package.
- `--ty-ui-radius` and `--ty-ui-border` are component-layer knobs, not part
  of the token contract. Override them freely; nothing downstream (nvim
  themes, terminal themes) reads them.
