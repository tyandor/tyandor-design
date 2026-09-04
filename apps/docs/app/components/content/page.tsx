import {
  Card,
  CardBody,
  CardFooter,
  CardTitle,
  Divider,
  Grid,
  Prose,
  Quote,
  Stack,
  Tag,
  Text,
} from "@tyandor/ui";
import { PageHeader } from "../../../components/page-header";
import { Section } from "../../../components/section";
import { PropsTable, Specimen } from "../../../components/specimen";

export const metadata = { title: "Content components" };

export default function ContentPage() {
  return (
    <>
      <PageHeader
        eyebrow="@tyandor/ui — content"
        title="Content"
        lede="Surfaces, labels, and the prose styles for HTML this system did not author."
      />

      <Section title="Card" desc="A layered surface.">
        <Specimen
          title="Layers, not shadows"
          desc="On MCRN's #050910 background a drop shadow renders as nothing at all, so depth is layer colour plus border. raised steps the layer token up — Carbon's layering model — and picks up a real shadow only on Earth, where --ty-shadow-01 is non-none. Flip the theme to see the difference."
          code={`<Card>…</Card>
<Card raised>…</Card>
<Card href="/somewhere">…</Card>`}
        >
          <Grid minItemWidth="15rem" gap="05">
            <Card>
              <CardTitle>Default</CardTitle>
              <CardBody>layer-01 on background, border-subtle.</CardBody>
            </Card>
            <Card raised>
              <CardTitle>Raised</CardTitle>
              <CardBody>layer-02, plus shadow-01 on Earth only.</CardBody>
            </Card>
            <Card href="#">
              <CardTitle>Interactive</CardTitle>
              <CardBody>Whole card is a link. Hover shifts to layer-hover.</CardBody>
              <CardFooter>
                <Text readout tone="secondary">
                  border-strong on hover
                </Text>
              </CardFooter>
            </Card>
          </Grid>
        </Specimen>

        <PropsTable
          rows={[
            { name: "raised", type: "boolean", def: "false", desc: "Step up to layer-02 for a card on an already-layered surface." },
            { name: "flush", type: "boolean", def: "false", desc: "Drop the padding." },
            { name: "href", type: "string", desc: "Whole-card link. Renders an anchor and adds the hover treatment." },
            { name: "as", type: "ElementType", def: "a | div", desc: "Element to render. Pass as={Link} under Next." },
          ]}
        />
      </Section>

      <Section title="Tag" desc="Small label — status, category, metadata.">
        <Specimen
          title="Variants"
          desc="Support variants are tinted outlines, not solid fills. A solid support colour would need a matching on-colour text token for each of the four roles in both themes; the outline keeps text on text-primary, which the contrast gate already guarantees against every layer."
          code={`<Tag>neutral</Tag>
<Tag variant="outline">outline</Tag>
<Tag variant="success" dot>passing</Tag>`}
        >
          <Stack direction="horizontal" gap="03">
            <Tag>neutral</Tag>
            <Tag variant="outline">outline</Tag>
            <Tag variant="success" dot>
              passing
            </Tag>
            <Tag variant="info" dot>
              info
            </Tag>
            <Tag variant="warning" dot>
              borderline
            </Tag>
            <Tag variant="error" dot>
              failing
            </Tag>
          </Stack>
        </Specimen>

        <Text size="body-01" tone="secondary" className="mb-4 max-w-2xl">
          <code className="ty-font-mono ty-tone-emphasis">Badge</code> is an alias for the same
          component — both names are in circulation, and exporting one object under two names is
          cheaper than maintaining two that drift.
        </Text>

        <PropsTable
          rows={[
            { name: "variant", type: '"neutral" | "outline" | "error" | "warning" | "success" | "info"', def: '"neutral"', desc: "Support role." },
            { name: "dot", type: "boolean", def: "false", desc: "Leading status dot in the variant's colour." },
          ]}
        />
      </Section>

      <Section title="Divider" desc="A rule.">
        <Specimen
          title="Orientation"
          desc="Vertical dividers render as a div with role=separator. hr is defined as a paragraph-level thematic break, and using one inside a flex row of controls is a semantic claim the markup cannot honour."
          code={`<Divider />
<Divider strong />
<Divider orientation="vertical" />`}
        >
          <Stack gap="05">
            <Divider />
            <Divider strong />
            <Stack direction="horizontal" gap={0} align="center" className="h-10">
              <Text size="body-01">before</Text>
              <Divider orientation="vertical" />
              <Text size="body-01">after</Text>
            </Stack>
          </Stack>
        </Specimen>
      </Section>

      <Section title="Quote" desc="Blockquote and pull-quote.">
        <Specimen
          title="Both treatments"
          code={`<Quote attribution="PLAN.md">…</Quote>
<Quote pull attribution="PLAN.md">…</Quote>`}
        >
          <Stack gap="06">
            <Quote attribution="PLAN.md, Principles">
              Tokens are the product. Components come and go; the token contract is what every
              project depends on.
            </Quote>
            <Quote pull attribution="PLAN.md, Vision">
              Using iA Writer Duo inside a Carbon-shaped system isn&rsquo;t a hack; it&rsquo;s a
              fork of Carbon&rsquo;s own type DNA back toward its source.
            </Quote>
          </Stack>
        </Specimen>

        <PropsTable
          rows={[
            { name: "pull", type: "boolean", def: "false", desc: "Display-weight treatment that breaks the measure." },
            { name: "attribution", type: "ReactNode", desc: "Rendered in a footer inside the blockquote, per the HTML spec." },
            { name: "cite", type: "string", desc: "Source URL, surfaced as the blockquote's cite attribute." },
          ]}
        />
      </Section>

      <Section
        title="Prose"
        desc="Article body styles for HTML this package did not author — CMS output, compiled Markdown, MDX."
      >
        <Specimen
          title="Rendered markup"
          desc="PLAN.md pointed at @tailwindcss/typography driven by tokens, but that plugin is a Tailwind build dependency and this package deliberately has none. A plain descendant-selector block reaches vanilla-CSS, Tailwind 3 and Tailwind 4 consumers identically, reading the same --ty-* variables the plugin config would have."
          code={`<Prose as="article" dangerouslySetInnerHTML={{ __html: compiledMarkdown }} />`}
        >
          <Prose as="article">
            <h2>Two themes, one contract</h2>
            <p>
              Token <em>names</em> follow Carbon&rsquo;s role-based model. Token{" "}
              <strong>values</strong> come exclusively from the Expanse palette — and every role
              resolves in both <code>mcrn</code> and <code>earth</code>.
            </p>
            <ul>
              <li>Roles for components</li>
              <li>Accents for charts, syntax, faction labels</li>
            </ul>
            <blockquote>Every rule inside is written with :where().</blockquote>
            <p>
              That lands them all at zero specificity, so a consumer&rsquo;s own selectors win
              without <code>!important</code>, and a component rendered inside prose keeps its own
              styling rather than being restyled by its container.
            </p>
            <pre>
              <code>{`bun add @tyandor/ui\nimport "@tyandor/ui/ui.css";`}</code>
            </pre>
          </Prose>
        </Specimen>
      </Section>
    </>
  );
}
