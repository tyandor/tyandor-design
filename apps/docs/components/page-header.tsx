export function PageHeader({
  eyebrow,
  title,
  lede,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
}) {
  return (
    <header className="mx-auto max-w-6xl px-6 pt-12 pb-8">
      <div className="mb-3 ty-label text-text-secondary">
        {eyebrow}
      </div>
      <h1 className="text-4xl font-semibold tracking-tight text-text-emphasis sm:text-5xl">
        {title}
      </h1>
      {lede ? (
        <p className="mt-4 max-w-2xl text-lg text-text-primary">{lede}</p>
      ) : null}
    </header>
  );
}
