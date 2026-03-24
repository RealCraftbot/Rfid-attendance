'use client';

import { useSession } from 'next-auth/react';

type Role = 'SUPER_ADMIN' | 'ADMIN' | 'TEACHER' | 'PARENT' | 'BURSAR';

interface UseRBACReturn {
  role: Role | null;
  isAdmin: boolean;
  isTeacher: boolean;
  isParent: boolean;
  isBursar: boolean;
  hasRole: (roles: Role[]) => boolean;
  canAccess: (requiredRoles: Role[]) => boolean;
  isLoading: boolean;
}

export function useRBAC(): UseRBACReturn {
  // Safely call useSession - it might be undefined during static generation
  let sessionData: any = { data: null, status: 'loading' };
  
  try {
    sessionData = useSession() || { data: null, status: 'unauthenticated' };
  } catch (e) {
    // useSession might throw during static generation
    sessionData = { data: null, status: 'unauthenticated' };
  }
  
  const { data: session, status } = sessionData;
  const role = (session?.user?.role as Role) || null;
  const isLoading = status === 'loading';

  const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';
  const isTeacher = role === 'TEACHER';
  const isParent = role === 'PARENT';
  const isBursar = role === 'BURSAR';

  const hasRole = (roles: Role[]) => {
    if (!role) return false;
    return roles.includes(role);
  };

  const canAccess = (requiredRoles: Role[]) => {
    if (!role) return false;
    return requiredRoles.includes(role);
  };

  return {
    role,
    isAdmin,
    isTeacher,
    isParent,
    isBursar,
    hasRole,
    canAccess,
    isLoading,
  };
}
