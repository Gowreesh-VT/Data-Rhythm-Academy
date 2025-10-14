import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { User } from '../types';
import { authHelpers, dbHelpers } from '../lib/firebase';
import { trackUserLogin, trackUserSignup, trackUserLogout } from '../lib/analytics';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signUp: (email: string, password: string, additionalData?: any) => Promise<{ data: any; error: any }>;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signInWithOAuth: (provider: 'google' | 'github') => Promise<{ data: any; error: any }>;
  signOut: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ data: any; error: any }>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  const createDefaultUserProfile = (firebaseUser: FirebaseUser): User => {
    return {
      id: firebaseUser.uid,
      email: firebaseUser.email || '',
      displayName: firebaseUser.displayName || '',
      photoURL: firebaseUser.photoURL || undefined,
      role: 'student',
      enrolledCourses: [],
      createdCourses: [],
      createdAt: new Date(),
      lastLoginAt: new Date(),
      profileStatus: 'active',
      assignedStudents: [],
      assignedInstructors: []
    };
  };

  const refreshUserProfile = async () => {
    if (!firebaseUser) return;
    
    try {
      const { data, error } = await dbHelpers.getUserProfile(firebaseUser.uid);
      if (data && !error) {
        setUser(data as User);
      } else {
        // If no profile exists, create a default one
        const defaultProfile = createDefaultUserProfile(firebaseUser);
        await dbHelpers.createUserProfile(firebaseUser.uid, defaultProfile);
        setUser(defaultProfile);
      }
    } catch (error) {
      console.error('Error refreshing user profile:', error);
      // Fallback to default profile
      setUser(createDefaultUserProfile(firebaseUser));
    }
  };

  useEffect(() => {
    const unsubscribe = authHelpers.onAuthStateChange(async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          // Check if user profile exists, if not create one
          const { data, error } = await dbHelpers.getUserProfile(firebaseUser.uid);
          
          if (data && !error) {
            // Update last login time
            const updatedUser = {
              ...data,
              lastLoginAt: new Date()
            } as User;
            await dbHelpers.updateUserProfile(firebaseUser.uid, { lastLoginAt: new Date() });
            setUser(updatedUser);
          } else {
            // Create user profile if it doesn't exist
            const newUserProfile = createDefaultUserProfile(firebaseUser);
            await dbHelpers.createUserProfile(firebaseUser.uid, newUserProfile);
            setUser(newUserProfile);
          }
        } catch (error) {
          console.error('Error handling auth state change:', error);
          // Fallback to default profile
          setUser(createDefaultUserProfile(firebaseUser));
        }
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Analytics-enabled auth functions
  const signUpWithAnalytics = async (email: string, password: string, additionalData?: any) => {
    const result = await authHelpers.signUp(email, password, additionalData);
    if (result.data && !result.error) {
      trackUserSignup('email');
    }
    return result;
  };

  const signInWithAnalytics = async (email: string, password: string) => {
    const result = await authHelpers.signIn(email, password);
    if (result.data && !result.error) {
      trackUserLogin('email');
    }
    return result;
  };

  const signInWithOAuthAnalytics = async (provider: 'google' | 'github') => {
    const result = await authHelpers.signInWithOAuth(provider);
    if (result.data && !result.error) {
      trackUserLogin(provider);
    }
    return result;
  };

  const signOutWithAnalytics = async () => {
    const result = await authHelpers.signOut();
    if (!result.error) {
      trackUserLogout();
    }
    return result;
  };

  const value = {
    user,
    firebaseUser,
    loading,
    signUp: signUpWithAnalytics,
    signIn: signInWithAnalytics,
    signInWithOAuth: signInWithOAuthAnalytics,
    signOut: signOutWithAnalytics,
    resetPassword: authHelpers.resetPassword,
    refreshUserProfile,
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
