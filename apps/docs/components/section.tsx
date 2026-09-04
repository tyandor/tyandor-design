export function Section({
  id,
  title,
  desc,
  children,
}: {
  id?: string;
  title: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6 flex items-baseline justify-between border-b border-border-subtle pb-3">
        <h2 className="ty-label text-text-secondary">
          {title}
        </h2>
        {desc ? (
          <p className="hidden text-sm text-text-secondary sm:block">{desc}</p>
        ) : null}
      </div>
      {desc ? (
        <p className="mb-6 max-w-2xl text-sm text-text-secondary sm:hidden">{desc}</p>
      ) : null}
      {children}
    </section>
  );
}
