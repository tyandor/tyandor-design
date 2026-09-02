# @tyandor/tokens

Carbon's token taxonomy, the Expanse palette's values.

Two themes — `mcrn` (dark, default) and `earth` (light) — resolving through one
contract of `--ty-*` custom properties. Components consume roles, never hexes.

## Install

```jsonc
// package.json
{
  "dependencies": {
    "@tyandor/tokens": "github:tyandor/tyandor-design#path:packages/tokens"
  }
}
```

`dist/` is committed, because git dependencies have no build step.

## Use

```ts
// app entry — load once, before any component styles
import "@tyandor/tokens/tokens.css";
```

```js
// tailwind.config.js (Tailwind 3)
module.exports = {
  presets: [require("@tyandor/tokens/tailwind-preset")],
};
```

```html
<div class="bg-layer-01 text-text-primary border border-border-subtle">
  <a class="text-link hover:text-link-hover">nominal</a>
</div>
```

No `dark:` variants anywhere. Every class resolves through a custom property, so
switching `data-theme` reskins the tree with no re-render.

## Theming

MCRN is the default. Earth applies when the visitor has expressed no preference
and their system asks for light, or whenever `data-theme="earth"` is set:

```html
<html data-theme="earth">
```

An explicit `data-theme` always wins — the `prefers-color-scheme` block is scoped
to `:root:not([data-theme])`, so it stops matching once a choice exists.

## Token groups

| Group | Prefix | Notes |
|---|---|---|
| Layering | `--ty-background`, `--ty-layer-01/02`, `--ty-layer-hover`, `--ty-field` | Ordinal: each sits above the last |
| Borders | `--ty-border-subtle/strong/interactive` | |
| Text | `--ty-text-primary/secondary/placeholder/emphasis/on-color/disabled` | |
| Interactive | `--ty-interactive`, `--ty-link`, `--ty-focus` | Amber is the action colour |
| Support | `--ty-support-error/warning/success/info` | |
| Accents | `--ty-accent-amber` … `--ty-accent-void` | **Expressive use only** — charts, syntax, labels. Never UI chrome. |
| Charts | `--ty-chart-01` … `--ty-chart-06` | Pre-ordered for hue separation |
| Spacing | `--ty-spacing-01` … `-13` | Carbon scale, 2–160px |
| Type | `--ty-body-01-size`, `--ty-heading-04-line-height`, … | |
| Motion | `--ty-duration-*`, `--ty-easing-*` | |

Each colour token also has a `--ty-<name>-rgb` twin holding space-separated
channels, which is what makes Tailwind opacity modifiers (`bg-layer-01/50`) work.

## Outputs

| File | For |
|---|---|
| `dist/tokens.css` | Browsers. The runtime contract. |
| `dist/tailwind-preset.js` | Tailwind 3 (and 4 via `@config`). |
| `dist/tokens.json` | Non-JS consumers — nvim, terminal, and Ghostty theme generators. |

## Development

```bash
bun install
bun run build          # regenerate dist/
bun run check:contrast # WCAG AA gate
bun test
bun run ci             # everything CI runs
```

Upstream source of truth for the palette hexes is
`expanse/palette-site/palette.js`. Colour changes belong there first; `src/color.ts`
mirrors it, and `tokens.json` is the bridge back for the theme generators.
