'use client';

import React from 'react';
import TimetableEditor from '@/components/TimetableEditor';
import { useSession } from 'next-auth/react';
import { Loader2 } from 'lucide-react';

export default function TimetablePage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const orgId = session.user.orgId || (session.user as any).organization?.id;
  const orgName = (session.user as any).organization?.name || '';

  return <TimetableEditor orgId={orgId || ''} orgName={orgName} />;
}
