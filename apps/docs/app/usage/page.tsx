import { CodeBlock } from "../../components/code-block";
import { PageHeader } from "../../components/page-header";
import { Section } from "../../components/section";

export const metadata = { title: "Usage" };

export default function UsagePage() {
  return (
    <>
      <PageHeader
        eyebrow="Install"
        title="Usage"
        lede="Distribute as git dependencies today. Publish to npm only if friction demands it."
      />

      <Section title="Install" desc="package.json — same shape for Tailwind 3 or 4.">
        <CodeBlock language="json">{`{
  "dependencies": {
    "@tyandor/tokens": "github:tyandor/tyandor-design#path:packages/tokens",
    "@tyandor/fonts":  "github:tyandor/tyandor-design#path:packages/fonts"
  }
}`}</CodeBlock>
      </Section>

      <Section title="Tailwind 3" desc="Wire tokens.css into your entry stylesheet and add the preset.">
        <p className="mb-2 font-mono text-[11px] tracking-widest uppercase text-text-secondary">
          globals.css
        </p>
        <CodeBlock language="css">{`@import "@tyandor/tokens/tokens.css";
@import "@tyandor/fonts/fonts.css";

@tailwind base;
@tailwind components;
@tailwind utilities;`}</CodeBlock>

        <p className="mt-4 mb-2 font-mono text-[11px] tracking-widest uppercase text-text-secondary">
          tailwind.config.ts
        </p>
        <CodeBlock language="ts">{`import type { Config } from "tailwindcss";
import tyandor from "@tyandor/tokens/tailwind-preset";

export default {
  presets: [tyandor],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
} satisfies Config;`}</CodeBlock>
      </Section>

      <Section title="Tailwind 4" desc="Map the role tokens into @theme so Tailwind's utilities resolve to var(--ty-*).">
        <p className="mb-2 font-mono text-[11px] tracking-widest uppercase text-text-secondary">
          globals.css
        </p>
        <CodeBlock language="css">{`@import "@tyandor/tokens/tokens.css";
@import "@tyandor/fonts/fonts.css";
@import "tailwindcss";

@theme {
  --color-background:    var(--ty-background);
  --color-layer-01:      var(--ty-layer-01);
  --color-text-primary:  var(--ty-text-primary);
  --color-text-emphasis: var(--ty-text-emphasis);
  --color-interactive:   var(--ty-interactive);
  --color-link:          var(--ty-link);
  /* …the rest of the roles you actually reach for */

  --font-body: var(--ty-font-body);
  --font-mono: var(--ty-font-mono);
}`}</CodeBlock>
        <p className="mt-3 text-sm text-text-secondary">
          The theme block references — not inlines — the token variables. A{" "}
          <code className="font-mono text-text-emphasis">data-theme</code> swap on{" "}
          <code className="font-mono text-text-emphasis">&lt;html&gt;</code> repaints every
          utility with no rebuild.
        </p>
      </Section>

      <Section title="Fonts (Next.js)" desc="Best CLS behavior. Path used by tyandor.com.">
        <CodeBlock language="ts">{`// next.config.mjs
export default {
  transpilePackages: ["@tyandor/fonts"], // src/next.ts stays raw TS
};

// app/layout.tsx
import { fontVariables } from "@tyandor/fonts/next";
import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={fontVariables}>
      <body>{children}</body>
    </html>
  );
}`}</CodeBlock>
      </Section>

      <Section title="Themes" desc="Two variants, one contract.">
        <div className="space-y-3 text-sm text-text-primary">
          <p>
            <strong className="text-text-emphasis">MCRN (dark)</strong> is the default —{" "}
            <code className="font-mono text-text-emphasis">:root</code> defines it. No
            attribute needed.
          </p>
          <p>
            <strong className="text-text-emphasis">Earth (light)</strong> applies when the
            user has no explicit preference and their system asks for light,{" "}
            <em>or</em> whenever{" "}
            <code className="font-mono text-text-emphasis">
              [data-theme=&quot;earth&quot;]
            </code>{" "}
            is set on the root.
          </p>
          <p>
            An explicit <code className="font-mono text-text-emphasis">data-theme</code>{" "}
            always wins: the media-query fallback is scoped to{" "}
            <code className="font-mono text-text-emphasis">
              :root:not([data-theme])
            </code>
            , so it simply does not match once a choice has been made.
          </p>
        </div>
      </Section>

      <Section title="Do / Don't" desc="Two rules keep the system honest.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Rule
            kind="do"
            title="Use role tokens for UI"
            body={
              <>
                Reach for <code className="font-mono text-text-emphasis">bg-layer-01</code>,{" "}
                <code className="font-mono text-text-emphasis">text-primary</code>,{" "}
                <code className="font-mono text-text-emphasis">border-subtle</code>. Both
                themes stay valid.
              </>
            }
          />
          <Rule
            kind="dont"
            title="Don't inline hex values"
            body={
              <>
                Never write <code className="font-mono text-support-error">bg-[#e8c97a]</code>{" "}
                in a component. It ignores the theme contract and drifts the moment the
                palette moves upstream.
              </>
            }
          />
          <Rule
            kind="do"
            title="Reach for accents in charts &amp; syntax"
            body={
              <>
                Data viz and code highlighting can name accents directly —{" "}
                <code className="font-mono text-text-emphasis">--ty-accent-amber</code>,{" "}
                <code className="font-mono text-text-emphasis">--ty-accent-cyan</code>. Both
                themes carry every accent.
              </>
            }
          />
          <Rule
            kind="dont"
            title="Don't use accents for UI chrome"
            body={
              <>
                Buttons, links, and borders use role tokens (
                <code className="font-mono text-text-emphasis">interactive</code>,{" "}
                <code className="font-mono text-text-emphasis">link</code>). The role picks
                the accent; the component does not.
              </>
            }
          />
        </div>
      </Section>
    </>
  );
}

function Rule({
  kind,
  title,
  body,
}: {
  kind: "do" | "dont";
  title: string;
  body: React.ReactNode;
}) {
  const isDo = kind === "do";
  return (
    <div
      className="flex flex-col gap-2 rounded-sm border-l-2 border-border-subtle bg-layer-01 p-4"
      style={{
        borderLeftColor: isDo ? "var(--ty-support-success)" : "var(--ty-support-error)",
      }}
    >
      <div className="flex items-center gap-2 font-mono text-[11px] tracking-widest uppercase">
        <span style={{ color: isDo ? "var(--ty-support-success)" : "var(--ty-support-error)" }}>
          {isDo ? "Do" : "Don't"}
        </span>
        <span className="text-text-secondary">{title}</span>
      </div>
      <p className="text-sm text-text-primary">{body}</p>
    </div>
  );
}
