import type { Metadata } from "next";
import {
  Bodoni_Moda,
  Spectral,
  Barlow_Semi_Condensed,
  Noto_Serif_Devanagari,
  Noto_Serif_Bengali,
  Noto_Serif_Tamil,
} from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";

// Display: theatrical Didone, used big and sparingly.
const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  variable: "--font-bodoni",
  display: "swap",
});
// Reading: a calm literary text serif for the lines themselves.
const spectral = Spectral({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-spectral",
  display: "swap",
});
// Label: playbill cast-list voice for speaker names, eyebrows, buttons.
const barlow = Barlow_Semi_Condensed({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-barlow",
  display: "swap",
});
// Indian scripts for translations. Devanagari covers the largest cluster
// (Hindi, Marathi, Sanskrit, Nepali, Konkani, Maithili, Dogri, Bodo).
const notoDeva = Noto_Serif_Devanagari({
  subsets: ["devanagari", "latin"],
  variable: "--font-noto-deva",
  display: "swap",
});
const notoBeng = Noto_Serif_Bengali({
  subsets: ["bengali", "latin"],
  variable: "--font-noto-beng",
  display: "swap",
});
const notoTaml = Noto_Serif_Tamil({
  subsets: ["tamil", "latin"],
  variable: "--font-noto-taml",
  display: "swap",
});

const fontVars = [
  bodoni.variable,
  spectral.variable,
  barlow.variable,
  notoDeva.variable,
  notoBeng.variable,
  notoTaml.variable,
].join(" ");

export const metadata: Metadata = {
  title: {
    default: "Shakespeare for Bharat",
    template: "%s · Shakespeare for Bharat",
  },
  description:
    "Read the complete plays of William Shakespeare and hear any speech performed in 22 Indian languages, powered by Sarvam AI.",
};

// Set the theme before paint to avoid a flash of the wrong colour scheme.
const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark');}}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={fontVars}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="stage min-h-screen">
        <SiteHeader />
        <main>{children}</main>
        <footer className="mt-24 border-t border-[var(--border)] py-10 text-center">
          <p className="label text-xs uppercase tracking-[0.2em] text-[var(--fg-soft)]">
            A public-domain reading room
          </p>
          <p className="mt-2 text-sm text-[var(--fg-soft)]">
            Texts from MIT&apos;s Complete Works of Shakespeare · Translation
            &amp; performance by{" "}
            <a
              href="https://www.sarvam.ai"
              className="text-[var(--accent)] underline decoration-dotted underline-offset-4 transition-colors duration-200 hover:text-[var(--accent-2)]"
              target="_blank"
              rel="noreferrer"
            >
              Sarvam AI
            </a>
          </p>
        </footer>
      </body>
    </html>
  );
}
