import React, { useState } from "react";
import { LandingPage } from "./components/LandingPage";
import { LoginPage } from "./components/LoginPage";
import { RegisterPage } from "./components/RegisterPage";
import { SlotBookingPage } from "./components/SlotBookingPage";
import { PaymentPage } from "./components/PaymentPage";
import { Page } from "./types";

export default function App() {
  const [currentPage, setCurrentPage] =
    useState<Page>("landing");
  const [user, setUser] = useState<any>(null);

  const navigate = (page: Page) => {
    setCurrentPage(page);
  };

  const handleLogin = (userData: any) => {
    setUser(userData);
    navigate("booking");
  };

  const handleRegister = (userData: any) => {
    setUser(userData);
    navigate("booking");
  };

  const handleLogout = () => {
    setUser(null);
    navigate("landing");
  };

  switch (currentPage) {
    case "landing":
      return (
        <LandingPage
          onNavigate={navigate}
          user={user}
          onLogout={handleLogout}
        />
      );
    case "login":
      return (
        <LoginPage
          onNavigate={navigate}
          onLogin={handleLogin}
        />
      );
    case "register":
      return (
        <RegisterPage
          onNavigate={navigate}
          onRegister={handleRegister}
        />
      );
    case "booking":
      return (
        <SlotBookingPage
          onNavigate={navigate}
          user={user}
          onLogout={handleLogout}
        />
      );
    case "payment":
      return (
        <PaymentPage
          onNavigate={navigate}
          user={user}
          onLogout={handleLogout}
        />
      );
    default:
      return (
        <LandingPage
          onNavigate={navigate}
          user={user}
          onLogout={handleLogout}
        />
      );
  }
}