import { CodeBlock } from "./code-block";

/**
 * One component demonstration: a live instance above the source that
 * produced it.
 *
 * The example renders for real rather than as a screenshot, so it picks up
 * the active theme — flipping the toggle in the header re-renders every
 * specimen on the page, which is the fastest way to spot a component that
 * hard-codes a colour.
 *
 * Source is in a <details> so a gallery page stays scannable; <details>
 * needs no JavaScript, which keeps these pages server-rendered.
 */
export function Specimen({
  title,
  desc,
  code,
  children,
}: {
  title: string;
  desc?: string;
  code?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-8">
      <h3 className="mb-1 ty-type-heading-01 text-text-emphasis">{title}</h3>
      {desc ? <p className="mb-3 max-w-2xl text-sm text-text-secondary">{desc}</p> : null}
      <div className="rounded-sm border border-border-subtle bg-layer-01 p-6">{children}</div>
      {code ? (
        <details className="mt-2">
          <summary className="cursor-pointer ty-label text-text-secondary hover:text-text-primary">
            Source
          </summary>
          <CodeBlock language="tsx">{code}</CodeBlock>
        </details>
      ) : null}
    </div>
  );
}

export interface PropRow {
  readonly name: string;
  readonly type: string;
  readonly def?: string;
  readonly desc: string;
}

/** Prop table. Carbon's data-table rule: no zebra, borders carry the rows. */
export function PropsTable({ rows }: { rows: readonly PropRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[36rem] border-collapse text-sm">
        <thead>
          <tr>
            {["Prop", "Type", "Default", "Notes"].map((h) => (
              <th
                key={h}
                className="border-b border-border-strong py-2 pr-4 text-left ty-label text-text-secondary"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.name}>
              <td className="border-b border-border-subtle py-2 pr-4 align-top ty-type-code-01 text-text-emphasis">
                {r.name}
              </td>
              <td className="border-b border-border-subtle py-2 pr-4 align-top ty-type-code-01 text-link">
                {r.type}
              </td>
              <td className="border-b border-border-subtle py-2 pr-4 align-top ty-type-code-01 text-text-placeholder">
                {r.def ?? "—"}
              </td>
              <td className="border-b border-border-subtle py-2 align-top text-text-secondary">
                {r.desc}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
