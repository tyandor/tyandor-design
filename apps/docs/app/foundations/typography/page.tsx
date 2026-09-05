import { PageHeader } from "../../../components/page-header";
import { Section } from "../../../components/section";
import { tokens, typeEntries } from "../../../lib/tokens";

export const metadata = { title: "Typography" };

const sampleText = "Aim for the moon. Miss, hit a station. Iterate.";
const sampleCode = "// pipe stdout into the void\ncurl -fsSL https://nick/ | sh";

export default function TypographyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Foundations"
        title="Typography"
        lede={
          "iA Writer Duo for body, headings, UI. iA Writer Mono for code and readouts. Both fonts are modifications of IBM Plex — Carbon's own family — so this is a fork back toward the source, not a graft."
        }
      />

      <Section title="Families" desc="Two families cover the system. A `prose` alias points at Duo today, reserved for long-form if fatigue proves real.">
        <div className="grid gap-6 sm:grid-cols-2">
          <FamilyCard
            token="--ty-font-body"
            role="Body, headings, UI"
            family={tokens.type.fontFamily.body}
            sample="iA Writer Duo — a duospace face."
            style={{ fontFamily: "var(--ty-font-body)" }}
          />
          <FamilyCard
            token="--ty-font-mono"
            role="Code, terminal readouts"
            family={tokens.type.fontFamily.mono}
            sample="iA Writer Mono — 1:1 monospace."
            style={{ fontFamily: "var(--ty-font-mono)" }}
          />
        </div>
      </Section>

      <Section title="Weights" desc="Duo variable spans 400–700. Same range for Mono.">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Object.entries(tokens.type.fontWeight).map(([name, value]) => (
            <div
              key={name}
              className="flex flex-col gap-2 rounded-sm border border-border-subtle bg-layer-01 p-4"
            >
              <p
                className="text-2xl leading-none text-text-emphasis"
                style={{ fontWeight: value, fontFamily: "var(--ty-font-body)" }}
              >
                Duo
              </p>
              <div className="flex items-baseline justify-between gap-2">
                <code className="ty-type-code-01 text-text-primary">{name}</code>
                <span className="ty-type-label-01 font-mono text-text-secondary">{value}</span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Scale" desc="Code → body → heading → display. Line-heights opened for Duo's wider set width.">
        <ul className="divide-y divide-border-subtle rounded-sm border border-border-subtle bg-layer-01">
          {typeEntries().map(([name, s]) => {
            const isMono = name.startsWith("code");
            return (
              <li key={name} className="grid gap-4 p-6 sm:grid-cols-[220px_1fr] sm:items-baseline">
                <div className="flex flex-col gap-1">
                  <code className="ty-type-code-01 text-text-emphasis">{name}</code>
                  <p className="ty-type-label-01 font-mono text-text-secondary">
                    {s.size} · lh {s.lineHeight} · w{s.weight}
                    {s.letterSpacing !== "0" ? ` · ${s.letterSpacing}` : ""}
                  </p>
                </div>
                <p
                  style={{
                    fontFamily: `var(${isMono ? "--ty-font-mono" : "--ty-font-body"})`,
                    fontSize: s.size,
                    lineHeight: s.lineHeight,
                    fontWeight: s.weight,
                    letterSpacing: s.letterSpacing,
                    color: "var(--ty-text-emphasis)",
                  }}
                >
                  {isMono ? sampleCode : sampleText}
                </p>
              </li>
            );
          })}
        </ul>
      </Section>

      <Section title="Italics" desc="Duo ships italics — kept, not stripped.">
        <p
          className="rounded-sm border border-border-subtle bg-layer-01 p-6 text-lg leading-relaxed text-text-primary"
          style={{ fontFamily: "var(--ty-font-body)" }}
        >
          Duo's italic isn't slanted upright — it's a genuine cursive draw with{" "}
          <em>softened terminals</em> and a slower, more human rhythm. Reserve it for
          emphasis, quotes, and the occasional aside. Use bold for structure; use
          italic when the meaning bends.
        </p>
      </Section>

      <Section title="Mono for readouts" desc="Uppercase, wide tracking, muted color — the terminal voice this system leans on.">
        <div className="rounded-sm border border-border-subtle bg-layer-01 p-6">
          <div className="mb-2 ty-label text-text-secondary">
            System status
          </div>
          <div className="font-mono text-sm text-text-primary">
            <div>
              <span className="text-support-success">●</span> tokens.css · 20 roles · 2 variants · 0 drift
            </div>
            <div>
              <span className="text-support-success">●</span> fonts · 12 woff2 cuts · 273 KB total
            </div>
            <div>
              <span className="text-support-info">●</span> contrast · 198 pairings · 0 failing · 20 exempted
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}

function FamilyCard({
  token,
  role,
  family,
  sample,
  style,
}: {
  token: string;
  role: string;
  family: string;
  sample: string;
  style: React.CSSProperties;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-sm border border-border-subtle bg-layer-01 p-5">
      <div className="flex items-baseline justify-between gap-2">
        <code className="ty-type-code-01 text-text-emphasis">{token}</code>
        <span className="ty-type-label-01 font-mono text-text-secondary">{role}</span>
      </div>
      <p className="text-2xl text-text-emphasis" style={style}>
        {sample}
      </p>
      <p className="break-all ty-type-label-01 font-mono leading-relaxed text-text-secondary">
        {family}
      </p>
    </div>
  );
}
