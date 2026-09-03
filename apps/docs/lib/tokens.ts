/**
 * Typed view over @tyandor/tokens/tokens.json.
 *
 * The docs site treats tokens.json as its data source: every foundations
 * page is a render of this manifest rather than duplicated hex literals.
 * When tokens.css changes, the pages change with it, and there is nothing
 * left to keep in sync by hand.
 */
import raw from "@tyandor/tokens/tokens.json" with { type: "json" };

export type Variant = "mcrn" | "earth";
export type RoleKind = "surface" | "text" | "nontext" | "scrim";

export interface Primitive {
  readonly name: string;
  readonly mcrn: string;
  readonly earth: string;
  readonly role: string;
  readonly tagline?: string;
}

export interface RoleMeta {
  readonly kind: RoleKind;
  readonly desc: string;
}

export interface TypeStyle {
  readonly size: string;
  readonly lineHeight: string;
  readonly weight: string;
  readonly letterSpacing: string;
}

export interface Dual {
  readonly mcrn: string;
  readonly earth: string;
}

interface TokensManifest {
  readonly $schema: string;
  readonly name: string;
  readonly description: string;
  readonly variants: readonly Variant[];
  readonly palette: {
    readonly backgrounds: Readonly<Record<string, Primitive>>;
    readonly foregrounds: Readonly<Record<string, Primitive>>;
    readonly accents: Readonly<Record<string, Primitive>>;
    readonly highlights: Readonly<Record<string, Primitive>>;
  };
  readonly chartSeries: readonly string[];
  readonly roles: {
    readonly meta: Readonly<Record<string, RoleMeta>>;
    readonly mcrn: Readonly<Record<string, string>>;
    readonly earth: Readonly<Record<string, string>>;
  };
  readonly spacing: Readonly<Record<string, string>>;
  readonly sizes: Readonly<Record<string, string>>;
  readonly breakpoints: Readonly<Record<string, string>>;
  readonly grid: {
    readonly columns: number;
    readonly miniUnit: string;
    readonly gutter: string;
    readonly gutterCondensed: string;
    readonly measure: string;
  };
  readonly type: {
    readonly fontFamily: Readonly<Record<"body" | "mono" | "prose", string>>;
    readonly fontWeight: Readonly<Record<string, string>>;
    readonly scale: Readonly<Record<string, TypeStyle>>;
  };
  readonly motion: {
    readonly easing: Readonly<Record<string, string>>;
    readonly duration: Readonly<Record<string, string>>;
  };
  readonly shadow: Readonly<Record<string, Dual>>;
}

export const tokens = raw as unknown as TokensManifest;

/** Group the flat role list into the surfaces / borders / text / … buckets. */
export const roleGroups = [
  { title: "Surfaces", pattern: /^(background|layer|field)/ },
  { title: "Borders", pattern: /^border/ },
  { title: "Text", pattern: /^text/ },
  { title: "Icons", pattern: /^icon/ },
  { title: "Interactive", pattern: /^(interactive|link|focus)/ },
  { title: "Support", pattern: /^support/ },
  { title: "Highlight & overlay", pattern: /^(highlight|overlay)/ },
] as const;

export interface RoleTokenRow {
  readonly name: string;
  readonly kind: RoleKind;
  readonly desc: string;
  readonly mcrn: string;
  readonly earth: string;
}

export function rolesForGroup(pattern: RegExp): readonly RoleTokenRow[] {
  return Object.entries(tokens.roles.meta)
    .filter(([name]) => pattern.test(name))
    .map(([name, meta]) => ({
      name,
      kind: meta.kind,
      desc: meta.desc,
      mcrn: tokens.roles.mcrn[name] ?? "",
      earth: tokens.roles.earth[name] ?? "",
    }));
}

/** Type-scale entries in the order the source defines them (code → display). */
export function typeEntries(): readonly [string, TypeStyle][] {
  return Object.entries(tokens.type.scale);
}

/**
 * Spacing entries in ascending numeric order (the JSON hash order isn't
 * useful — `10..13` come first because of string sort in the build).
 */
export interface SpacingRow {
  readonly rem: string;
  readonly px: number;
}

export function spacingEntries(): readonly (readonly [string, SpacingRow])[] {
  return Object.entries(tokens.spacing)
    .map(([key, rem]) => [key, { rem, px: parseFloat(rem) * 16 }] as const)
    .sort((a, b) => a[1].px - b[1].px);
}
