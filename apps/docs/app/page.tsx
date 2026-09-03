import Link from "next/link";
import { CodeBlock } from "../components/code-block";

export default function LandingPage() {
  return (
    <div>
      <section className="border-b border-border-subtle">
        <div className="mx-auto max-w-6xl px-6 pt-20 pb-20">
          <div className="mb-4 font-mono text-[11px] tracking-widest uppercase text-text-secondary">
            @tyandor/design
          </div>
          <h1 className="max-w-4xl text-5xl font-bold tracking-tight text-text-emphasis sm:text-6xl">
            Carbon&apos;s architecture. Expanse&apos;s palette. iA Writer&apos;s type.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-text-primary">
            A personal design system that borrows Carbon&apos;s{" "}
            <em className="text-text-emphasis">roles</em> — layering, tokens, spacing, type scale
            — without taking on <code className="font-mono text-[15px] text-text-emphasis">@carbon/react</code>.
            The Expanse palette supplies the values; iA Writer Duo and Mono supply the voice.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 font-mono text-sm">
            <Link
              href="/foundations/color"
              className="rounded-sm bg-interactive px-4 py-2 text-text-on-color no-underline hover:bg-interactive-hover"
              style={{ backgroundColor: "var(--ty-interactive)" }}
            >
              Browse tokens →
            </Link>
            <Link
              href="/usage"
              className="rounded-sm border border-border-strong px-4 py-2 text-text-primary no-underline hover:bg-layer-hover"
            >
              Install
            </Link>
            <a
              href="https://github.com/tyandor/tyandor-design"
              target="_blank"
              rel="noreferrer"
              className="rounded-sm border border-border-subtle px-4 py-2 text-text-secondary no-underline hover:text-text-primary"
            >
              Source
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-8 font-mono text-[11px] tracking-widest uppercase text-text-secondary">
          What lives here
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          <Card
            eyebrow="Packages"
            title="@tyandor/tokens"
            body="CSS custom properties, a Tailwind preset, and tokens.json. The truth. Everything downstream reads from here."
            href="/foundations/color"
            hrefLabel="Foundations →"
          />
          <Card
            eyebrow="Packages"
            title="@tyandor/fonts"
            body="Subsetted iA Writer Duo and Mono as self-hosted woff2. Ships an @font-face CSS and a next/font/local helper."
            href="/foundations/typography"
            hrefLabel="Typography →"
          />
          <Card
            eyebrow="Sites"
            title="design.tyandor.com"
            body="This site. Rendered directly from tokens.json — when the contract changes, the docs follow with no hand-edits."
            href="/usage"
            hrefLabel="How to consume →"
          />
        </div>
      </section>

      <section className="border-t border-border-subtle bg-layer-01">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="mb-4 font-mono text-[11px] tracking-widest uppercase text-text-secondary">
            Install
          </div>
          <p className="mb-4 max-w-2xl text-text-primary">
            Distributed as git dependencies today. Point a package.json at the
            subpaths of this repository and consume the built <code className="font-mono text-text-emphasis">dist/</code>{" "}
            directly.
          </p>
          <CodeBlock language="json">{`{
  "dependencies": {
    "@tyandor/tokens": "github:tyandor/tyandor-design#path:packages/tokens",
    "@tyandor/fonts":  "github:tyandor/tyandor-design#path:packages/fonts"
  }
}`}</CodeBlock>
          <Link href="/usage" className="font-mono text-sm text-link hover:text-link-hover">
            Full setup (Tailwind 3 &amp; 4, Next.js) →
          </Link>
        </div>
      </section>
    </div>
  );
}

function Card({
  eyebrow,
  title,
  body,
  href,
  hrefLabel,
}: {
  eyebrow: string;
  title: string;
  body: string;
  href: string;
  hrefLabel: string;
}) {
  return (
    <article className="flex h-full flex-col rounded-sm border border-border-subtle bg-layer-01 p-5 transition-colors hover:bg-layer-hover">
      <div className="mb-3 font-mono text-[10px] tracking-widest uppercase text-text-secondary">
        {eyebrow}
      </div>
      <h3 className="font-mono text-lg text-text-emphasis">{title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-text-secondary">{body}</p>
      <Link href={href} className="mt-4 font-mono text-sm text-link hover:text-link-hover no-underline">
        {hrefLabel}
      </Link>
    </article>
  );
}
