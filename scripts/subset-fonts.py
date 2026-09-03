#!/usr/bin/env python3
"""
Vendor and subset the iA Writer variable fonts (PLAN.md phase 2, step 1).

This is the one build step in the repo that is *not* bun. It needs Python with
fontTools + brotli, so it does not run in CI: its outputs (the woff2 files and
`packages/fonts/src/manifest.json`) are committed, exactly like `dist/` in the
tokens package. Re-run it only when bumping the upstream pin below.

    uv venv /tmp/fontenv
    uv pip install --python /tmp/fontenv/bin/python fonttools brotli
    /tmp/fontenv/bin/python scripts/subset-fonts.py

Upstream is pinned to a commit, and every source file is checked against a
recorded SHA-256. A silent upstream re-cut of the same path is a licensing and
rendering change, not a detail, so it fails the run rather than flowing through.
"""

from __future__ import annotations

import hashlib
import http.client
import io
import json
import subprocess
import sys
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass
from pathlib import Path

from fontTools.subset import Options, Subsetter, parse_unicodes
from fontTools.ttLib import TTFont

REPO = "iaolo/iA-Fonts"
# github.com/iaolo/iA-Fonts @ "Update Readme.md", 2023-06-16.
COMMIT = "f32c04c3058a75d7ce28919ce70fe8800817491b"
RAW = f"https://raw.githubusercontent.com/{REPO}/{COMMIT}"

ROOT = Path(__file__).resolve().parent.parent
PKG = ROOT / "packages" / "fonts"
OUT = PKG / "dist" / "files"
CACHE = ROOT / "node_modules" / ".cache" / "ia-fonts"

# --- Upstream sources ---------------------------------------------------------

@dataclass(frozen=True)
class Source:
    path: str          # path inside the upstream repo
    sha256: str
    family: str        # the CSS family name we publish it under
    slug: str          # file-name stem we publish it under
    style: str         # "normal" | "italic"

SOURCES = [
    Source("iA Writer Duo/Variable/iAWriterDuoV.ttf",
           "00dba4a19f34191ef7e499a6ca05739e11c56f41567d8a283e7ae9dd504c9b38",
           "iA Writer Duo", "ia-writer-duo", "normal"),
    Source("iA Writer Duo/Variable/iAWriterDuoV-Italic.ttf",
           "6a2b3ce4e948097878738301eb08e40337d0d25cad88f83f4740ccc5c83084ed",
           "iA Writer Duo", "ia-writer-duo", "italic"),
    Source("iA Writer Mono/Variable/iAWriterMonoV.ttf",
           "ca8b5740d7fd05ffd1a9e985a2fe6b7608101f0583d2cf971317c82b4ce01240",
           "iA Writer Mono", "ia-writer-mono", "normal"),
    Source("iA Writer Mono/Variable/iAWriterMonoV-Italic.ttf",
           "9ab3465dd180ff05b6375f22e0197d696697489ddd7860b85f19b213c0d4edf0",
           "iA Writer Mono", "ia-writer-mono", "italic"),
]

LICENSE_SRC = ("iA Writer Duo/LICENSE.md",
               "2eb84d6d03a9af6e99816f82f50a77c26e7ff6681293f4619cd33a392a8c13b6")

# --- Subset definitions -------------------------------------------------------
#
# Requested ranges, in the Google Fonts idiom. The *published* unicode-range is
# not this list -- it is derived from the cmap of the finished file, so the CSS
# can never promise coverage the binary does not have.

LATIN = (
    "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,"
    "U+0300-0304,U+0306-030C,U+0312,U+0315,U+031B,U+0323,U+0326-0328,"
    "U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD"
)
LATIN_EXT = (
    "U+0100-024F,U+0259,U+1E80-1E85,U+1E9E,U+1EA0-1EF9,"
    "U+20A0-20AB,U+20AD-20CF,U+2C60-2C7F,U+A720-A7FF"
)

