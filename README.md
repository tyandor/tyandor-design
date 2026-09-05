# tyandor-design

The token contract, the Expanse palette, and the iA Writer typefaces every
tyandor project shares. Carbon's architecture, MCRN aesthetic.

Two themes — `mcrn` (dark, default) and `earth` (light) — resolving through one
contract of `--ty-*` custom properties. Components consume roles, never hexes,
so switching `data-theme` reskins a tree with no re-render and no `dark:`
variants anywhere.

<https://design.tyandor.com>

## Packages

| | |
| --- | --- |
| [`@tyandor/tokens`](packages/tokens) | The contract. Colour roles, type scale, spacing, motion, grid — emitted as CSS custom properties, a Tailwind 3 preset, and JSON. Everything else depends on this. |
| [`@tyandor/fonts`](packages/fonts) | iA Writer Duo and Mono, subsetted to woff2 and wired to `--ty-font-*`. |
| [`@tyandor/ui`](packages/ui) | Themed components. Plain CSS classes plus React wrappers, no Radix, no Tailwind dependency. |
| [`apps/docs`](apps/docs) | design.tyandor.com — a rendered view of `tokens.json`, and the system's first consumer. |

`dist/` is committed in each package, because git dependencies have no build
step. CI fails if a committed `dist/` does not match its source.

## Quick start

Requires [Bun](https://bun.sh) 1.2.20 (the version CI pins).

```bash
bun install
bun run dev
```

The docs site comes up on <http://localhost:4310>.

`dev` builds the packages once, starts Next, and watches `packages/*/src`.
Editing a token value or a component stylesheet rebuilds `dist/` and the page
picks it up; component *TypeScript* is exported as source, so those edits
hot-reload without a build.

If a build gate fails while you are working, the error prints and the previous
`dist/` keeps being served — the dev server does not die on a bad save.

## Scripts

| | |
| --- | --- |
| `bun run dev` | Docs site on :4310, with package rebuilds on change. |
| `bun run preview` | Production build, then serve it. What the visual suite tests against. |
| `bun run verify` | Everything CI runs, plus the visual suite. The pre-push check. |
| `bun run build` | Build packages, then the docs app. |
| `bun run typecheck` | `tsc --noEmit` across the workspace. |
| `bun run test` | Unit tests (`bun test packages`). |
| `bun run test:visual` | Playwright. Needs `bun run build:docs` first — it serves the production build. |
| `bun run ci` | typecheck → packages → contrast → type → docs → tests. |
| `bun run check:contrast` | WCAG AA over every role pairing, both themes. |
| `bun run check:type` | Fails on font sizes hard-coded outside the scale. |
| `bun run check:palette` | Drift against the upstream Expanse palette. Not in CI — needs a sibling checkout, and skips cleanly without one. |

## What the build enforces

The system's principles are build failures, not documentation. Six gates:

| Gate | Fails when |
| --- | --- |
| Raw colour | A component stylesheet contains a hex or `rgb()` literal. |
| Class shadowing | `@tyandor/ui` redefines a class that `tokens.css` already owns. |
| Unknown token | A `var(--ty-*)` reference names a token that does not exist. A typo renders nothing, silently, and sometimes in only one theme. |
| Contrast | A role pairing drops below WCAG AA in either theme, outside the recorded exemptions. |
| Type scale | An app hard-codes a font size instead of reaching for a role. |
| Stale `dist` | A committed `dist/` no longer matches its source. |

The first three run inside `packages/ui/build.ts`; the rest are `scripts/` and
CI steps.

## Layout

```
packages/
  tokens/     the contract — build.ts emits css, preset, json
  fonts/      subsetted woff2 + @font-face
  ui/         src/styles/*.css -> dist/ui.css, plus React wrappers
apps/
  docs/       Next 15, Tailwind 4, consumes the packages as a real user would
scripts/      contrast, type-scale and palette gates; the dev orchestrator
test/visual/  Playwright: computed styles asserted against tokens.json
PLAN.md       milestones and the reasoning behind them
```

## Visual verification

`test/visual` is deliberately **not** a pixel-baseline suite. Playwright's
screenshot comparison is bound to the OS font renderer, so a macOS baseline
never matches Linux CI and the suite ends up either permanently red or
permanently regenerated — and a regenerated baseline verifies nothing.

Instead each gallery page is probed in both themes and its computed styles are
asserted against `tokens.json`. Reading `.ty-card`'s background and comparing it
to `roles["layer-01"][theme]` is platform-independent, and it fails with a token
name rather than "3 pixels differ". Screenshots are still captured, as report
artifacts for human review.

## Deployment

CI is verification-only. Production goes out through the `vercel` CLI, by hand.

## Licence

MIT — see [LICENSE](LICENSE). The iA Writer fonts are separately licensed;
see [`packages/fonts`](packages/fonts).
