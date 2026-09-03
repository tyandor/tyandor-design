import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

const links = [
  { href: "/foundations/color", label: "Color" },
  { href: "/foundations/typography", label: "Typography" },
  { href: "/foundations/spacing", label: "Spacing" },
  { href: "/usage", label: "Usage" },
] as const;

export function SiteNav() {
  return (
    <header className="sticky top-0 z-30 border-b border-border-subtle bg-background/85 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-3">
        <Link href="/" className="flex items-center gap-2 no-underline">
          <span aria-hidden className="font-mono text-interactive">{">_"}</span>
          <span className="font-mono text-[13px] tracking-widest uppercase text-text-primary">
            Tyandor <span className="text-text-secondary">design</span>
          </span>
        </Link>
        <nav aria-label="Primary" className="hidden gap-5 font-mono text-[13px] sm:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-text-secondary hover:text-text-primary no-underline">
              {l.label}
            </Link>
          ))}
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}
