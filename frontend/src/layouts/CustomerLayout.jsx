import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';

/**
 * Customer & Public Layout for LK Construction Rental.
 * Features the brand-consistent top navbar with live session state,
 * main responsive content area, and comprehensive Sri Lankan footer.
 */
export const CustomerLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      <Navbar />
      <main className="flex-1 w-full">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default CustomerLayout;
