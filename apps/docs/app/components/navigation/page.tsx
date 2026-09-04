import Link from "next/link";
import {
  Breadcrumb,
  Footer,
  FooterColumn,
  Header,
  HeaderBrand,
  HeaderLink,
  Pill,
  Stack,
  Text,
} from "@tyandor/ui";
import { PageHeader } from "../../../components/page-header";
import { Section } from "../../../components/section";
import { PropsTable, Specimen } from "../../../components/specimen";

export const metadata = { title: "Navigation components" };

export default function NavigationPage() {
  return (
    <>
      <PageHeader
        eyebrow="@tyandor/ui — navigation"
        title="Navigation"
        lede="The site shell. This page's own header and footer are these components — the docs site is the system's first consumer, so anything it still styles by hand is a gap in the inventory."
      />

      <Section title="Header" desc="Sticky bar with three slots: brand, nav, actions.">
        <Specimen
          title="Assembled header"
          desc="Slots rather than free children, because the arrangement is the design decision. Pass children instead to lay the bar out yourself. Rendered non-sticky here so it stays inside the specimen."
          code={`<Header
  blur
  maxWidth="72rem"
  brand={<HeaderBrand as={Link} href="/">Tyandor design</HeaderBrand>}
  nav={links.map((l) => (
    <HeaderLink key={l.href} as={Link} href={l.href} active={…}>
      {l.label}
    </HeaderLink>
  ))}
  actions={<ThemeToggle />}
/>`}
        >
          <Header
            className="!static"
            brand={
              <HeaderBrand href="#">
                <span aria-hidden className="text-interactive">{">_"}</span>
                <span>Tyandor</span>
              </HeaderBrand>
            }
            nav={
              <>
                <HeaderLink href="#" active>
                  Overview
                </HeaderLink>
                <HeaderLink href="#">Tokens</HeaderLink>
                <HeaderLink href="#">Usage</HeaderLink>
              </>
            }
          />
        </Specimen>

        <Text size="body-01" tone="secondary" className="mb-4 max-w-2xl">
          <code className="ty-font-mono ty-tone-emphasis">as</code> is why this package never
          imports <code className="ty-font-mono">next/link</code>. A Next app passes
          <code className="ty-font-mono"> as=&#123;Link&#125;</code> and keeps client-side
          navigation; a vanilla page gets a plain{" "}
          <code className="ty-font-mono">&lt;a&gt;</code>. Importing next/link in the package would
          make it unusable anywhere else.
        </Text>

        <PropsTable
          rows={[
            { name: "brand", type: "ReactNode", desc: "Wordmark, at the inline start." },
            { name: "nav", type: "ReactNode", desc: "Primary links. Wrapped in a nav landmark." },
            { name: "actions", type: "ReactNode", desc: "Trailing slot — theme toggle, search." },
            { name: "blur", type: "boolean", def: "false", desc: "Translucent, where backdrop-filter is supported." },
            { name: "maxWidth", type: "string", desc: "Content width. Unset runs full-bleed." },
          ]}
        />
      </Section>

      <Section title="Breadcrumb" desc="Trail of ancestor pages.">
        <Specimen
          title="Trail"
          desc="The last item renders as text with aria-current even when it has an href. A link to the page you are already on is a dead end for keyboard and screen-reader users, and the ordered list already carries the hierarchy."
          code={`<Breadcrumb
  linkAs={Link}
  items={[
    { label: "Home", href: "/" },
    { label: "Components", href: "/components" },
    { label: "Navigation" },
  ]}
/>`}
        >
          <Breadcrumb
            linkAs={Link}
            items={[
              { label: "Home", href: "/" },
              { label: "Components", href: "/components" },
              { label: "Navigation" },
            ]}
          />
        </Specimen>

        <PropsTable
          rows={[
            { name: "items", type: "readonly Crumb[]", desc: "Crumbs, root first. Omit href on the last." },
            { name: "separator", type: "ReactNode", def: '"/"', desc: "Decorative; hidden from assistive tech." },
            { name: "linkAs", type: "ElementType", def: '"a"', desc: "Element each crumb link renders." },
          ]}
        />
      </Section>

      <Section title="Pill" desc="Category filter chip.">
        <Specimen
          title="Link and button forms"
          desc="Renders an anchor when given href and a button otherwise — and the ARIA follows: a link that navigates gets aria-current, a control that toggles gets aria-pressed. Both drive the same visual state from the stylesheet, so appearance cannot drift from what is announced."
          code={`<Pill href="/tag/tokens" active>Tokens</Pill>
<Pill count={12}>Typography</Pill>
<Pill aria-disabled="true">Motion</Pill>`}
        >
          <Stack direction="horizontal" gap="03">
            <Pill href="#" active>
              Tokens
            </Pill>
            <Pill href="#">Color</Pill>
            <Pill count={12}>Typography</Pill>
            <Pill count={4}>Spacing</Pill>
            <Pill aria-disabled="true">Motion</Pill>
          </Stack>
        </Specimen>

        <PropsTable
          rows={[
            { name: "href", type: "string", desc: "Present renders an anchor, absent a button." },
            { name: "active", type: "boolean", def: "false", desc: "aria-current on links, aria-pressed on buttons." },
            { name: "count", type: "number", desc: "Trailing tally." },
            { name: "as", type: "ElementType", def: '"a"', desc: "Link form only. Pass as={Link} under Next." },
          ]}
        />
      </Section>

      <Section title="Footer" desc="Auto-fitting columns plus a baseline.">
        <Specimen
          title="Columns"
          desc="Children lay out as auto-fitting columns at a 14rem minimum — no breakpoint needed. The baseline slot sits below a divider for fine print."
          code={`<Footer maxWidth="72rem" baseline={<span className="ty-readout">Two themes, one contract.</span>}>
  <FooterColumn heading="Contract">…</FooterColumn>
</Footer>`}
        >
          <Footer
            className="!border-t-0 !py-0"
            baseline={<span className="ty-readout">Two themes, one contract.</span>}
          >
            <FooterColumn heading="Contract">
              <Text size="body-01">tokens.json is the truth.</Text>
            </FooterColumn>
            <FooterColumn heading="Sources">
              <Text size="body-01">Carbon v11, iA Writer, Expanse.</Text>
            </FooterColumn>
            <FooterColumn heading="Read next">
              <Text size="body-01">Foundations, usage, gallery.</Text>
            </FooterColumn>
          </Footer>
        </Specimen>

        <PropsTable
          rows={[
            { name: "baseline", type: "ReactNode", desc: "Fine print below the divider." },
            { name: "maxWidth", type: "string", desc: "Content width. Unset runs full-bleed." },
            { name: "heading", type: "ReactNode", desc: "FooterColumn — readout-style column label." },
          ]}
        />
      </Section>
    </>
  );
}
