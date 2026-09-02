# Tyandor Design System — Build Plan

**Working name:** `@tyandor/design` (packages scoped `@tyandor/*`)
**Home:** `~/Projects/tyandor/tyandor-design` (new monorepo)
**Consumers:** tyandor.com (`tyandor-web`), theandors-news, celiac-restaurant-finder, future projects

---

## Vision

A personal design system that borrows Carbon's *architecture* — its role-based token taxonomy, spacing scale, type-scale structure, layering model, and 2x grid discipline — without taking on `@carbon/react` as a dependency. Carbon informs the structure; the Expanse palette and iA Writer fonts supply the aesthetic; the existing Radix/shadcn component stack supplies the behavior.

There's a pleasing lineage here worth leaning into: **iA Writer's typefaces are modifications of IBM Plex** — Carbon's native font family. Using iA Writer Duo inside a Carbon-shaped system isn't a hack; it's a fork of Carbon's own type DNA back toward its source.

### Principles

1. **Tokens are the product.** Components come and go; the token contract (`--ty-*` CSS variables) is what every project depends on. No component may use a raw hex value.
2. **Carbon's roles, Expanse's values.** Token *names* follow Carbon's role-based model (`background`, `layer-01`, `text-primary`, `border-subtle`, `support-error`…). Token *values* come exclusively from the Expanse palette (`expanse/palette-site/palette.js` is the source of truth).
3. **Two themes, one contract.** `mcrn` (dark, default) and `earth` (light) — the same dual-variant model the palette already defines. Every token resolves in both.
4. **Duospace-first typography.** iA Writer Duo for headings, body, and UI; iA Writer Mono for code and terminal-style readouts. Self-hosted variable woff2, OFL-licensed.
5. **Don't fight the stack.** Ship as CSS custom properties + a Tailwind preset + TS exports, consumable by Tailwind 3 (tyandor-web today) and Tailwind 4 / vanilla CSS (future projects).

---

## Repository architecture

Bun workspaces monorepo (matching the tyandor-web toolchain):

```
tyandor-design/
├── package.json               # bun workspace root
├── packages/
│   ├── tokens/                # @tyandor/tokens — the core deliverable
│   │   ├── src/
│   │   │   ├── color.ts       # Expanse palette primitives (imported/synced from expanse repo)
│   │   │   ├── themes.ts      # mcrn + earth role-token maps
│   │   │   ├── spacing.ts     # Carbon spacing scale
│   │   │   ├── type.ts        # type scale + font stacks
│   │   │   ├── motion.ts      # Carbon motion curves/durations
│   │   │   └── grid.ts        # breakpoints, 2x grid
│   │   ├── build.ts           # emits dist/ artifacts
│   │   └── dist/
│   │       ├── tokens.css     # :root / [data-theme] custom properties
│   │       ├── tailwind-preset.js
│   │       └── tokens.json    # for non-JS consumers (nvim theme, terminal themes)
│   ├── fonts/                 # @tyandor/fonts — woff2 + @font-face CSS + next/font helpers
│   └── ui/                    # @tyandor/ui — themed components (Radix-based)
├── apps/
│   └── docs/                  # design.tyandor.com — living style guide (Next.js, Vercel)
└── PLAN.md                    # this document
```

Distribution: consume via workspace/git dependency first (`"@tyandor/tokens": "github:tyandor/tyandor-design#path:packages/tokens"` or bun link); publish to npm only if/when friction demands it. Add `changesets` once more than one project consumes it.

---

## Phase 1 — `@tyandor/tokens`

The heart of the system. Everything else is downstream.

### 1a. Color: Carbon roles → Expanse values

Carbon's layering model maps almost one-to-one onto the palette's existing structure (Base/Surface/Overlay/Raised were clearly designed with layering in mind):

