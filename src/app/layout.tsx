import type { Metadata } from 'next';
import fs from 'node:fs';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import Image from 'next/image';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'KickLab – Modern Sneaker Shop',
  description: 'KickLab: Fresh kicks, bold style, slick experience.',
  metadataBase: new URL('http://localhost:3000'),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const logoCandidates = [
    'public/images/kicklab-logo.svg',
    'public/images/kicklab-logo.webp',
    'public/images/kicklab-logo.png',
    'public/kicklab-logo.svg',
    'public/kicklab-logo.png',
  ];
  const found = logoCandidates.find((p) => fs.existsSync(p));
  const logoSrc = found ? found.replace(/^public/, '') : '/logo.svg';
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-app text-zinc-900 dark:text-zinc-100`}>
        <header className="hidden sm:block sticky top-0 z-40 backdrop-blur surface/70 border-b border-token">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <Image src={logoSrc} alt="KickLab logo" width={40} height={40} priority />
              <span className="text-xl font-semibold tracking-tight group-hover:opacity-90">KickLab</span>
            </Link>
            <nav className="flex items-center gap-6 text-sm">
              <Link className="link-underline" href="/">Home</Link>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="border-t border-token mt-16">
          <div className="max-w-6xl mx-auto px-4 py-10 text-sm text-muted flex items-center justify-between">
            <span>© {new Date().getFullYear()} KickLab</span>
            <span className="opacity-70">Built with Next.js</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
