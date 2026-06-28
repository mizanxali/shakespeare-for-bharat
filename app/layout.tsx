import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: {
    default: "Shakespeare for Bharat",
    template: "%s · Shakespeare for Bharat",
  },
  description:
    "Read the complete plays of William Shakespeare and translate or listen to any speech in Indian languages, powered by Sarvam AI.",
};

// Set the theme before paint to avoid a flash of the wrong colour scheme.
const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark');}}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="paper min-h-screen">
        <SiteHeader />
        <main>{children}</main>
        <footer className="mt-20 border-t border-[var(--border)] py-8 text-center text-sm text-[var(--fg-soft)]">
          <p>
            Texts from MIT&apos;s public-domain Complete Works of Shakespeare ·
            Translation &amp; speech by{" "}
            <a
              href="https://www.sarvam.ai"
              className="underline decoration-dotted underline-offset-4 hover:text-[var(--accent)]"
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
