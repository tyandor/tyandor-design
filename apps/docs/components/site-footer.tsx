import Link from "next/link";
import { Footer, FooterColumn, Stack, Text } from "@tyandor/ui";

const sources = [
  { href: "https://github.com/tyandor/tyandor-design", label: "github.com/tyandor/tyandor-design" },
  { href: "https://carbondesignsystem.com/", label: "Carbon Design System v11" },
  { href: "https://github.com/iaolo/iA-Fonts", label: "iA Writer fonts" },
] as const;

const readNext = [
  { href: "/foundations/color", label: "Color foundations" },
  { href: "/foundations/typography", label: "Type scale" },
  { href: "/components", label: "Component gallery" },
  { href: "/usage", label: "Install & usage" },
] as const;

export function SiteFooter() {
  return (
    <Footer
      maxWidth="72rem"
      className="mt-24"
      baseline={
        <div className="flex items-center justify-between gap-4">
          <span className="ty-readout">Two themes, one contract.</span>
          <span aria-hidden className="ty-readout">MCRN // Earth</span>
        </div>
      }
    >
      <FooterColumn heading="Contract">
        <Text size="body-01" tone="primary">
          @tyandor/tokens is the truth. Everything on this site is a rendered view of{" "}
          <code className="ty-font-mono ty-tone-emphasis">tokens.json</code>.
        </Text>
      </FooterColumn>

      <FooterColumn heading="Sources">
        <Stack gap="02" as="ul" className="list-none p-0">
          {sources.map((s) => (
            <li key={s.href}>
              <a href={s.href} target="_blank" rel="noreferrer" className="ty-tone-link ty-focus-ring">
                {s.label}
              </a>
            </li>
          ))}
        </Stack>
      </FooterColumn>

      <FooterColumn heading="Read next">
        <Stack gap="02" as="ul" className="list-none p-0">
          {readNext.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="ty-tone-link ty-focus-ring">
                {l.label}
              </Link>
            </li>
          ))}
        </Stack>
      </FooterColumn>
    </Footer>
  );
}
