'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  organization: any | null;
  role: 'admin' | 'super-admin' | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  organization: null,
  role: null,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [organization, setOrganization] = useState<any | null>(null);
  const [role, setRole] = useState<'admin' | 'super-admin' | null>(null);

  useEffect(() => {
    if (!auth || !db) {
      const timer = setTimeout(() => setLoading(false), 0);
      return () => clearTimeout(timer);
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // 1. Check if user is a Super Admin
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists() && userSnap.data().role === 'super-admin') {
          setRole('super-admin');
          setOrganization(null); // Super admins don't necessarily belong to one org
        } else {
          // 2. Check for Organization Admin
          setRole('admin');
          const orgRef = doc(db, 'organizations', user.uid);
          const orgSnap = await getDoc(orgRef);
          if (orgSnap.exists()) {
            setOrganization({ id: orgSnap.id, ...orgSnap.data() });
          }
        }
      } else {
        setOrganization(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, organization, role }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
