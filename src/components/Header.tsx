import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Header: React.FC = () => {
  const location = useLocation();

  return (
    <header className="bg-gray-900 border-b border-gray-800 px-4 py-3 sticky top-0 z-40 shadow-md">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 group focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded-lg p-1"
        >
          <span className="text-2xl transition-transform group-hover:scale-110">
            🧮
          </span>
          <h1 className="font-pixel text-sm sm:text-base text-yellow-400 tracking-wider">
            MATH ARCADE
          </h1>
        </Link>

        <nav className="hidden sm:flex items-center gap-2 text-sm font-medium">
          <Link
            to="/"
            className={`px-3 py-2 rounded-lg transition-colors min-h-[44px] flex items-center ${
              location.pathname === '/'
                ? 'bg-gray-800 text-yellow-400'
                : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
            }`}
          >
            Temas
          </Link>
          <Link
            to="/stats"
            className={`px-3 py-2 rounded-lg transition-colors min-h-[44px] flex items-center ${
              location.pathname === '/stats'
                ? 'bg-gray-800 text-yellow-400'
                : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
            }`}
          >
            Estadísticas
          </Link>
          <Link
            to="/ranking"
            className={`px-3 py-2 rounded-lg transition-colors min-h-[44px] flex items-center ${
              location.pathname === '/ranking'
                ? 'bg-gray-800 text-yellow-400'
                : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
            }`}
          >
            Ranking
          </Link>
          <Link
            to="/account"
            className={`px-3 py-2 rounded-lg transition-colors min-h-[44px] flex items-center ${
              location.pathname === '/account'
                ? 'bg-gray-800 text-yellow-400'
                : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
            }`}
          >
            Cuenta
          </Link>
        </nav>
      </div>
    </header>
  );
};
