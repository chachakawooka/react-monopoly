import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Monopoly Online',
  description: 'Play Monopoly with friends online - UK Classic Edition',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
