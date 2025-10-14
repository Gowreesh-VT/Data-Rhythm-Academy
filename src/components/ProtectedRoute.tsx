import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'student' | 'instructor' | 'admin';
  requireAuth?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole,
  requireAuth = true 
}) => {
  const { user, loading } = useAuth();

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if authentication is required but user is not logged in
  if (requireAuth && !user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to login if user doesn't have required role
  if (requiredRole && user?.role !== requiredRole) {
    // Allow admin to access any role-based route (except redirect to appropriate dashboard)
    if (user?.role !== 'admin') {
      // Redirect based on actual user role
      if (user?.role === 'instructor') {
        return <Navigate to="/instructor-dashboard" replace />;
      } else if (user?.role === 'student') {
        return <Navigate to="/my-courses" replace />;
      } else {
        return <Navigate to="/login" replace />;
      }
    }
  }

  // If user is logged in but accessing login/register pages, redirect to appropriate dashboard
  if (user && (window.location.pathname === '/login' || window.location.pathname === '/register')) {
    if (user.role === 'admin') {
      return <Navigate to="/admin-dashboard" replace />;
    } else if (user.role === 'instructor') {
      return <Navigate to="/instructor-dashboard" replace />;
    } else {
      return <Navigate to="/my-courses" replace />;
    }
  }

  return <>{children}</>;
};