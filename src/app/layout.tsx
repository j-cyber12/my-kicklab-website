import type { Metadata } from 'next';
import { Geist, Geist_Mono, Playfair_Display, Montserrat } from 'next/font/google';
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

const montserrat = Montserrat({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
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
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Google tag (gtag.js) */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-7PW0XLZP9Q"></script>
        <script>
          {`
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-7PW0XLZP9Q');
          `}
        </script>
        {/* Meta Pixel Code */}
        <script
          dangerouslySetInnerHTML={{
            __html: `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '673272498904172');
fbq('track', 'PageView');`,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=673272498904172&ev=PageView&noscript=1"
          />
        </noscript>
        {/* End Meta Pixel Code */}
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} ${montserrat.variable} antialiased bg-app text-zinc-900 dark:text-zinc-100`}>
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
