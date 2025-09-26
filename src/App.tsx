import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { LandingPage } from "./components/LandingPage";
import { LoginPage } from "./components/LoginPage";
import { RegisterPage } from "./components/RegisterPage";
import { SlotBookingPage } from "./components/SlotBookingPage";
import { PaymentPage } from "./components/PaymentPage";

export default function App() {
  const [user, setUser] = useState<any>(null);
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
    setUser(userData);
    navigate("/booking");
  };

  const handleRegister = (userData: any) => {
    setUser(userData);
    navigate("/booking");
  };

  const handleLogout = () => {
    setUser(null);
    navigate("/");
  };

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