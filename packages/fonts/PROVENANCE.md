# Provenance

The font binaries in `dist/files/` are **modified copies** of the iA Writer
typefaces. This file records exactly what was changed, so the modification is
inspectable rather than implied.

## Chain of custody

| | |
|---|---|
| Original | **IBM Plex** — © 2017 IBM Corp., reserved font name "Plex" ([github.com/IBM/type](https://github.com/IBM/type)) |
| Upstream | **iA Writer** — © 2018 Information Architects Inc., reserved font name "iA Writer" ([github.com/iaolo/iA-Fonts](https://github.com/iaolo/iA-Fonts)) |
| Pinned at | commit `f32c04c3058a75d7ce28919ce70fe8800817491b` (2023-06-16) |
| Licence | SIL Open Font License 1.1 — verbatim in [`LICENSE-OFL.md`](./LICENSE-OFL.md) |

`scripts/subset-fonts.py` verifies a recorded SHA-256 for every source file it
pulls. An upstream re-cut under the same path fails the run rather than
flowing silently into a release.

## What was changed

Glyph coverage and container format only. No outline, metric, hinting-derived
shape, or OpenType feature was altered.

1. **Subsetted** to latin and latin-ext. Greek, Cyrillic, and the Thai baht
   sign are dropped — roughly 400 codepoints in upright Duo. Text in those
   scripts falls back to the platform font.
2. **Converted** TrueType → WOFF2.
3. **Dropped TrueType hinting**, which WOFF2 delivery makes dead weight.
4. **Trimmed the name table** to English (0x0409) nameIDs 0–6, 13 and 14.
   Localised name records were removed; the copyright notice and the embedded
   OFL notice were explicitly *kept* — `subset-fonts.py` fails the build if
   nameID 13 goes missing.

Both variable axes survive intact: `wght` 400–700 and iA's letter-spacing axis
`SPCG` 0–150.

## On the reserved font name

OFL 1.1 counts subsetting and format conversion as producing a "Modified
Version", and clause 3 reserves the primary font name for the copyright
holder. These files keep the name `iA Writer Duo` / `iA Writer Mono`.

That choice follows upstream's own practice — the iA-Fonts repository ships
`.woff`, `.woff2` and `.eot` conversions under the unchanged name — and
upstream's stated wish: *"If you fork or use our fonts, please reference iA
Writer clearly."* Renaming would obscure the attribution iA asks for, and a
design system that quietly rebrands someone else's typeface is the outcome
their readme objects to.

This is a judgement call, not a legal opinion. If iA would rather these files
carry a different family name, that is a one-line change in
`scripts/subset-fonts.py` plus the matching stack in `@tyandor/tokens`.

## Known gap: the ∧∨ logo glyphs

PLAN.md asks for U+2227 (∧) and U+2228 (∨) to be preserved for the logo.
**Neither codepoint exists in any iA Writer face** — verified against the
`cmap` of all four variable fonts. There is nothing to preserve.

Rendering the mark in text would silently fall through to `ui-monospace`,
setting the logo in a different typeface from everything beside it. Draw it as
SVG instead, which is where a wordmark belongs anyway.