| Token (`--ty-*`) | Carbon analogue | MCRN (dark) | Earth (light) |
|---|---|---|---|
| `background` | `$background` | `#050910` Base | `#eef2f5` Base |
| `layer-01` | `$layer-01` | `#080c12` Surface | `#f5f7f9` Surface |
| `layer-02` | `$layer-02` | `#0c1820` Overlay | `#ffffff` Overlay |
| `layer-hover` | `$layer-hover-01` | `#0d1a22` Raised | `#e8edf2` Raised |
| `field` | `$field-01` | `#080c12` | `#f5f7f9` |
| `border-subtle` | `$border-subtle-01` | `#1a3a4a` Void | `#c0ccd6` Void |
| `border-strong` | `$border-strong-01` | `#2a6a7a` Muted | `#8a9aaa` Muted |
| `text-primary` | `$text-primary` | `#7ecfcf` Text | `#2a3a4a` Text |
| `text-secondary` | `$text-secondary` | `#4a8a9a` Subtle | `#6a7a8a` Subtle |
| `text-placeholder` | `$text-placeholder` | `#2a6a7a` Muted | `#8a9aaa` Muted |
| `text-emphasis` | `$text-helper`-ish | `#e8f0f0` Bright | `#0f1a2a` Bright |
| `interactive` | `$interactive` | `#e8c97a` Amber | `#b8860b` Amber |
| `link` / `link-hover` | `$link-primary` | `#7ecfcf` Cyan / `#8ab8d0` Ice | `#0a7a8a` / `#1a5276` |
| `focus` | `$focus` | `#e8c97a` Amber | `#b8860b` Amber |
| `support-error` | `$support-error` | `#ff6b47` Mars | `#c0392b` Mars |
| `support-warning` | `$support-warning` | `#ff9a3c` Flare | `#d4740a` Flare |
| `support-success` | `$support-success` | `#5ec98e` Green | `#2a7a3a` Green |
| `support-info` | `$support-info` | `#8ab8d0` Ice | `#1a5276` Ice |
| `highlight` / `selection` | `$highlight` | `#1a3a4a` Hi-Med | `#c0ccd6` Hi-Med |
| `highlight-strong` | — | `#2a6a7a` Hi-High | `#8ab0c8` Hi-High |

Also export the ten named accents (Amber, Cyan, Ice, Teal, Green, Gold, Mars, Flare, Steel, Void) as *primitive* tokens (`--ty-accent-amber`, …) for expressive use — charts, syntax highlighting, faction labels — with the rule that UI components use role tokens only. Chart series order: Cyan → Amber → Teal → Flare → Ice → Green (replaces the four Rosé Pine chart colors in DESIGN.md).

Theme switching mechanics: `:root` carries `mcrn` (dark-default, matching the aesthetic), `[data-theme="earth"]` overrides, plus a `prefers-color-scheme` fallback block. Same mechanism tyandor-web already uses for `.dark`, so migration is a class-name change.

### 1b. Spacing, grid, breakpoints

Adopt Carbon's scales verbatim — they're the best-tested part of Carbon and there's no reason to invent:

