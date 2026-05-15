import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Montana Fishing Regulation Comments — 2027–2028 Scoping',
  description:
    'Understand FWP\'s 41 proposed regulation changes and submit your public comment before May 31, 2026. AI-assisted drafting for Montana anglers.',
  openGraph: {
    title: 'Montana Fishing Regulation Comments',
    description: 'Make your voice heard on the 2027–2028 Montana fishing regulations. Comment deadline: May 31, 2026.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
