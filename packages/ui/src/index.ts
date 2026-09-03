/**
 * @tyandor/ui — themed components for the tyandor design system.
 *
 * Styling ships as plain CSS classes in dist/ui.css, not Tailwind utilities:
 * tyandor-web is on Tailwind 3, new projects are on 4, and utilities would
 * make a component import drag a build-config change along with it. Import
 * "@tyandor/ui/ui.css" once, after "@tyandor/tokens/tokens.css".
 *
 * Only the theme module is a client component. Everything else renders on
 * the server.
 */

// Theme. themeScript is a separate module from the provider on purpose:
// "use client" marks a whole file, and the script has to stay callable from
// a server component so it can be rendered into <head>.
export {
  themeScript,
  DEFAULT_STORAGE_KEY,
  type Theme,
  type ResolvedTheme,
} from "./theme/theme-script.ts";
export {
  ThemeProvider,
  useTheme,
  type ThemeContextValue,
  type ThemeProviderProps,
} from "./theme/theme-provider.tsx";
export { ThemeToggle, type ThemeToggleProps } from "./theme/theme-toggle.tsx";

// Primitives
export {
  Text,
  Heading,
  type TextProps,
  type HeadingProps,
  type HeadingLevel,
  type Tone,
} from "./primitives/text.tsx";
export { Stack, Grid, type StackProps, type GridProps } from "./primitives/stack.tsx";

// Navigation
export {
  Header,
  HeaderBrand,
  HeaderLink,
  type HeaderProps,
  type HeaderBrandProps,
  type HeaderLinkProps,
} from "./navigation/header.tsx";
export { Footer, FooterColumn, type FooterProps, type FooterColumnProps } from "./navigation/footer.tsx";
export { Breadcrumb, type BreadcrumbProps, type Crumb } from "./navigation/breadcrumb.tsx";
export { Pill, type PillProps, type PillLinkProps, type PillButtonProps } from "./navigation/pill.tsx";

// Content
export {
  Card,
  CardTitle,
  CardBody,
  CardFooter,
  type CardProps,
  type CardSlotProps,
} from "./content/card.tsx";
export { Tag, Badge, type TagProps, type TagVariant } from "./content/tag.tsx";
export { Divider, type DividerProps } from "./content/divider.tsx";
export { Quote, type QuoteProps } from "./content/quote.tsx";
export { Prose, type ProseProps } from "./content/prose.tsx";

// Shared
export { cx } from "./internal/cx.ts";
export type { Gap } from "./internal/types.ts";
