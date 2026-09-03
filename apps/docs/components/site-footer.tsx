import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border-subtle bg-layer-01">
      <div className="mx-auto grid max-w-6xl gap-6 px-6 py-10 sm:grid-cols-3">
        <div>
          <div className="mb-2 font-mono text-[11px] tracking-widest uppercase text-text-secondary">
            Contract
          </div>
          <p className="text-sm text-text-primary">
            @tyandor/tokens is the truth. Everything on this site is a rendered view of
            <code className="mx-1 rounded-sm bg-layer-02 px-1 font-mono text-[13px] text-text-emphasis">tokens.json</code>.
          </p>
        </div>
        <div>
          <div className="mb-2 font-mono text-[11px] tracking-widest uppercase text-text-secondary">
            Sources
          </div>
          <ul className="space-y-1 text-sm">
            <li>
              <a
                href="https://github.com/tyandor/tyandor-design"
                className="text-link hover:text-link-hover"
                target="_blank"
                rel="noreferrer"
              >
                github.com/tyandor/tyandor-design
              </a>
            </li>
            <li>
              <a
                href="https://carbondesignsystem.com/"
                className="text-link hover:text-link-hover"
                target="_blank"
                rel="noreferrer"
              >
                Carbon Design System v11
              </a>
            </li>
            <li>
              <a
                href="https://github.com/iaolo/iA-Fonts"
                className="text-link hover:text-link-hover"
                target="_blank"
                rel="noreferrer"
              >
                iA Writer fonts
              </a>
            </li>
          </ul>
        </div>
        <div>
          <div className="mb-2 font-mono text-[11px] tracking-widest uppercase text-text-secondary">
            Read next
          </div>
          <ul className="space-y-1 text-sm">
            <li>
              <Link href="/foundations/color" className="text-link hover:text-link-hover">
                Color foundations
              </Link>
            </li>
            <li>
              <Link href="/foundations/typography" className="text-link hover:text-link-hover">
                Type scale
              </Link>
            </li>
            <li>
              <Link href="/usage" className="text-link hover:text-link-hover">
                Install &amp; usage
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border-subtle">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 font-mono text-[11px] tracking-widest uppercase text-text-secondary">
          <span>Two themes, one contract.</span>
          <span aria-hidden>MCRN // Earth</span>
        </div>
      </div>
    </footer>
  );
}
