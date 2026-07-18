import type { Metadata } from "next";
import { Fraunces, Inter, Newsreader } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { ConditionalFooter } from "@/components/layout/ConditionalFooter";
import { getCurrentUser } from "@/lib/auth/session";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Faith Fables Stories — Stories That Inspire the Heart",
    template: "%s · Faith Fables Stories",
  },
  description:
    "Discover stories, books, and ideas that help you learn, grow, and become a better version of yourself.",
};

// Set the theme class before paint to avoid a flash of the wrong theme.
const themeScript = `(function(){try{var t=localStorage.getItem('theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})();`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${fraunces.variable} ${newsreader.variable} h-full`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
        >
          Skip to content
        </a>
        <Navbar
          user={user ? { name: user.name, role: user.role } : null}
        />
        <main id="main" className="flex-1">
          {children}
        </main>
        <ConditionalFooter />
      </body>
    </html>
  );
}
