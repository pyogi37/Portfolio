import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { data } from "@/lib/data";
import { AgentProvider } from "@/components/agent/AgentProvider";
import { AgentPanel } from "@/components/agent/AgentPanel";
import { OffDuty } from "@/components/OffDuty";
import { Nav } from "@/components/Nav";
import { ThemeProvider, themeInitScript } from "@/components/ThemeProvider";

/* Self-hosted (OFL). Libre Caslon Text for figure labels and display, Atkinson Hyperlegible for reading, JetBrains Mono for values. */
const caslon = localFont({
  src: [
    { path: "./fonts/LibreCaslonText[wght].ttf", style: "normal", weight: "400 700" },
    { path: "./fonts/LibreCaslonText-Italic[wght].ttf", style: "italic", weight: "400 700" },
  ],
  variable: "--font-caslon",
  display: "swap",
});
const atkinson = localFont({
  src: [
    { path: "./fonts/AtkinsonHyperlegible-Regular.ttf", style: "normal", weight: "400" },
    { path: "./fonts/AtkinsonHyperlegible-Italic.ttf", style: "italic", weight: "400" },
    { path: "./fonts/AtkinsonHyperlegible-Bold.ttf", style: "normal", weight: "700" },
  ],
  variable: "--font-atkinson",
  display: "swap",
});
const jet = localFont({ src: [{ path: "./fonts/JetBrainsMono[wght].ttf", style: "normal", weight: "100 800" }], variable: "--font-jet", display: "swap" });

export const metadata: Metadata = {
  title: `${data.profile.name} | ${data.profile.hero.headline}`,
  description: data.profile.hero.subtext,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${caslon.variable} ${atkinson.variable} ${jet.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <ThemeProvider>
          <AgentProvider>
            <Nav />
            {children}
            <AgentPanel />
            <OffDuty />
          </AgentProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
