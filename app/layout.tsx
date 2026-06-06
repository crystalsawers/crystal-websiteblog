import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import Navbar from './components/Navbar';
import { AuthProvider } from './components/AuthContext';
import ContentWrapper from './components/ContentWrapper';
import { Analytics } from '@vercel/analytics/next';
import Script from 'next/script';

const gaId = process.env.NEXT_PUBLIC_GA_ID;

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});

const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'Log, Lap, and Over',
  description: 'Sport, music, side projects, and everything in between.',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} relative min-h-screen antialiased`}
      >
        <AuthProvider>
          <Navbar />
          <ContentWrapper>{children}</ContentWrapper>

          <Analytics />

          {gaId && (
            <>
              <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
                strategy="afterInteractive"
              />

              <Script id="ga-inline" strategy="afterInteractive">
                {`
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());

                  gtag('config', '${gaId}');
                `}
              </Script>
            </>
          )}
        </AuthProvider>
      </body>
    </html>
  );
}
