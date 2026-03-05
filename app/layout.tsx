import type {Metadata} from 'next';
import { Space_Grotesk } from 'next/font/google';
import './globals.css'; // Global styles
import { AuthProvider } from '@/lib/auth-context';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
});

export const metadata: Metadata = {
  title: 'RFID Attendance SaaS | Craft Innovations',
  description: 'Enterprise RFID Attendance Management System by Craft Innovations',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={spaceGrotesk.variable} suppressHydrationWarning>
      <body suppressHydrationWarning className="font-sans">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