# Google publishes `latin` and `latin-ext` with a small overlap (U+0131,
# U+0152-0153 and the combining marks sit in both) and lets @font-face order
# break the tie. Taking the difference instead keeps the two files genuinely
# disjoint: no glyph is paid for twice, and `_assert_disjoint` becomes a real
# post-condition rather than a restatement of the input.
_LATIN = set(parse_unicodes(LATIN))
_LATIN_EXT = set(parse_unicodes(LATIN_EXT)) - _LATIN

# Three cuts per face. `latin` + `latin-ext` back fonts.css, which uses
# unicode-range so a reader who never renders an ext glyph never fetches it.
# `all` is the same coverage in one file, for next/font/local -- Next generates
# its own @font-face rules and has no way to express unicode-range, so feeding
# it two files per style would make the second silently mask the first.
CUTS = [
    ("latin", _LATIN),
    ("latin-ext", _LATIN_EXT),
    ("all", _LATIN | _LATIN_EXT),
]


def fetch(path: str, sha256: str) -> bytes:
    CACHE.mkdir(parents=True, exist_ok=True)
    cached = CACHE / hashlib.sha256(path.encode()).hexdigest()
    if cached.exists():
        blob = cached.read_bytes()
    else:
        url = f"{RAW}/{urllib.parse.quote(path)}"
        print(f"  fetch {path}")
        blob = _download(url)
        cached.write_bytes(blob)
    got = hashlib.sha256(blob).hexdigest()
    if got != sha256:
        raise SystemExit(
            f"checksum mismatch for {path}\n  expected {sha256}\n  got      {got}\n"
            f"Upstream changed under the pin. Review the diff before updating the hash."
        )
    return blob

def _download(url: str) -> bytes:
    """GET `url`, tolerating proxies that truncate urllib's socket reads.

    Some egress proxies close the connection at a buffer boundary, which
    urllib surfaces as IncompleteRead rather than retrying. curl handles it,
    and this script only ever runs on a developer machine, so fall back to it.
    """
    try:
        with urllib.request.urlopen(url, timeout=60) as r:
            return r.read()
    except (http.client.IncompleteRead, urllib.error.URLError):
        return subprocess.run(
            ["curl", "-fsSL", "--retry", "3", url],
            check=True, stdout=subprocess.PIPE,
        ).stdout


def coalesce(codepoints: list[int]) -> list[str]:
    """Contiguous runs of codepoints as CSS unicode-range tokens."""
    out: list[str] = []
    start = prev = codepoints[0]
    for cp in codepoints[1:]:
        if cp == prev + 1:
            prev = cp
            continue
        out.append(f"U+{start:04X}" if start == prev else f"U+{start:04X}-{prev:04X}")
        start = prev = cp
    out.append(f"U+{start:04X}" if start == prev else f"U+{start:04X}-{prev:04X}")
    return out


def subset(raw: bytes, unicodes: set[int], dest: Path) -> dict:
    opts = Options()
    opts.layout_features = ["*"]      # keep kerning, ligatures, everything shaped
    opts.hinting = False              # woff2 + variable: TrueType hints are dead weight
    opts.notdef_outline = True
    # fontTools keeps nameIDs 0-6 by default, dropping 13 and 14 -- the embedded
    # OFL notice and its URL. Shipping a binary stripped of its own licence is
    # not on, so widen the set by exactly those two. Not `"*"`: that also drags
    # in every localised name record and the legacy Mac platform table, which
    # costs ~40 KB per file -- twice the weight of the outlines it describes.
    opts.name_IDs = [0, 1, 2, 3, 4, 5, 6, 13, 14]
    opts.name_legacy = False
    opts.name_languages = [0x0409]  # en-US

    font = TTFont(io.BytesIO(raw))
    sub = Subsetter(options=opts)
    sub.populate(unicodes=unicodes)
    sub.subset(font)

    dest.parent.mkdir(parents=True, exist_ok=True)
    # `Options.flavor` is read by fontTools' CLI wrapper, not by Subsetter. Set
    # from the API it is inert, and save() writes an uncompressed TTF under a
    # .woff2 name -- a file browsers reject and a size check would not flag.
    font.flavor = "woff2"
    font.save(dest)
    if dest.open("rb").read(4) != b"wOF2":
        raise SystemExit(f"{dest.name}: not woff2-compressed")

    cmap = sorted(font.getBestCmap())
    axes = [
        {"tag": a.axisTag, "min": a.minValue, "default": a.defaultValue, "max": a.maxValue}
        for a in font["fvar"].axes
    ] if "fvar" in font else []
    names = {str(i): font["name"].getDebugName(i) for i in (0, 1, 13, 14)}
    font.close()
    return {"cmap": cmap, "axes": axes, "names": names, "bytes": dest.stat().st_size}


