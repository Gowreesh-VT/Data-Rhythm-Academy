import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";
import { LandingPage } from "./components/LandingPage";
import { LoginPage } from "./components/LoginPage";
import { RegisterPage } from "./components/RegisterPage";
import { PrivacyPolicyPage } from "./components/PrivacyPolicyPage";
import { AboutPage } from "./components/AboutPage";
import { CoursesPage } from "./components/CoursesPage";
import { StudentDashboard } from "./components/StudentDashboard";
import { MyCoursesPage } from "./components/MyCoursesPage";
import { InstructorDashboard } from "./components/InstructorDashboard";
import { AdminDashboard } from "./components/AdminDashboard";
import { CourseDetailPage } from "./components/CourseDetailPage";
import { LessonViewer } from "./components/LessonViewer";
import { UserProfilePage } from "./components/UserProfilePage";
import { WishlistPage } from "./components/WishlistPage";
import { ContactPage } from "./components/ContactPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useNetworkStatus, OfflineNotification } from "./hooks/useNetworkStatus";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { useAnalytics, useSessionTracking } from "./hooks/useAnalytics";

function AppContent() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { isOnline, isSlowConnection } = useNetworkStatus();
  
  // Initialize analytics tracking
  useAnalytics();
  useSessionTracking();

  // Add swipe gesture support for mobile devices
  useEffect(() => {
    let startX = 0;
    let startY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!startX || !startY) return;

      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      
      const diffX = startX - endX;
      const diffY = startY - endY;

      // Only trigger swipe if horizontal movement is greater than vertical
      if (Math.abs(diffX) > Math.abs(diffY)) {
        // Swipe left (go back) - minimum 50px swipe distance
        if (diffX > 50) {
          // Only go back if there's history
          if (window.history.length > 1) {
            navigate(-1);
          }
        }
        // Swipe right (go forward) - minimum 50px swipe distance
        else if (diffX < -50) {
          navigate(1);
        }
      }

      // Reset start positions
      startX = 0;
      startY = 0;
    };

    // Add touch event listeners
    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);

    // Cleanup event listeners
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [navigate]);

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const handleLogin = (userData: any) => {
    // Navigation will be handled by auth state change
    // Removed hardcoded booking redirect
  };

  const handleRegister = (userData: any) => {
    // Navigation will be handled by auth state change  
    // Removed hardcoded booking redirect
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  // Auto-redirect authenticated users from login/register pages to appropriate dashboard
  useEffect(() => {
    if (user && (location.pathname === '/login' || location.pathname === '/register')) {
      // Redirect based on user role
      if (user.role === 'admin') {
        navigate('/admin-dashboard');
      } else if (user.role === 'instructor') {
        navigate('/instructor-dashboard');
      } else {
        navigate('/my-courses'); // Default to student dashboard
      }
    }
  }, [user, location.pathname, navigate]);

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

  return (
    <>
      <OfflineNotification isOnline={isOnline} isSlowConnection={isSlowConnection} />
      <Routes>
      <Route
        path="/"
        element={
          <LandingPage
            onNavigate={handleNavigate}
            user={user}
            onLogout={handleLogout}
          />
        }
      />
      <Route
        path="/login"
        element={
          <LoginPage
            onNavigate={handleNavigate}
            onLogin={handleLogin}
          />
        }
      />
      <Route
        path="/register"
        element={
          <RegisterPage
            onNavigate={handleNavigate}
            onRegister={handleRegister}
          />
        }
      />
      <Route
        path="/privacy"
        element={
          <PrivacyPolicyPage
            onNavigate={handleNavigate}
          />
        }
      />
      <Route
        path="/about"
        element={
          <AboutPage
            onNavigate={handleNavigate}
          />
        }
      />
      <Route
        path="/courses"
        element={
          <CoursesPage
            onNavigate={handleNavigate}
            onLogout={handleLogout}
          />
        }
      />
      <Route
        path="/course/:courseId"
        element={
          <CourseDetailPage
            onNavigate={handleNavigate}
            onLogout={handleLogout}
          />
        }
      />
      <Route
        path="/lesson/:lessonId"
        element={
          <LessonViewer
            onNavigate={handleNavigate}
            onLogout={handleLogout}
          />
        }
      />
      <Route
        path="/my-courses"
        element={
          <MyCoursesPage
            onNavigate={handleNavigate}
          />
        }
      />
      <Route
        path="/instructor-dashboard"
        element={
          <InstructorDashboard
            onNavigate={handleNavigate}
            onLogout={handleLogout}
          />
        }
      />
      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard
              onNavigate={handleNavigate}
              onLogout={handleLogout}
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <UserProfilePage
            onNavigate={handleNavigate}
            onLogout={handleLogout}
          />
        }
      />
      <Route
        path="/wishlist"
        element={
          <WishlistPage
            onNavigate={handleNavigate}
          />
        }
      />
      <Route
        path="/contact"
        element={
          <ContactPage
            onNavigate={handleNavigate}
          />
        }
      />
    </Routes>
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}