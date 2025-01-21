import './globals.css';
import { ReactNode } from 'react';

export const metadata = {
  title: 'Ride Finder',
  description: 'Find your rides at low prices',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
