import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

// Assign the imported font objects to variables that will be used.
// This pattern is common for Next.js font optimization.
const geistSansFont = GeistSans;
const geistMonoFont = GeistMono;

export const metadata: Metadata = {
  title: 'CabinStay - Your Perfect Getaway',
  description: 'Reserve beautiful cabins for your next vacation.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSansFont.variable} ${geistMonoFont.variable}`}>
      <body className="antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
