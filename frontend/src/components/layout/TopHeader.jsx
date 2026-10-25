import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Menu, LogOut, User, HardHat } from 'lucide-react';

export const TopHeader = ({ onMenuClick }) => {
  const { user, role, isCustomer, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-[#DFE8F0] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="p-2 -ml-2 rounded-lg text-[#657786] hover:text-[#263746] hover:bg-[#F5F9FC] lg:hidden cursor-pointer"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <div className="flex items-center gap-2">
          <HardHat className="h-5 w-5 text-[#368BD1] lg:hidden" />
          <h2 className="text-sm font-heading font-bold text-[#263746] tracking-tight hidden sm:block">
            LK Construction Equipment Rental &bull; Operations Console
          </h2>
          <span className="text-xs font-heading font-bold text-[#263746] tracking-tight sm:hidden">
            LK Construction Rental
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {user && (
          <div className="flex items-center gap-2.5 bg-[#F5F9FC] border border-[#DFE8F0] py-1 px-3 rounded-full text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-semibold text-[#263746]">{user.name}</span>
            <span className="text-[#DFE8F0]">|</span>
            <span className="font-heading font-bold text-[#368BD1] uppercase text-2xs tracking-wider">
              {isCustomer ? user.customerType || 'Customer' : role}
            </span>
          </div>
        )}

        <button
          onClick={handleLogout}
          title="Sign Out"
          className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold text-[#657786] hover:text-rose-600 hover:bg-rose-50 transition-colors border border-transparent hover:border-rose-200 cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
};

export default TopHeader;
