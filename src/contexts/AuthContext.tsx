import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { authHelpers, dbHelpers } from '../lib/firebase';
import { AppUser, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  userProfile: AppUser | null;
  loading: boolean;
  signUp: (email: string, password: string, additionalData?: any) => Promise<{ data: any; error: any }>;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signInWithOAuth: (provider: 'google' | 'github') => Promise<{ data: any; error: any }>;
  signOut: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ data: any; error: any }>;
  updateUserRole: (userId: string, newRole: UserRole) => Promise<{ success: boolean; error: any }>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUserProfile = async () => {
    if (user) {
      const { data, error } = await dbHelpers.getUserProfile(user.uid);
      if (data && !error) {
        setUserProfile({
          uid: user.uid,
          email: data.email || user.email || '',
          name: data.name || user.displayName || '',
          photoURL: data.photoURL || user.photoURL || '',
          role: data.role || 'student',
          provider: data.provider || 'email',
          createdAt: data.createdAt || new Date(),
          updatedAt: data.updatedAt || new Date()
        });
      }
    } else {
      setUserProfile(null);
    }
  };

  useEffect(() => {
    const unsubscribe = authHelpers.onAuthStateChange(async (user) => {
      setUser(user);
      if (user) {
        // Check if user profile exists, if not create a basic one
        const { data, error } = await dbHelpers.getUserProfile(user.uid);
        if (!data && !error) {
          // Create basic user profile if it doesn't exist (for OAuth users)
          await dbHelpers.createUserProfile(user.uid, {
            email: user.email,
            name: user.displayName || '',
            photoURL: user.photoURL || '',
            provider: user.providerData[0]?.providerId || 'email',
            role: 'student' // Default role
          });
        }
        await refreshUserProfile();
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    // Only super admin can change roles
    if (userProfile?.role !== 'super_admin') {
      return { success: false, error: 'Unauthorized: Only super admin can change user roles' };
    }
    
    const result = await dbHelpers.updateUserRole(userId, newRole);
    
    // If updating current user's role, refresh profile
    if (userId === user?.uid) {
      await refreshUserProfile();
    }
    
    return result;
  };

  const value = {
    user,
    userProfile,
    loading,
    signUp: authHelpers.signUp,
    signIn: authHelpers.signIn,
    signInWithOAuth: authHelpers.signInWithOAuth,
    signOut: authHelpers.signOut,
    resetPassword: authHelpers.resetPassword,
    updateUserRole,
    refreshUserProfile
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
