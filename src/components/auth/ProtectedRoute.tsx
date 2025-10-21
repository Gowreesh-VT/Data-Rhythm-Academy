import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

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

  // Debug logging
  console.log('ProtectedRoute - user:', user);
  console.log('ProtectedRoute - requiredRole:', requiredRole);
  console.log('ProtectedRoute - user role:', user?.role);

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
    console.log('ProtectedRoute - Redirecting to login: no user');
    return <Navigate to="/login" replace />;
  }

  // Redirect to login if user doesn't have required role
  if (requiredRole && user?.role !== requiredRole) {
    console.log('ProtectedRoute - Role mismatch:', user?.role, '!==', requiredRole);
    // Allow admin to access any role-based route (except redirect to appropriate dashboard)
    if (user?.role !== 'admin') {
      // Redirect based on actual user role
      if (user?.role === 'instructor') {
        console.log('ProtectedRoute - Redirecting instructor to dashboard');
        return <Navigate to="/instructor-dashboard" replace />;
      } else if (user?.role === 'student') {
        console.log('ProtectedRoute - Redirecting student to my-courses');
        return <Navigate to="/my-courses" replace />;
      } else {
        console.log('ProtectedRoute - Unknown role, redirecting to login');
        return <Navigate to="/login" replace />;
      }
    } else {
      console.log('ProtectedRoute - Admin accessing different role route, allowing');
    }
  }

  // If user is logged in but accessing login/register pages, redirect to appropriate dashboard
  if (user && (window.location.pathname === '/login' || window.location.pathname === '/register')) {
    console.log('ProtectedRoute - Logged in user on login page, redirecting based on role');
    if (user.role === 'admin') {
      return <Navigate to="/admin-dashboard" replace />;
    } else if (user.role === 'instructor') {
      return <Navigate to="/instructor-dashboard" replace />;
    } else {
      return <Navigate to="/my-courses" replace />;
    }
  }

  console.log('ProtectedRoute - All checks passed, rendering children');
  return <>{children}</>;
};