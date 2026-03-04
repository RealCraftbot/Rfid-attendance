'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  organization: any | null;
  role: 'admin' | 'super-admin' | 'teacher' | 'parent' | null;
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
  const [role, setRole] = useState<'admin' | 'super-admin' | 'teacher' | 'parent' | null>(null);

  useEffect(() => {
    if (!auth || !db) {
      const timer = setTimeout(() => setLoading(false), 0);
      return () => clearTimeout(timer);
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // 1. Check if user is a Super Admin or has a specific role in users collection
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setRole(userData.role);
          
          if (userData.org_id) {
            const orgRef = doc(db, 'organizations', userData.org_id);
            const orgSnap = await getDoc(orgRef);
            if (orgSnap.exists()) {
              setOrganization({ id: orgSnap.id, ...orgSnap.data() });
            }
          }
        } else {
          // 2. Check for Organization Admin (legacy check or if not in users collection)
          const orgRef = doc(db, 'organizations', user.uid);
          const orgSnap = await getDoc(orgRef);
          if (orgSnap.exists()) {
            setRole('admin');
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
