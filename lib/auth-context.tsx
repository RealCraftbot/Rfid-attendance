'use client';

import React, { createContext, useContext, useState } from 'react';
import { useSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from 'next-auth/react';

interface Organization {
  id: string;
  name: string;
  slug: string;
  email: string;
  status: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'TEACHER' | 'PARENT' | null;
  orgId: string | null;
  organization?: Organization | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  organization: Organization | null;
  role: User['role'];
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  organization: null,
  role: null,
  signIn: async () => ({}),
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  
  const user = session?.user ? (session.user as unknown as User) : null;
  const isLoading = status === 'loading';

  const signIn = async (email: string, password: string) => {
    try {
      return nextAuthSignIn('credentials', { email, password, redirect: false });
    } catch (e) {
      return { error: 'Auth not configured' };
    }
  };

  const signOut = async () => {
    try {
      await nextAuthSignOut({ redirect: false });
    } catch (e) {
      // Ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading: isLoading || loading,
        organization: user?.organization || null,
        role: user?.role || null,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);