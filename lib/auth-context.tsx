'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function checkSession() {
      try {
        const { useSession, signIn: nextAuthSignIn, signOut: nextAuthSignOut } = await import('next-auth/react');
        const { data: session } = useSession();
        if (session?.user) {
          setUser(session.user as unknown as User);
        }
      } catch (e) {
        console.log('NextAuth not configured');
      } finally {
        setLoading(false);
      }
    }
    checkSession();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { signIn: nextAuthSignIn } = await import('next-auth/react');
      return nextAuthSignIn('credentials', { email, password, redirect: false });
    } catch (e) {
      return { error: 'Auth not configured' };
    }
  };

  const signOut = async () => {
    try {
      const { signOut: nextAuthSignOut } = await import('next-auth/react');
      await nextAuthSignOut({ redirect: false });
    } catch (e) {
      // Ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
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
