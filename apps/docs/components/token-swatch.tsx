/**
 * A dual-variant swatch card. Both hexes are shown at once so the reader
 * doesn't have to toggle a theme just to compare an amber value.
 *
 * The theme toggle in the header changes the *chrome* of the site; these
 * swatches always paint both variants. That's deliberate — a design system
 * doc that hides half its palette makes it harder to spec against.
 */
import type { RoleKind } from "../lib/tokens";

export function TokenSwatch({
  name,
  desc,
  mcrn,
  earth,
  kind,
  tagline,
}: {
  name: string;
  desc: string;
  mcrn: string;
  earth: string;
  kind?: RoleKind;
  tagline?: string;
}) {
  return (
    <article className="flex flex-col overflow-hidden rounded-sm border border-border-subtle bg-layer-01">
      <div className="grid grid-cols-2">
        <VariantChip label="MCRN" hex={mcrn} />
        <VariantChip label="Earth" hex={earth} />
      </div>
      <div className="flex flex-1 flex-col gap-1 border-t border-border-subtle p-3">
        <div className="flex items-baseline justify-between gap-2">
          <code className="ty-type-code-01 text-text-emphasis">{name}</code>
          {kind ? (
            <span className="rounded-sm bg-layer-02 px-1.5 py-0.5 ty-label text-text-secondary">
              {kind}
            </span>
          ) : null}
        </div>
        {/*
          code-01's metrics with the body face: the scale has no 13px body
          role (code-01/02 are Mono, body-01 starts at 15px), and 15px would
          read as large as the page's own prose inside a card caption. If a
          third one of these shows up, that is the argument for a caption
          token rather than a third pairing.
        */}
        <p className="ty-type-code-01 font-body leading-snug text-text-secondary">{desc}</p>
        {tagline ? (
          <p className="mt-1 ty-type-label-01 font-mono italic text-text-placeholder">{tagline}</p>
        ) : null}
      </div>
    </article>
  );
}

function VariantChip({ label, hex }: { label: string; hex: string }) {
  // `overlay` role uses rgba; keep it working as an inline color.
  const isOpaque = hex.startsWith("#");
  return (
    <div
      className="flex h-24 flex-col justify-between p-2"
      style={{ backgroundColor: hex, color: isOpaque ? readableTextOn(hex) : "#fff" }}
    >
      <span className="ty-label opacity-80">{label}</span>
      <span className="ty-type-label-01 font-mono opacity-95">{hex}</span>
    </div>
  );
}

/**
 * A tiny relative-luminance heuristic — enough to pick black vs. white
 * for the label on any swatch. Real contrast work happens in
 * scripts/check-contrast.ts against the actual role pairings.
 */
function readableTextOn(hex: string): string {
  const h = hex.replace("#", "");
  if (h.length !== 6) return "#000";
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return lum > 0.55 ? "#000" : "#fff";
}
