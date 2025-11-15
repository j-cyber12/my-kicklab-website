import type { Metadata } from 'next';
import Script from 'next/script';
import { Geist, Geist_Mono, Playfair_Display, Montserrat } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  weight: ['400', '700', '900'],
});

const montserrat = Montserrat({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: { default: 'Luvré — Maison de Sneakers', template: '%s | Luvré' },
  description: 'Luvré combines couture craftsmanship with street-ready sneaker energy in one polished storefront.',
  metadataBase: new URL('http://localhost:3000'),
  openGraph: {
    title: 'Luvré — Maison de Sneakers',
    description: 'Couture-crafted sneakers delivered with a sleek browsing experience.',
    url: 'http://localhost:3000',
    siteName: 'Luvré',
    images: ['/logo.svg'],
    type: 'website',
  },
  icons: {
    icon: '/logo.svg',
    shortcut: '/logo.svg',
    apple: '/logo.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const socialLinks = [
    {
      name: "Instagram",
      href: "https://www.instagram.com/luvre.lb?igsh=MXRrZ3liMzV2OG5sNg==",
      className: "instagram",
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 fill-current">
          <rect x="4" y="4" width="16" height="16" rx="5" />
          <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="17" cy="7" r="1.2" />
        </svg>
      ),
    },
    {
      name: "Facebook",
      href: "https://www.facebook.com/share/1AGKugdLNW/?mibextid=wwXIfr",
      className: "facebook",
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 fill-current">
          <path d="M13 21v-8h3l.5-4H13V6.5c0-1.1.3-1.85 1.85-1.85H17V1.05A22.32 22.32 0 0013.24 1C10.28 1 8 2.92 8 6.58V9H5v4h3v8h5z" />
        </svg>
      ),
    },
    {
      name: "TikTok",
      href: "https://www.tiktok.com/@luvre.lb?_r=1&_t=ZS-91P9T0bgWie",
      className: "tiktok",
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 fill-current">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
        </svg>
      ),
    },
  ];

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Google tag (gtag.js) */}
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-7PW0XLZP9Q"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-7PW0XLZP9Q');
          `}
        </Script>
        {/* Meta Pixel Code */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '673272498904172');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=673272498904172&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        {/* End Meta Pixel Code */}
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} ${montserrat.variable} antialiased bg-app text-zinc-900 dark:text-zinc-100`}>
        <main>{children}</main>
        <footer className="border-t border-token mt-16 bg-white dark:bg-zinc-900">
          <div className="max-w-6xl mx-auto px-4 py-10 text-sm text-muted flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <span>&copy; {new Date().getFullYear()} LuvrAc</span>
              <div className="flex items-center gap-3">
                {socialLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={link.name}
                    className={`social-btn ${link.className}`}
                  >
                    {link.icon}
                    <span className="sr-only">{link.name}</span>
                  </a>
                ))}
              </div>
            <span className="opacity-70">Built with Next.js</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
