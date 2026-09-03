import { PageHeader } from "../../../components/page-header";
import { Section } from "../../../components/section";
import { spacingEntries, tokens } from "../../../lib/tokens";

export const metadata = { title: "Spacing" };

export default function SpacingPage() {
  return (
    <>
      <PageHeader
        eyebrow="Foundations"
        title="Spacing"
        lede={
          "Carbon's spacing scale, adopted verbatim. Everything is a multiple of the 2px micro-unit; from spacing-03 up, of the 8px mini-unit the 2x grid is built on."
        }
      />

      <Section title="Scale" desc="13 steps. Use --ty-spacing-* directly or the Tailwind aliases the preset installs.">
        <ul className="space-y-2">
          {spacingEntries().map(([name, s]) => (
            <li
              key={name}
              className="grid grid-cols-[110px_90px_1fr] items-center gap-4 rounded-sm border border-border-subtle bg-layer-01 px-4 py-3"
            >
              <code className="font-mono text-[13px] text-text-emphasis">spacing-{name}</code>
              <span className="font-mono text-[12px] text-text-secondary">
                {s.rem} · {s.px}px
              </span>
              <div className="flex items-center">
                <span
                  className="block h-4 rounded-sm bg-interactive"
                  style={{ width: `${s.px}px`, maxWidth: "100%" }}
                  aria-hidden
                />
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Control sizes" desc="Carbon's sm / md / lg heights, adopted for Button, Input, Select.">
        <div className="grid gap-3 sm:grid-cols-3">
          {Object.entries(tokens.sizes).map(([name, rem]) => (
            <div
              key={name}
              className="flex items-center justify-between gap-4 rounded-sm border border-border-subtle bg-layer-01 p-4"
            >
              <code className="font-mono text-[13px] text-text-emphasis">{name}</code>
              <div
                className="rounded-sm border border-border-subtle bg-layer-02"
                style={{ height: rem, width: "80px" }}
                aria-hidden
              />
              <span className="font-mono text-[11px] text-text-secondary">
                {rem} · {parseFloat(rem) * 16}px
              </span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Breakpoints" desc="Carbon's set. Tailwind screens map to these values.">
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {Object.entries(tokens.breakpoints).map(([name, rem]) => (
            <li
              key={name}
              className="rounded-sm border border-border-subtle bg-layer-01 p-4"
            >
              <div className="mb-1 font-mono text-[13px] text-text-emphasis">{name}</div>
              <div className="font-mono text-[11px] text-text-secondary">
                {rem} · {parseFloat(rem) * 16}px
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Grid" desc="A 16-column fluid grid with a 32px gutter; everything aligns to an 8px mini-unit.">
        <dl className="grid gap-3 rounded-sm border border-border-subtle bg-layer-01 p-5 sm:grid-cols-2">
          {Object.entries(tokens.grid).map(([k, v]) => (
            <div key={k} className="flex items-baseline justify-between border-b border-border-subtle pb-2 last:border-0">
              <dt className="font-mono text-[13px] text-text-emphasis">{k}</dt>
              <dd className="font-mono text-[12px] text-text-secondary">
                {String(v)}
              </dd>
            </div>
          ))}
        </dl>
      </Section>
    </>
  );
}
