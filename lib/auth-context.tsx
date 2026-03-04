'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  organization: any | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  organization: null,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [organization, setOrganization] = useState<any | null>(null);

  useEffect(() => {
    if (!auth || !db) {
      const timer = setTimeout(() => setLoading(false), 0);
      return () => clearTimeout(timer);
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // In a real SaaS, we'd store the user's orgId in their profile or a mapping table
        // For this demo, we'll assume the user's UID is linked to an organization document
        const orgRef = doc(db, 'organizations', user.uid);
        const orgSnap = await getDoc(orgRef);
        if (orgSnap.exists()) {
          setOrganization({ id: orgSnap.id, ...orgSnap.data() });
        }
      } else {
        setOrganization(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, organization }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
