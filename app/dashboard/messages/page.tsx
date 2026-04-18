'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ChatWindow from '@/components/messaging/ChatWindow';
import { useEffect } from 'react';

export default function MessagesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-brand-navy mb-6">Messages</h1>
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <p className="text-zinc-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-brand-navy mb-6">Messages</h1>
      <ChatWindow />
    </div>
  );
}