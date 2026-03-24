'use client';

import { useSession } from 'next-auth/react';

type Role = 'SUPER_ADMIN' | 'ADMIN' | 'TEACHER' | 'PARENT' | 'BURSAR';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: Role[];
  fallback?: React.ReactNode;
}

export function RoleGuard({ children, allowedRoles, fallback = null }: RoleGuardProps) {
  // Safely call useSession - it might throw during static generation
  let sessionData: any = { data: null, status: 'loading' };
  try {
    sessionData = useSession() || { data: null, status: 'unauthenticated' };
  } catch (e) {
    // useSession might throw during static generation
    sessionData = { data: null, status: 'unauthenticated' };
  }
  
  const { data: session, status } = sessionData;
  const role = session?.user?.role as Role;
  const isLoading = status === 'loading';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!role || !allowedRoles.includes(role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
