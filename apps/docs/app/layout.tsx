import type { Metadata } from "next";
import "./globals.css";
import { fontVariables } from "@tyandor/fonts/next";
import { SiteFooter } from "../components/site-footer";
import { SiteNav } from "../components/site-nav";
import { ThemeProvider, themeScript } from "@tyandor/ui";

export const metadata: Metadata = {
  title: {
    default: "Tyandor Design",
    template: "%s — Tyandor Design",
  },
  description:
    "The token contract, the Expanse palette, and the iA Writer typefaces every tyandor project shares. Carbon's architecture, MCRN aesthetic.",
  applicationName: "Tyandor Design",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <head>
        {/*
          Sync theme *before* body renders. Reads localStorage and, if the
          user has chosen mcrn or earth explicitly, sets data-theme so the
          first paint already matches their preference. `system` is
          represented by the absence of data-theme — tokens.css handles the
          media-query fallback on its own.

          Shipped by @tyandor/ui rather than written here: the script and
          the provider have to agree on the storage key and on what "system"
          means, and splitting them across packages is how they drift.
        */}
        <script dangerouslySetInnerHTML={{ __html: themeScript() }} />
      </head>
      <body className="min-h-svh bg-background text-text-primary antialiased">
        <ThemeProvider>
          <SiteNav />
          <main>{children}</main>
          <SiteFooter />
        </ThemeProvider>
      </body>
    </html>
  );
}
