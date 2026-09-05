/**
 * Local development: the docs site, plus package rebuilds on change.
 *
 * Why this exists rather than `bun --watch run build.ts` per package:
 * bun's watcher follows a script's *import graph*, and packages/ui/build.ts
 * reads its CSS partials with readFile at runtime. Editing
 * src/styles/04-navigation.css would therefore never trigger a rebuild —
 * silently, which is the worst way for a dev loop to fail. This watches the
 * source directories instead, so a CSS edit and a token edit behave the same.
 *
 * Rebuilds run the real `build:packages`, so the workspace dependency graph
 * still orders tokens before ui, and all three of ui's gates still run. A
 * gate failure prints and leaves the previous dist in place; the dev server
 * keeps serving the last good build rather than dying.
 *
 * Next's own watcher handles apps/docs — component source in packages/ui is
 * exported as TypeScript, so those edits hot-reload without a build. Only
 * generated CSS and token values need this.
 */
import { watch } from "node:fs";
import { join } from "node:path";

const PORT = 4310;
const WATCHED = ["packages/tokens/src", "packages/ui/src", "packages/fonts/src"];
const DEBOUNCE_MS = 120;

const children: Bun.Subprocess[] = [];
let building = false;
let queued = false;

async function buildPackages(label: string): Promise<boolean> {
  const proc = Bun.spawn(["bun", "run", "build:packages"], { stdout: "pipe", stderr: "pipe" });
  const [out, err, code] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]);
  if (code === 0) {
    // One line per package is enough; the full output is noise on every save.
    const built = [...out.matchAll(/^@tyandor\/(\w+) build: (.+)$/gm)]
      .map((m) => m[2]!)
      .filter((l) => l.includes("—") || l.includes("built"));
    console.log(`  ${label} ${built.length ? built.join("\n  ") : "ok"}`);
    return true;
  }
  console.error(`\n  ${label} build failed — serving the previous dist:\n`);
  console.error((err + out).trimEnd().replace(/^/gm, "    "));
  console.error("");
  return false;
}

async function rebuild() {
  if (building) {
    queued = true;
    return;
  }
  building = true;
  await buildPackages("rebuilt");
  building = false;
  if (queued) {
    queued = false;
    await rebuild();
  }
}

// ── Initial build ───────────────────────────────────────────────────────
// Must succeed: apps/docs imports tokens.css and ui.css from dist, so a
// missing dist is a broken page rather than a stale one.
console.log(`\n  tyandor-design — building packages\n`);
if (!(await buildPackages("built"))) {
  console.error("  Cannot start the dev server without a package build.\n");
  process.exit(1);
}

// ── Watch package sources ───────────────────────────────────────────────
let timer: ReturnType<typeof setTimeout> | undefined;
for (const dir of WATCHED) {
  watch(join(process.cwd(), dir), { recursive: true }, (_event, file) => {
    if (!file || file.startsWith(".")) return;
    clearTimeout(timer);
    timer = setTimeout(() => void rebuild(), DEBOUNCE_MS);
  });
}
console.log(`  watching ${WATCHED.join(", ")}\n`);

// ── Docs site ───────────────────────────────────────────────────────────
children.push(
  Bun.spawn(["bun", "run", "--filter", "./apps/docs", "dev"], {
    stdout: "inherit",
    stderr: "inherit",
  }),
);

const shutdown = () => {
  for (const c of children) c.kill();
  process.exit(0);
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

await children[0]!.exited;
console.log(`\n  dev server on :${PORT} exited\n`);
