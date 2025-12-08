// src/App.js
import React, { useEffect, useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";

import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import AssetsPage from "./pages/AssetsPage";
import AddAssetPage from "./pages/AddAssetPage";
import DashboardPage from "./pages/DashboardPage";
import GitHubSearchPage from "./pages/GitHubSearchPage";
import LoginPage from "./pages/LoginPage";
import ContactPage from "./pages/ContactPage";

import content from "./data/content.json";
import { loginApi, registerApi, meApi } from "./services/auth-Api";


const App = () => {
  const [currentPage, setCurrentPage] = useState("home");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // wait while we check token
  const [assets, setAssets] = useState(content.initialAssets || []);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  // 1) On first load, check if there is an accessToken and fetch /auth/me
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("accessToken");
      const storedUser = localStorage.getItem("user");

      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        // optional: trust stored user first, then verify from backend
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
        const res = await meApi();
        setUser(res.data.user);
        localStorage.setItem("user", JSON.stringify(res.data.user));
      } catch (err) {
        console.error("Auth init failed:", err);
        // token might be invalid/expired
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // 2) Theme Handler
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // 3) Login / Signup handler (backend-based)
  const handleAuth = async ({ mode, email, password, name }) => {
    // mode: 'login' | 'signup'
    // For signup, we first register, then login to get tokens.
    if (mode === "signup") {
      await registerApi({ name, email, password });
    }

    const res = await loginApi({ email, password });
    const { accessToken, refreshToken, user } = res.data;

    // Save tokens + user to state and localStorage
    setUser(user);
    localStorage.setItem("accessToken", accessToken);
    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }
    localStorage.setItem("user", JSON.stringify(user));

    // Redirect to dashboard (or wherever)
    setCurrentPage("dashboard");
  };

  // 4) Logout (clear tokens + user)
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setCurrentPage("login");
  };

  const handleAddAsset = (newAsset) =>
    setAssets((prev) => [...prev, newAsset]);

  // 5) Show loading screen while checking token
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return (
          <HomePage setCurrentPage={setCurrentPage} content={content} />
        );
      case "about":
        return <AboutPage content={content} />;

      // PROTECTED ROUTES: Only show if 'user' exists, otherwise show LoginPage
       case "assets":
        return user ? (
          <AssetsPage
            user={user}
            setCurrentPage={setCurrentPage}
          />
        ) : (
          <LoginPage onAuth={handleAuth} />
        );

      case "add-asset":
        // Only admin can add assets (client-side check)
        if (!user) return <LoginPage onAuth={handleAuth} />;
        if (user.role !== "admin") {
          return (
            <DashboardPage
              assets={assets}
              user={user}
            />
          );
        }
        return (
          <AddAssetPage
            user={user}
            setCurrentPage={setCurrentPage}
          />
        );
      case "dashboard":
      return user ? (
        <DashboardPage user={user} setCurrentPage={setCurrentPage} />
      ) : (
        <LoginPage onAuth={handleAuth} />
      );

      case "github":
        return <GitHubSearchPage />;
      case "login":
        return <LoginPage onAuth={handleAuth} />;
      case "contact":
        return <ContactPage />;
      default:
        return (
          <HomePage setCurrentPage={setCurrentPage} content={content} />
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans">
      {/* Hide Header on Login page */}
      {currentPage !== "login" && (
        <Header
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          user={user}
          logout={handleLogout}
        />
      )}

      <main className="flex-grow">{renderPage()}</main>

      {/* Hide Footer on Login page */}
      {currentPage !== "login" && <Footer />}
    </div>
  );
};

export default App;