def main() -> int:
    OUT.mkdir(parents=True, exist_ok=True)

    print(f"iA-Fonts @ {COMMIT[:8]}")
    (PKG / "LICENSE-OFL.md").write_bytes(fetch(*LICENSE_SRC))

    faces: list[dict] = []
    for src in SOURCES:
        raw = fetch(src.path, src.sha256)
        suffix = "-italic" if src.style == "italic" else ""
        for cut_name, unicodes in CUTS:
            tail = "" if cut_name == "all" else f".{cut_name}"
            rel = f"{src.slug}{suffix}{tail}.woff2"
            info = subset(raw, unicodes, OUT / rel)

            if not info["cmap"]:
                raise SystemExit(f"{rel}: empty cmap -- the requested range is absent upstream")
            if not info["names"]["13"]:
                raise SystemExit(f"{rel}: OFL notice (nameID 13) was dropped")

            faces.append({
                "family": src.family,
                "slug": src.slug,
                "style": src.style,
                "subset": cut_name,
                "file": rel,
                "bytes": info["bytes"],
                # `wght` spans 400-700, so one file answers every weight token.
                "weight": _weight_range(info["axes"]),
                "unicodeRange": coalesce(info["cmap"]),
                "codepoints": len(info["cmap"]),
                "axes": info["axes"],
                "source": src.path,
            })
            print(f"  {rel:<40} {info['bytes']:>7,} B  {len(info['cmap']):>4} cp")

    _assert_disjoint(faces)

    manifest = {
        "$comment": "Generated by scripts/subset-fonts.py. Do not edit by hand.",
        "upstream": {
            "repo": f"https://github.com/{REPO}",
            "commit": COMMIT,
            "license": "SIL Open Font License 1.1",
        },
        "faces": faces,
    }
    dest = PKG / "src" / "manifest.json"
    dest.write_text(json.dumps(manifest, indent=2) + "\n")
    print(f"\n-> {dest.relative_to(ROOT)}  ({len(faces)} faces)")
    return 0


def _weight_range(axes: list[dict]) -> str:
    for a in axes:
        if a["tag"] == "wght":
            return f"{int(a['min'])} {int(a['max'])}"
    return "400"


def _assert_disjoint(faces: list[dict]) -> None:
    """`latin` and `latin-ext` must not overlap, or the browser fetches both."""
    for slug in {f["slug"] for f in faces}:
        for style in ("normal", "italic"):
            cuts = {f["subset"]: f for f in faces if f["slug"] == slug and f["style"] == style}
            a, b = cuts.get("latin"), cuts.get("latin-ext")
            if not (a and b):
                continue
            overlap = _expand(a["unicodeRange"]) & _expand(b["unicodeRange"])
            if overlap:
                sample = ", ".join(f"U+{c:04X}" for c in sorted(overlap)[:8])
                raise SystemExit(f"{slug} {style}: latin/latin-ext overlap ({sample})")


def _expand(ranges: list[str]) -> set[int]:
    out: set[int] = set()
    for r in ranges:
        lo, _, hi = r[2:].partition("-")
        out.update(range(int(lo, 16), int(hi or lo, 16) + 1))
    return out


if __name__ == "__main__":
    sys.exit(main())
