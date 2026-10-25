import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { HardHat } from 'lucide-react';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        <Link to="/" className="inline-flex items-center gap-3 group">
          <div className="p-2.5 rounded-xl bg-amber-500 text-slate-900 shadow-lg group-hover:bg-amber-400 transition-colors">
            <HardHat className="h-8 w-8" />
          </div>
          <div className="text-left">
            <span className="text-2xl font-black text-white tracking-wider block">CERMS</span>
            <span className="text-2xs font-bold text-amber-400 uppercase tracking-widest block">
              Equipment Rental & Management
            </span>
          </div>
        </Link>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg px-4">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-2xl rounded-2xl border border-slate-200">
          <Outlet />
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          &copy; {new Date().getFullYear()} LK Construction Equipment Rental. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default AuthLayout;
