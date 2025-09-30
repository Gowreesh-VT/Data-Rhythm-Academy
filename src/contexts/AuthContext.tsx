import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { authHelpers, dbHelpers } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, additionalData?: any) => Promise<{ data: any; error: any }>;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signInWithOAuth: (provider: 'google' | 'github') => Promise<{ data: any; error: any }>;
  signOut: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ data: any; error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authHelpers.onAuthStateChange(async (user) => {
      if (user) {
        // Check if user profile exists, if not create one
        const { data, error } = await dbHelpers.getUserProfile(user.uid);
        if (!data && !error) {
          // Create user profile if it doesn't exist
          await dbHelpers.createUserProfile(user.uid, {
            email: user.email,
            name: user.displayName || '',
            photoURL: user.photoURL || '',
            provider: user.providerData[0]?.providerId || 'email'
          });
        }
      }
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    loading,
    signUp: authHelpers.signUp,
    signIn: authHelpers.signIn,
    signInWithOAuth: authHelpers.signInWithOAuth,
    signOut: authHelpers.signOut,
    resetPassword: authHelpers.resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
