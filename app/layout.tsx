import type {Metadata} from 'next';
import { Space_Grotesk } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import ClientSessionProvider from '@/components/ClientSessionProvider';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
});

export const metadata: Metadata = {
  title: 'RFID Attendance SaaS | Craft Innovations',
  description: 'Enterprise RFID Attendance Management System by Craft Innovations',
};

export default async function RootLayout({children}: {children: React.ReactNode}) {
  const session = await getServerSession(authOptions);
  
  return (
    <html lang="en" className={spaceGrotesk.variable} suppressHydrationWarning>
      <body suppressHydrationWarning className="font-sans">
        <ClientSessionProvider session={session}>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ClientSessionProvider>
      </body>
    </html>
  );
}
