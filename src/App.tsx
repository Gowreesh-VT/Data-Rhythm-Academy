import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { LandingPage } from "./components/LandingPage";
import { LoginPage } from "./components/LoginPage";
import { RegisterPage } from "./components/RegisterPage";
import { SlotBookingPage } from "./components/SlotBookingPage";
import { PaymentPage } from "./components/PaymentPage";

function AppContent() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
    navigate("/booking");
  };

  const handleRegister = (userData: any) => {
    // Navigation will be handled by auth state change
    navigate("/booking");
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  // Auto-redirect authenticated users from login/register pages
  useEffect(() => {
    if (user && (location.pathname === '/login' || location.pathname === '/register')) {
      navigate('/booking');
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
        path="/booking"
        element={
          <SlotBookingPage
            onNavigate={handleNavigate}
            user={user}
            onLogout={handleLogout}
          />
        }
      />
      <Route
        path="/payment"
        element={
          <PaymentPage
            onNavigate={handleNavigate}
            user={user}
            onLogout={handleLogout}
          />
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}