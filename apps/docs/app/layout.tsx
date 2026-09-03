import type { Metadata } from "next";
import "./globals.css";
import { fontVariables } from "@tyandor/fonts/next";
import { SiteFooter } from "../components/site-footer";
import { SiteNav } from "../components/site-nav";
import { ThemeProvider, themeInitScript } from "../components/theme-provider";

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
        */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
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
