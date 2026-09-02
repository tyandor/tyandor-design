# @tyandor/fonts

iA Writer Duo and Mono, subsetted to WOFF2 and wired to the `--ty-font-*`
tokens. Phase 2 of [PLAN.md](../../PLAN.md).

Both families ship as **variable** fonts — `wght` 400–700 in a single file per
style, plus iA's letter-spacing axis `SPCG` 0–150.

## Install

```bash
bun add github:tyandor/tyandor-design#path:packages/fonts
```

## Use

### Plain CSS

```css
@import "@tyandor/fonts/fonts.css";
@import "@tyandor/tokens/tokens.css";
```

That is the whole integration. The `@font-face` rules declare the families
`iA Writer Duo` and `iA Writer Mono`, which is what `--ty-font-body` and
`--ty-font-mono` already resolve to — neither package imports the other.

The stylesheet references `./files/*.woff2` relative to itself, so serve
`dist/` as a unit or let your bundler follow the `url()`.

### Next.js

```ts
// app/layout.tsx
import { duo, mono, fontVariables } from "@tyandor/fonts/next";

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={fontVariables}>
      <body className={duo.className}>{children}</body>
    </html>
  );
}
```

```js
// next.config.js
module.exports = { transpilePackages: ["@tyandor/fonts"] };
```

Do **not** also import `fonts.css` on this path. `next/font` self-hosts the
files and emits its own `@font-face` rules; loading both ships the glyphs
twice. Setting `fontVariables` on `<html>` rewrites `--ty-font-body` and
`--ty-font-mono` to Next's hashed family names, so every component reading
those tokens follows automatically.

### Tuning the duospace

`SPCG` is iA's letter-spacing axis. `0` is the shipped duospace rhythm; higher
values open it toward a monospace grid.

```css
.readout { font-variation-settings: "SPCG" 90; }
```

## What ships

| Cut | Files | Bytes | Used by |
|---|---|---|---|
| `latin` | 4 | 87,708 | `fonts.css` |
| `latin-ext` | 4 | 65,016 | `fonts.css` |
| `all` | 4 | 120,728 | `next/font` |

`fonts.css` uses `unicode-range`, so a page that renders only basic latin
fetches the `latin` cut alone — about 21 KB for upright Duo. The two cuts are
computed as a genuine set difference, not the overlapping ranges Google Fonts
publishes, so no glyph is paid for twice.

The `all` cut is the same coverage in one file. `next/font/local` generates its
own `@font-face` rules with no way to express `unicode-range`, so feeding it
the split files would leave the second rule masking the first for every glyph.

**Dropped:** Greek, Cyrillic, and the Thai baht sign — roughly 400 codepoints
in upright Duo. Text in those scripts falls back to the platform font.

## Development

`build.ts` emits `dist/fonts.css` and `dist/fonts.json` from
`src/manifest.json`. It runs in CI and its output must be committed:

```bash
bun run --filter @tyandor/fonts build
```

`specimen.html` renders every face, both variable axes, and a scripted check
that each face actually loaded rather than fell back. Serve the repo root and
open `/packages/fonts/specimen.html` — the relative hrefs reach across to
`@tyandor/tokens`, so it doubles as proof the two packages compose.

The WOFF2 binaries and `src/manifest.json` come from a separate step that
needs Python and fontTools, so it does **not** run in CI. Re-run it only when
bumping the upstream pin:

```bash
uv venv /tmp/fontenv && uv pip install --python /tmp/fontenv/bin/python fonttools brotli
/tmp/fontenv/bin/python scripts/subset-fonts.py
```

## Licence

The **package** (build scripts, TypeScript, generated CSS) is MIT, like the
rest of this repo.

The **fonts** are under the SIL Open Font License 1.1 — see
[`LICENSE-OFL.md`](./LICENSE-OFL.md). They are modified copies:
[`PROVENANCE.md`](./PROVENANCE.md) records exactly what changed, why the
reserved font name was kept, and one place PLAN.md asked for something upstream
does not contain (the ∧∨ logo glyphs, which no iA Writer face includes).
