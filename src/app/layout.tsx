import type { Metadata } from 'next';
import { Geist, Geist_Mono, Playfair_Display } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

export const metadata: Metadata = {
  title: 'Luvré — Modern Sneaker Shop',
  description: 'Luvré: Fresh kicks, bold style, slick experience.',
  metadataBase: new URL('http://localhost:3000'),
  icons: {
    icon: '/images/luvre-logo.png',
    shortcut: '/images/luvre-logo.png',
    apple: '/images/luvre-logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} antialiased bg-app text-zinc-900 dark:text-zinc-100`}>
        {/* Header removed: branding now lives in the banner */}
        <main>{children}</main>
        <footer className="border-t border-token mt-16">
          <div className="max-w-6xl mx-auto px-4 py-10 text-sm text-muted flex items-center justify-between">
            <span>© {new Date().getFullYear()} Luvré</span>
            <span className="opacity-70">Built with Next.js</span>
          </div>
        </footer>
      </body>
    </html>
  );
}