- **Spacing:** `spacing-01`…`spacing-13` = 2, 4, 8, 12, 16, 24, 32, 40, 48, 64, 80, 96, 160 px. Exposed as `--ty-spacing-*` and mapped into the Tailwind preset's spacing scale.
- **Grid:** Carbon's 2x grid concept (everything aligns to an 8px mini-unit; 16-column fluid grid at wide sizes). In practice: Tailwind container config + a `.ty-grid` utility; no need for Carbon's CSS grid classes.
- **Breakpoints:** sm 320 / md 672 / lg 1056 / xlg 1312 / max 1584 (Carbon's set), mapped to Tailwind screens.

### 1c. Typography

- **Stacks:** `--ty-font-body: "iA Writer Duo", "iA Writer Duospace", monospace;` `--ty-font-mono: "iA Writer Mono", monospace;`
- **Type scale:** Carbon's role-based tokens, trimmed to what a personal site needs: `code-01/02`, `body-01/02`, `heading-01`–`heading-06`, `display-01/02`. Keep Carbon's productive line-heights but audit them against Duo — duospace fonts run wide, so body sizes likely settle at 15–16px with a slightly longer line-height (~1.6) and a tighter measure (~65ch max).
- **Weights:** Duo variable spans 400–700; use 400 body, 600 emphasis/headings, 700 display. Duo also ships italics — keep them.

### 1d. Motion & elevation

Carbon motion tokens (`productive` 70–150ms, `expressive` 250–400ms, standard/entrance/exit easings) as `--ty-motion-*`. Elevation in this aesthetic is *not* shadows — on MCRN, depth comes from layer color + `border-subtle`; define `--ty-shadow-*` only for the light Earth theme (subtle, cool-tinted).

### 1e. Outputs

`build.ts` (plain TS, no style-dictionary unless it earns its keep) emits: `tokens.css`, `tailwind-preset.js` (works under Tailwind 3; verify under 4's `@theme` too), and `tokens.json`. The JSON output doubles as a bridge back to the expanse repo's terminal/nvim themes — one palette, many renderers.

**Verification:** a contrast-check script in CI asserting WCAG AA (4.5:1 body text, 3:1 large/UI) for every text-role/layer-role pairing in both themes. Known watch items: Earth's Amber `#b8860b` on white layers is borderline for small text (~3.3:1 on `#ffffff`) — reserve it for large text/icons or darken a step for a `text-on-light` variant; MCRN's `text-secondary` `#4a8a9a` on `layer-02` needs checking.

---

## Phase 2 — `@tyandor/fonts`

1. Pull iA Writer Duo (variable + italic variable) and iA Writer Mono from `github.com/iaolo/iA-Fonts`; subset and convert to woff2 (`glyphhanger`/`fonttools` — latin + latin-ext + the ∧∨ glyphs used by the logo).
2. Ship `fonts.css` (`@font-face` with `font-display: swap`, unicode-range subsets) and a `next-fonts.ts` helper exporting `next/font/local` configs for Next-based consumers (best CLS behavior; tyandor-web should use this path).
3. Include the OFL license file alongside the fonts (required by SIL OFL for redistribution) and a note of upstream provenance (iA-Fonts → IBM Plex).

---

## Phase 3 — `@tyandor/ui`

Components built on Radix primitives, styled *only* with tokens, following Carbon's interaction patterns (visible focus ring on `--ty-focus`, distinct hover/active layer shifts, 32/40/48px control heights = Carbon's sm/md/lg).

Initial inventory, ordered by what tyandor.com actually renders:

1. **Foundation:** `ThemeProvider` (mcrn/earth/system), `Text`/`Heading` (type-scale roles), `Grid`/`Stack` (spacing roles)
2. **Navigation:** header/nav bar, footer, category pills, breadcrumb
3. **Content:** Card, article prose styles (`@tailwindcss/typography` theme driven by tokens), blockquote/pull-quote, Tag/Badge, Divider
4. **Controls:** Button (primary=Amber, ghost, danger=Mars), Link, Input/Textarea/Select, Switch, Tabs, Tooltip, Dialog
5. **Data/flavor:** DataTable (Carbon-style: zebra-free, row hover via `layer-hover`), CodeBlock (iA Writer Mono, Expanse syntax colors from the palette's token map), and a `Readout` component family (terminal-style status lines, the MCRN flourish — the `expanse-terminal.jsx` prototype is prior art to mine)

Each component lands with a docs page and a light visual-regression check (Playwright screenshot per component per theme — Playwright is already set up in the expanse repo).

---

## Phase 4 — Docs site (`apps/docs` → design.tyandor.com)

A miniature carbondesignsystem.com, and itself the first full consumer of the system:

- **Foundations pages:** color (interactive token browser with both themes — evolve the existing `palette-site` rather than replacing it; it already does this well for primitives), typography (type-scale specimens in Duo/Mono), spacing/grid, motion.
- **Component gallery:** live examples + prop tables, per-theme toggle.
- **Usage page:** install instructions, Tailwind preset wiring, do/don't for role vs. accent tokens.
- Deploy to Vercel; wire `design.tyandor.com`.

---

## Phase 5 — Migrate tyandor.com

Phased so the site never breaks:

1. **Install alongside.** Add `@tyandor/tokens` + `@tyandor/fonts` to tyandor-web; load `tokens.css` and the Tailwind preset *in addition to* the Rosé Pine config. Both token sets coexist.
2. **Map.** Rosé Pine and Expanse share a structural vocabulary (base/surface/overlay, muted/subtle/text, highlight-low/med/high — the palette was clearly built with this migration in mind), so most swaps are mechanical: `rosePine-base → background`, `rosePine-love → interactive` (logo/accent), `rosePine-pine/foam → link/info roles`, `rosePineMoon-* → mcrn` theme values. Codify the mapping in a table, then codemod the Tailwind class names.
3. **Migrate surface-by-surface:** global shell (nav/footer/theme toggle) → article/prose styles → cards & lists → charts (d3 series colors from accent tokens) → forms.
4. **Swap components** for `@tyandor/ui` equivalents opportunistically, not exhaustively — shadcn components already in the tree keep working on the new tokens since they'll read the same CSS variables.
5. **Retire** Rosé Pine config, delete `rosePine*` Tailwind prefixes, rewrite `DESIGN.md` to point at design.tyandor.com and the token contract. Note the flip: the site goes from light-default (Dawn) to dark-default (MCRN) — decide deliberately whether default follows system preference instead.

---

## Sequencing & milestones

| # | Milestone | Depends on | Definition of done |
|---|---|---|---|
| 0 | Scaffold monorepo, CI (lint, contrast check, build) | — | `bun install && bun run build` green |
| 1 | Tokens package: themes, spacing, type, motion + 3 outputs | 0 | tokens.css renders both themes; contrast CI passes |
| 2 | Fonts package: subsetted woff2 + next/font helper | 0 | Duo + Mono loading on a test page, OFL included |
| 3 | Docs site foundations pages live at design.tyandor.com | 1, 2 | Color + type + spacing pages deployed |
| 4 | UI package: foundation + navigation + content components | 1, 2 | Each with docs page + screenshot test |
| 5 | tyandor.com shell migrated (nav, footer, theme toggle, fonts) | 1, 2 | Site ships on Expanse tokens, Rosé Pine still installed |
| 6 | Full migration; Rosé Pine retired; DESIGN.md rewritten | 4, 5 | No `rosePine` reference left in tyandor-web |
| 7 | Controls + data components; Readout family | 4 | Component gallery complete |

Milestones 1–3 are the high-leverage core — after milestone 3 every new project can adopt the system even if migration (5–6) proceeds slowly.

---

## Open questions & risks

- **Duospace for long-form prose.** Duo is designed for writing, not necessarily reading long articles. Mitigation: prototype an article page early (milestone 3 era); if fatigue is real, iA Writer Quattro (same repo, more proportional) can slot in as `--ty-font-prose` without changing the token contract.
- **Earth theme contrast.** The light palette's accents were tuned for syntax highlighting, not UI text; expect the contrast CI to force one or two darkened `-on-light` variants. Palette changes should flow *upstream* into the expanse repo, keeping it the single source of truth.
- **Tailwind 3 vs 4.** tyandor-web is on 3.4; new projects will want 4. The CSS-variable-first design makes the preset thin either way, but test both before milestone 1 closes.
- **Naming.** `@tyandor/design` is the safe default. If you want the fun option: the packages could ship under the ship names — `tachi` (tokens: the stolen frame everything's built on), `rocinante` (ui: what it became). Decide before anything's published.
- **Palette drift.** `palette.js`, `tokens.ts`, terminal themes, and nvim themes all encode the same hexes. The tokens package's JSON output should become the canonical machine-readable source, with the expanse repo's generators consuming it (later, low priority).

---

*Sources: Carbon Design System v11 theming/token docs (carbondesignsystem.com), the iA-Fonts repository (github.com/iaolo/iA-Fonts), and the Expanse palette source of truth in `expanse/palette-site/palette.js` + `expanse/README.md`.*
