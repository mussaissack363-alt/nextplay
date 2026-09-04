import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-pjs",
  subsets: ["latin"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-serif-inst",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "NextPlay — game releases, your backlog & your next play",
    template: "%s | NextPlay",
  },
  description:
    "See what games are actually releasing, track the ones you'll never finish, and let the quiz find your next obsession.",
};

export const viewport: Viewport = {
  themeColor: "#fbf8f3",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-paper">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-line bg-stone-100/60 py-10">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 sm:flex-row sm:px-8">
            <p className="text-xs text-stone-500">
              <span className="font-bold text-stone-800">NextPlay</span>
              <span className="mx-2">—</span>
              The gamer backlog antidote. Built with zero tracking algorithms.
            </p>
            <div className="flex items-center gap-6 text-xs font-medium text-stone-500">
              <a
                href="https://rawg.io"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-stone-900"
              >
                RAWG API
              </a>
              <span>Privacy</span>
              <span>Discord Community</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
