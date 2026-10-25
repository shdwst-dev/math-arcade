import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { AccountPrompts } from '../features/auth/AccountPrompts';

export const Layout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-950 text-gray-100">
      <Header />
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 screen-fade-in">
        <Outlet />
      </main>
      {/* El relleno inferior deja espacio a la barra de navegación fija del celular. */}
      <footer className="px-4 pb-24 pt-2 text-center text-xs text-gray-400 sm:pb-6">
        <Link
          to="/privacidad"
          className="inline-flex min-h-[44px] items-center underline hover:text-white"
        >
          Aviso de privacidad
        </Link>
      </footer>
      <BottomNav />
      <AccountPrompts />
    </div>
  );
};
