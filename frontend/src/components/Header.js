import React from 'react';
import ThemeToggle from './ThemeToggle';
import ShieldIcon from './SheildIcon';


const Header = ({ currentPage, setCurrentPage, user, logout }) => {
  const PAGES = ['home', 'about', 'assets', 'dashboard', 'github', 'contact'];
  
  return (
    <header className="bg-slate-900 text-white sticky top-0 z-50 shadow-md">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <button onClick={() => setCurrentPage('home')} className="flex items-center gap-2 text-xl font-bold hover:text-purple-400 transition">
          <ShieldIcon className="text-purple-400" /> TrackSphere
            </button>

        <nav className="hidden md:flex gap-6 text-sm font-medium">
          {PAGES.map(page => (
            <button 
              key={page}
              onClick={() => setCurrentPage(page)} 
              className={`capitalize hover:text-purple-400 transition ${currentPage === page ? 'text-purple-400' : ''}`}
            >
              {page}
            </button>
          ))}
        </nav>
        {user ? (
          <button onClick={logout} className="bg-red-600 px-4 py-2 rounded-md text-sm font-bold hover:bg-red-700 transition">Logout</button>
        ) : (
          <button onClick={() => setCurrentPage('login')} className="bg-purple-600 px-4 py-2 rounded-md text-sm font-bold hover:bg-purple-700 transition">Login</button>
        )}
      </div>
    </header>
  );
};
export default Header;