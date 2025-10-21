import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";
import { LandingPage } from "./components/pages/LandingPage";
import { LoginPage } from "./components/auth/LoginPage";
import { RegisterPage } from "./components/auth/RegisterPage";
import { PrivacyPolicyPage } from "./components/pages/PrivacyPolicyPage";
import { AboutPage } from "./components/pages/AboutPage";
import { CoursesPage } from "./components/course/CoursesPage";
import { CourseCreationPage } from "./components/course/CourseCreationPage";
import { StudentDashboard } from "./components/dashboard/StudentDashboard";
import { MyCoursesPage } from "./components/course/MyCoursesPage";
import { CalendarPage } from "./components/pages/CalendarPage";
import { ClassTimetablePage } from "./components/class-management/ClassTimetablePage";
import { InstructorDashboard } from "./components/dashboard/InstructorDashboard";
import { AdminDashboard } from "./components/AdminDashboard";
import { CourseDetailPage } from "./components/course/CourseDetailPage";
import { LessonViewer } from "./components/course/LessonViewer";
import { UserProfilePage } from "./components/dashboard/UserProfilePage";
import { WishlistPage } from "./components/common/WishlistPage";
import { ContactPage } from "./components/pages/ContactPage";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { useNetworkStatus, OfflineNotification } from "./hooks/useNetworkStatus";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import { AuthErrorBoundary } from "./components/auth/AuthErrorBoundary";
import { CourseErrorBoundary } from "./components/course/CourseErrorBoundary";
import { PaymentErrorBoundary } from "./components/common/PaymentErrorBoundary";
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
    console.log('App.tsx - useEffect - user:', user);
    console.log('App.tsx - useEffect - pathname:', location.pathname);
    console.log('App.tsx - useEffect - user role:', user?.role);
    
    if (user && (location.pathname === '/login' || location.pathname === '/register')) {
      // Redirect based on user role
      if (user.role === 'admin') {
        console.log('App.tsx - Redirecting admin to /admin-dashboard');
        navigate('/admin-dashboard');
      } else if (user.role === 'instructor') {
        console.log('App.tsx - Redirecting instructor to /instructor-dashboard');
        navigate('/instructor-dashboard');
      } else {
        console.log('App.tsx - Redirecting student to /my-courses');
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
          <AuthErrorBoundary onRetry={() => window.location.reload()}>
            <LoginPage
              onNavigate={handleNavigate}
              onLogin={handleLogin}
            />
          </AuthErrorBoundary>
        }
      />
      <Route
        path="/register"
        element={
          <AuthErrorBoundary onRetry={() => window.location.reload()}>
            <RegisterPage
              onNavigate={handleNavigate}
              onRegister={handleRegister}
            />
          </AuthErrorBoundary>
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
          <CourseErrorBoundary onRetry={() => window.location.reload()} onGoBack={() => navigate('/')}>
            <CoursesPage
              onNavigate={handleNavigate}
              onLogout={handleLogout}
            />
          </CourseErrorBoundary>
        }
      />
      <Route
        path="/create-course"
        element={
          <ProtectedRoute requiredRole="admin">
            <CourseCreationPage
              onNavigate={handleNavigate}
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/course/:courseId"
        element={
          <CourseErrorBoundary onRetry={() => window.location.reload()} onGoBack={() => navigate('/courses')}>
            <CourseDetailPage
              onNavigate={handleNavigate}
              onLogout={handleLogout}
            />
          </CourseErrorBoundary>
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
          <CourseErrorBoundary onRetry={() => window.location.reload()} onGoBack={() => navigate('/dashboard')}>
            <MyCoursesPage
              onNavigate={handleNavigate}
            />
          </CourseErrorBoundary>
        }
      />
      <Route
        path="/calendar"
        element={
          <CalendarPage
            onNavigate={handleNavigate}
          />
        }
      />
      <Route
        path="/timetable"
        element={
          <ProtectedRoute>
            <ClassTimetablePage
              onNavigate={handleNavigate}
            />
          </ProtectedRoute>
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