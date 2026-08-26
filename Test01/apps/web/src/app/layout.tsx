import type { Metadata } from 'next';
import { Fraunces, Inter, JetBrains_Mono } from 'next/font/google';
import { ThemeProvider } from '@/lib/theme-provider';
import './globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  weight: ['500', '600', '700'],
  display: 'swap',
});
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const jbmono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jbmono',
  weight: ['500', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Lernplattform Realschulabschluss Sachsen',
  description:
    'Individuelle Vorbereitung auf den Realschulabschluss Sachsen: Wissenslücken erkennen, gezielt lernen, Prüfung simulieren.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body className={`${fraunces.variable} ${inter.variable} ${jbmono.variable} font-sans`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
