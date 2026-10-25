import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { BottomNav } from './BottomNav';

export const Layout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-950 text-gray-100">
      <Header />
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 pb-20 sm:pb-8 screen-fade-in">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};
