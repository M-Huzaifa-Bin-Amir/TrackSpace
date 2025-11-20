import React, { useEffect, useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';

// 1. Firebase Imports
import { auth } from './services/firebase'; 
import { onAuthStateChanged, signOut } from 'firebase/auth';

import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import AssetsPage from './pages/AssetsPage';
import AddAssetPage from './pages/AddAssetPage';
import DashboardPage from './pages/DashboardPage';
import GitHubSearchPage from './pages/GitHubSearchPage';
import LoginPage from './pages/LoginPage';
import ContactPage from './pages/ContactPage';

import content from './data/content.json';

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState(null); // Stores the real Firebase User
  const [loading, setLoading] = useState(true); // Prevents flickering while checking login
  const [assets, setAssets] = useState(content.initialAssets || []);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  // 2. The Real Authentication Listener
  useEffect(() => {
    // This function runs automatically whenever someone logs in or out
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false); // We are done checking
      
      // Optional: Auto-redirect to dashboard if they just logged in
      if (currentUser && currentPage === 'login') {
        setCurrentPage('dashboard');
      }
    });
    return () => unsubscribe(); // Cleanup
  }, [currentPage]);

  // 3. Theme Handler
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // 4. Real Logout Function
  const handleLogout = async () => {
    await signOut(auth);
    setCurrentPage('login');
  };

  const handleAddAsset = (newAsset) => setAssets(prev => [...prev, newAsset]);

  // 5. Show a blank loading screen while Firebase connects
  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <HomePage setCurrentPage={setCurrentPage} content={content} />;
      case 'about': return <AboutPage content={content} />;
      
      // PROTECTED ROUTES: Only show if 'user' exists, otherwise show LoginPage
      case 'assets': return user ? <AssetsPage assets={assets} setCurrentPage={setCurrentPage} /> : <LoginPage />;
      case 'add-asset': return user ? <AddAssetPage setCurrentPage={setCurrentPage} onAddAsset={handleAddAsset} /> : <LoginPage />;
      case 'dashboard': return user ? <DashboardPage assets={assets} user={user} /> : <LoginPage />;
      
      case 'github': return <GitHubSearchPage />;
      case 'login': return <LoginPage />; 
      case 'contact': return <ContactPage />;
      default: return <HomePage setCurrentPage={setCurrentPage} content={content} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans">
      {/* Hide Header on Login page */}
      {currentPage !== 'login' && (
        <Header 
          currentPage={currentPage} 
          setCurrentPage={setCurrentPage} 
          user={user} 
          logout={handleLogout} 
        />
      )}
      
      <main className="flex-grow">
        {renderPage()}
      </main>

      {/* Hide Footer on Login page */}
      {currentPage !== 'login' && <Footer />}
    </div>
  );
};

export default App;