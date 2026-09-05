/**
 * A minimal styled <pre>. Not a real syntax highlighter — usage pages show
 * short snippets where the point is the shape of the config, not the tokens.
 */
export function CodeBlock({
  children,
  language,
}: {
  children: string;
  language?: string;
}) {
  return (
    <pre
      className="my-4 overflow-x-auto rounded-sm border border-border-subtle bg-layer-01 p-4 ty-type-code-01 leading-relaxed text-text-primary"
      data-language={language ?? "plain"}
    >
      <code>{children}</code>
    </pre>
  );
}
