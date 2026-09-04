import Link from "next/link";
import { Card, CardBody, CardTitle, Grid, Stack, Tag, Text } from "@tyandor/ui";
import { PageHeader } from "../../components/page-header";
import { Section } from "../../components/section";

export const metadata = { title: "Components" };

const groups = [
  {
    href: "/components/foundation",
    title: "Foundation",
    desc: "Theme, type-scale text, and the two layout primitives everything else is assembled from.",
    items: ["ThemeProvider", "ThemeToggle", "Text", "Heading", "Stack", "Grid"],
  },
  {
    href: "/components/navigation",
    title: "Navigation",
    desc: "The site shell — this page's own header and footer are these components.",
    items: ["Header", "Footer", "Breadcrumb", "Pill"],
  },
  {
    href: "/components/content",
    title: "Content",
    desc: "Surfaces, labels, and the prose styles for HTML this system did not author.",
    items: ["Card", "Tag", "Divider", "Quote", "Prose"],
  },
] as const;

export default function ComponentsIndexPage() {
  return (
    <>
      <PageHeader
        eyebrow="@tyandor/ui"
        title="Components"
        lede="Built on the token contract, styled with plain CSS classes, and free of a Tailwind dependency — so a Tailwind 3 app, a Tailwind 4 app, and a page with no build step all render them identically."
      />

      <Section title="Inventory" desc="Milestone 4: foundation, navigation, content.">
        <Grid minItemWidth="18rem" gap="06">
          {groups.map((g) => (
            <Card key={g.href} href={g.href} as={Link}>
              <CardTitle>{g.title}</CardTitle>
              <CardBody>{g.desc}</CardBody>
              <Stack direction="horizontal" gap="02" className="mt-4">
                {g.items.map((i) => (
                  <Tag key={i} variant="outline">
                    {i}
                  </Tag>
                ))}
              </Stack>
            </Card>
          ))}
        </Grid>
      </Section>

      <Section
        title="The rule"
        desc="What separates a role token from an accent token, in one line."
      >
        <Stack gap="05" className="max-w-2xl">
          <Text size="body-02">
            Components read <strong className="text-text-emphasis">role tokens only</strong> —
            <code className="ty-font-mono ty-tone-link"> background</code>,
            <code className="ty-font-mono ty-tone-link"> layer-01</code>,
            <code className="ty-font-mono ty-tone-link"> text-primary</code>. The ten named accents
            are for expressive work: charts, syntax highlighting, faction labels.
          </Text>
          <Text size="body-02" tone="secondary">
            This is enforced, not documented. The build fails if any literal colour value reaches
            ui.css, if a component class shadows one that tokens.css already defines, or if a rule
            references a <code className="ty-font-mono">--ty-*</code> variable that does not exist.
          </Text>
        </Stack>
      </Section>
    </>
  );
}
