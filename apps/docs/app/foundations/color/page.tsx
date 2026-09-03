import { PageHeader } from "../../../components/page-header";
import { Section } from "../../../components/section";
import { TokenSwatch } from "../../../components/token-swatch";
import { roleGroups, rolesForGroup, tokens } from "../../../lib/tokens";

export const metadata = { title: "Color" };

export default function ColorPage() {
  return (
    <>
      <PageHeader
        eyebrow="Foundations"
        title="Color"
        lede={
          "Carbon's role-based tokens, resolved to values from the Expanse palette. Every card shows both variants at once — a docs site that hides half its palette makes it harder to spec against."
        }
      />

      <Section title="Chart series" desc="Order for series 1…n. Overrides tyandor.com's four-color Rosé Pine.">
        <ChartSeries />
      </Section>

      {roleGroups.map((g) => (
        <Section key={g.title} title={g.title}>
          <SwatchGrid>
            {rolesForGroup(g.pattern).map((r) => (
              <TokenSwatch
                key={r.name}
                name={r.name}
                desc={r.desc}
                mcrn={r.mcrn}
                earth={r.earth}
                kind={r.kind}
              />
            ))}
          </SwatchGrid>
        </Section>
      ))}

      <Section title="Palette — Backgrounds" desc="Layered surfaces from deep hull to raised panels">
        <SwatchGrid>
          {Object.entries(tokens.palette.backgrounds).map(([k, p]) => (
            <TokenSwatch key={k} name={p.name} desc={p.role} mcrn={p.mcrn} earth={p.earth} tagline={p.tagline} />
          ))}
        </SwatchGrid>
      </Section>

      <Section title="Palette — Foregrounds" desc="Text contrast levels from whisper to full-burn readout">
        <SwatchGrid>
          {Object.entries(tokens.palette.foregrounds).map(([k, p]) => (
            <TokenSwatch key={k} name={p.name} desc={p.role} mcrn={p.mcrn} earth={p.earth} tagline={p.tagline} />
          ))}
        </SwatchGrid>
      </Section>

      <Section title="Palette — Accents" desc="Ten named accents. UI components use role tokens; charts and syntax reach for these directly.">
        <SwatchGrid>
          {Object.entries(tokens.palette.accents).map(([k, p]) => (
            <TokenSwatch key={k} name={p.name} desc={p.role} mcrn={p.mcrn} earth={p.earth} tagline={p.tagline} />
          ))}
        </SwatchGrid>
      </Section>

      <Section title="Palette — Highlights" desc="Selection, search matches, ambient overlays.">
        <SwatchGrid>
          {Object.entries(tokens.palette.highlights).map(([k, p]) => (
            <TokenSwatch key={k} name={p.name} desc={p.role} mcrn={p.mcrn} earth={p.earth} tagline={p.tagline} />
          ))}
        </SwatchGrid>
      </Section>
    </>
  );
}

function SwatchGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
  );
}

function ChartSeries() {
  const series = tokens.chartSeries;
  return (
    <div className="grid gap-3">
      <ol className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {series.map((accentKey, i) => {
          const p = tokens.palette.accents[accentKey];
          if (!p) return null;
          return (
            <li
              key={accentKey}
              className="flex flex-col overflow-hidden rounded-sm border border-border-subtle bg-layer-01"
            >
              <div className="grid grid-cols-2">
                <div className="h-16" style={{ backgroundColor: p.mcrn }} aria-hidden />
                <div className="h-16" style={{ backgroundColor: p.earth }} aria-hidden />
              </div>
              <div className="p-3">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-mono text-[13px] text-text-emphasis">{p.name}</span>
                  <span className="font-mono text-[11px] text-text-secondary">series-{i + 1}</span>
                </div>
                <p className="mt-1 text-[12px] text-text-secondary">{p.role}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
