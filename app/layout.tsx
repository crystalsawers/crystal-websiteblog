import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import Navbar from './components/Navbar';
import { AuthProvider } from './components/AuthContext';
import Head from 'next/head';
import ContentWrapper from './components/ContentWrapper';

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
  title: 'Log, Lap, and Over' as const,
  description:
    'Sport, music, side projects, and everything in between.' as const,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <html lang="en">
        <Head>
          <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
          <title>
            {typeof metadata.title === 'string'
              ? metadata.title
              : 'Default Title'}
          </title>
          <meta
            name="description"
            content={
              typeof metadata.description === 'string'
                ? metadata.description
                : 'Default description'
            }
          />
        </Head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} relative min-h-screen antialiased`}
        >
          <Navbar />
          <ContentWrapper>{children}</ContentWrapper>
        </body>
      </html>
    </AuthProvider>
  );
}
