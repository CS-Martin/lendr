import type { Metadata } from 'next';
import { Geist, Azeret_Mono } from 'next/font/google';
import './globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import { ConvexClientProvider } from '@/providers/convex-client-provider';
import { ClientProviders } from '@/providers/client-providers';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const azeretMono = Azeret_Mono({
  variable: '--font-azeret-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Lendr - A decentralized marketplace',
  description: 'A decentralized marketplace for renting and lending NFTs',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <body className={`${geistSans.variable} ${azeretMono.variable} font-sans`}>
        <ConvexClientProvider>
          <ClientProviders>{children}</ClientProviders>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
