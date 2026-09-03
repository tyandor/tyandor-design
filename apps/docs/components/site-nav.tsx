"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Header, HeaderBrand, HeaderLink, ThemeToggle } from "@tyandor/ui";

const links = [
  { href: "/foundations/color", label: "Color" },
  { href: "/foundations/typography", label: "Typography" },
  { href: "/foundations/spacing", label: "Spacing" },
  { href: "/components", label: "Components" },
  { href: "/usage", label: "Usage" },
] as const;

/**
 * The site shell, now assembled from @tyandor/ui rather than hand-rolled
 * Tailwind — the docs site is the system's first consumer, so anything it
 * still styles by hand is a gap in the component inventory.
 *
 * `as={Link}` is why the package never imports next/link: it keeps client-side
 * navigation here without making @tyandor/ui unusable outside Next.
 */
export function SiteNav() {
  const pathname = usePathname();
  return (
    <Header
      blur
      maxWidth="72rem"
      brand={
        <HeaderBrand as={Link} href="/">
          <span aria-hidden className="text-interactive">{">_"}</span>
          <span>
            Tyandor <span className="text-text-secondary">design</span>
          </span>
        </HeaderBrand>
      }
      nav={links.map((l) => (
        <HeaderLink
          key={l.href}
          as={Link}
          href={l.href}
          active={pathname.startsWith(l.href)}
          className="max-sm:hidden"
        >
          {l.label}
        </HeaderLink>
      ))}
      actions={<ThemeToggle />}
    />
  );
}
