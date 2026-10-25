import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const BottomNav: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { label: 'Temas', path: '/', icon: '🎮' },
    { label: 'Estadísticas', path: '/stats', icon: '📊' },
    { label: 'Ranking', path: '/ranking', icon: '🏆' },
    { label: 'Cuenta', path: '/account', icon: '👤' },
  ];

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 z-40 px-2 py-1 shadow-lg">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive =
            item.path === '/'
              ? location.pathname === '/' || location.pathname.startsWith('/topic')
              : location.pathname.startsWith(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center min-h-[48px] min-w-[64px] py-1 px-2 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? 'text-yellow-400 font-bold'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <span className="text-lg leading-none mb-1">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
