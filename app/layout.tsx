import type {Metadata} from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import ClientSessionProvider from '@/components/ClientSessionProvider';

export const metadata: Metadata = {
  title: 'RFID Attendance SaaS | Craft Innovations',
  description: 'Enterprise RFID Attendance Management System by Craft Innovations',
};

export default async function RootLayout({children}: {children: React.ReactNode}) {
  const session = await getServerSession(authOptions);
  
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://api.fontshare.com/v2/css?f[]=clash-grotesk@400,500,600,700&display=swap" rel="stylesheet" />
      </head>
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
