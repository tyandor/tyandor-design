import { Divider, Grid, Heading, Stack, Text, ThemeToggle } from "@tyandor/ui";
import { PageHeader } from "../../../components/page-header";
import { Section } from "../../../components/section";
import { PropsTable, Specimen } from "../../../components/specimen";
import { typeEntries } from "../../../lib/tokens";

export const metadata = { title: "Foundation components" };

/** A visible block, so gap and column behaviour are legible in a specimen. */
function Box({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex min-h-10 items-center justify-center rounded-sm border border-border-subtle bg-layer-02 px-3 ty-type-code-01 text-text-secondary">
      {children}
    </div>
  );
}

export default function FoundationPage() {
  return (
    <>
      <PageHeader
        eyebrow="@tyandor/ui — foundation"
        title="Foundation"
        lede="Theme, text, and layout. Every other component in the system is assembled from these four."
      />

      <Section
        title="Text"
        desc="A run of text at a type-scale role. size names a role, not a pixel value."
      >
        <Specimen
          title="Type-scale roles"
          desc={`All ${typeEntries().length} roles. code-01 and code-02 pick up the Mono stack from their generated class — a caller never chooses a family for a role.`}
          code={`<Text size="body-02">Duo runs wide; the scale is tuned for it.</Text>
<Text size="code-01">const tokens = "the product";</Text>`}
        >
          <Stack gap="04">
            {typeEntries().map(([token]) => (
              <div key={token} className="flex items-baseline gap-4">
                <code className="w-28 shrink-0 ty-type-label-01 font-mono text-text-placeholder">
                  {token}
                </code>
                <Text size={token} className="truncate">
                  Carbon&rsquo;s roles, Expanse&rsquo;s values
                </Text>
              </div>
            ))}
          </Stack>
        </Specimen>

        <Specimen
          title="Tone"
          desc="Colour role, independent of size. Support tones carry meaning; use them for meaning."
          code={`<Text tone="secondary">Supporting detail</Text>
<Text tone="success">Contrast gate passed</Text>`}
        >
          <Stack gap="03">
            {(["primary", "secondary", "emphasis", "placeholder", "link", "error", "warning", "success", "info"] as const).map(
              (tone) => (
                <div key={tone} className="flex items-baseline gap-4">
                  <code className="w-28 shrink-0 ty-type-label-01 font-mono text-text-placeholder">
                    {tone}
                  </code>
                  <Text tone={tone}>The quick brown fox jumps over the lazy dog</Text>
                </div>
              ),
            )}
          </Stack>
        </Specimen>

        <Specimen
          title="Readout"
          desc="The MCRN flourish: uppercase, tracked out, Mono. Used for section eyebrows and status lines."
          code={`<Text readout tone="secondary">Systems nominal</Text>`}
        >
          <Text readout tone="secondary">
            Systems nominal // 198 pairings checked
          </Text>
        </Specimen>

        <PropsTable
          rows={[
            { name: "size", type: "TypeToken", def: '"body-01"', desc: "Type-scale role." },
            { name: "tone", type: "Tone", def: '"primary"', desc: "Colour role." },
            { name: "measure", type: "boolean", def: "false", desc: "Constrain to the 65ch measure." },
            { name: "readout", type: "boolean", def: "false", desc: "Uppercase tracked Mono. Overrides size." },
            { name: "as", type: "ElementType", def: '"p"', desc: "Element to render." },
          ]}
        />
      </Section>

      <Section
        title="Heading"
        desc="Outline level and visual weight are separate axes — on purpose."
      >
        <Specimen
          title="Level drives the tag, size drives the look"
          desc="A section that is structurally an h2 can still be set at heading-02 inside a card, without lying to a screen reader about the document outline."
          code={`<Heading level={2}>Defaults to heading-05</Heading>
<Heading level={2} size="heading-02">Same outline, smaller</Heading>`}
        >
          <Stack gap="04">
            <Heading level={2}>Level 2 — defaults to heading-05</Heading>
            <Heading level={2} size="heading-02">
              Level 2 — overridden to heading-02
            </Heading>
            <Heading level={3}>Level 3 — defaults to heading-04</Heading>
          </Stack>
        </Specimen>

        <PropsTable
          rows={[
            { name: "level", type: "1 | 2 | 3 | 4 | 5 | 6", def: "2", desc: "Document outline position. Sets the tag." },
            { name: "size", type: "TypeToken", def: "derived from level", desc: "Visual weight, decoupled from the outline." },
            { name: "tone", type: "Tone", def: '"emphasis"', desc: "Colour role." },
          ]}
        />
      </Section>

      <Divider />

      <Section title="Stack" desc="One-dimensional layout on the spacing scale.">
        <Specimen
          title="Direction and gap"
          desc="gap takes a spacing-scale step, never a length — the inline style resolves to var(--ty-spacing-NN), so the token contract holds at the callsite."
          code={`<Stack direction="horizontal" gap="03">
  <Box>one</Box>
  <Box>two</Box>
</Stack>`}
        >
          <Stack gap="06">
            {(["03", "05", "07"] as const).map((gap) => (
              <div key={gap}>
                <code className="mb-2 block ty-type-label-01 font-mono text-text-placeholder">
                  gap=&quot;{gap}&quot;
                </code>
                <Stack direction="horizontal" gap={gap}>
                  <Box>one</Box>
                  <Box>two</Box>
                  <Box>three</Box>
                </Stack>
              </div>
            ))}
          </Stack>
        </Specimen>

        <PropsTable
          rows={[
            { name: "direction", type: '"vertical" | "horizontal"', def: '"vertical"', desc: "Main axis." },
            { name: "gap", type: "SpacingStep | 0", def: '"05"', desc: "Spacing-scale step (16px)." },
            { name: "align", type: '"start" | "center" | "end" | "baseline" | "stretch"', desc: "Cross-axis alignment." },
            { name: "justify", type: '"start" | "center" | "end" | "between"', desc: "Main-axis distribution." },
            { name: "wrap", type: "boolean", def: "horizontal", desc: "Horizontal stacks wrap by default so rows of tags reflow." },
          ]}
        />
      </Section>

      <Section title="Grid" desc="Two-dimensional layout, with a breakpoint baked in.">
        <Specimen
          title="Fixed columns"
          desc="Collapses to one column below Carbon's md breakpoint (672px). A 4-up grid on a phone is four slivers; baking the collapse in means no consumer has to remember it. Narrow this window to see it."
          code={`<Grid columns={4} gap="05">…</Grid>`}
        >
          <Grid columns={4} gap="05">
            {[1, 2, 3, 4].map((n) => (
              <Box key={n}>{n}</Box>
            ))}
          </Grid>
        </Specimen>

        <Specimen
          title="Auto-fit"
          desc="As many columns as fit at the given minimum. Needs no breakpoint, because it has no fixed count — which is why minItemWidth takes precedence over columns."
          code={`<Grid minItemWidth="12rem" gap="05">…</Grid>`}
        >
          <Grid minItemWidth="12rem" gap="05">
            {[1, 2, 3, 4, 5].map((n) => (
              <Box key={n}>min 12rem</Box>
            ))}
          </Grid>
        </Specimen>

        <PropsTable
          rows={[
            { name: "columns", type: "number", def: "1", desc: "Fixed track count. Collapses to one below 672px." },
            { name: "minItemWidth", type: "string", desc: "Auto-fit track minimum. Takes precedence over columns." },
            { name: "gap", type: "SpacingStep | 0", def: '"06"', desc: "Spacing-scale step (24px)." },
          ]}
        />
      </Section>

      <Divider />

      <Section title="ThemeProvider" desc="Three-way theme state: mcrn / earth / system.">
        <Specimen
          title="ThemeToggle"
          desc="The control in this site's header is this component. It is a radiogroup, not a toolbar: the three options are mutually exclusive views of one setting, which is what a radio group means."
          code={`<ThemeProvider>
  <ThemeToggle />
</ThemeProvider>`}
        >
          <ThemeToggle />
        </Specimen>

        <Stack gap="04" className="max-w-2xl">
          <Text size="body-01" tone="secondary">
            <strong className="text-text-emphasis">system removes the attribute</strong> rather
            than setting a resolved value. That is the whole mechanism: tokens.css guards its
            <code className="ty-font-mono"> prefers-color-scheme</code> block with
            <code className="ty-font-mono"> :root:not([data-theme])</code>, so an absent attribute
            hands control to the media query and a present one takes it back.
          </Text>
          <Text size="body-01" tone="secondary">
            <code className="ty-font-mono">themeScript()</code> ships from a separate module with
            no <code className="ty-font-mono">&quot;use client&quot;</code> directive, because it
            has to stay callable from a server component — its entire job is to run in
            <code className="ty-font-mono"> &lt;head&gt;</code> before hydration, so a returning
            visitor on Earth never sees a frame of MCRN.
          </Text>
        </Stack>
      </Section>
    </>
  );
}
