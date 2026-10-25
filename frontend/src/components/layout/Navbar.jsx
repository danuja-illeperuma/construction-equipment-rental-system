import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HardHat,
  Truck,
  CalendarCheck,
  PlusCircle,
  LogOut,
  LogIn,
  UserPlus,
  Menu,
  X,
  LayoutDashboard,
  Shield,
  PhoneCall,
  ChevronRight,
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, isCustomer, role, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/', label: 'Home', end: true },
    { to: '/equipment', label: 'Equipment Fleet' },
    { to: '/about', label: 'About Us' },
    { to: '/#why-us', label: 'Why Choose Us', isHash: true },
    { to: '/#contact', label: 'Contact', isHash: true },
  ];

  const handleNavClick = (to, isHash) => {
    setMobileOpen(false);
    if (isHash) {
      if (window.location.pathname !== '/') {
        navigate(to);
      } else {
        const id = to.replace('/#', '');
        const elem = document.getElementById(id);
        if (elem) elem.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header className="bg-[#368BD1] border-b border-[#2473B5] text-white sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Branding */}
          <Link to="/" className="flex items-center gap-3.5 group">
            <div className="p-2.5 rounded-xl bg-white text-[#368BD1] font-black shadow-sm group-hover:bg-[#F5F9FC] transition-colors">
              <HardHat className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-bold text-white text-lg tracking-tight group-hover:text-blue-100 transition-colors">
                  LK Construction Rental
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-3xs font-heading font-bold uppercase tracking-wider bg-white/20 text-white border border-white/30">
                  Sri Lanka
                </span>
              </div>
              <p className="text-2xs text-blue-100 font-medium tracking-wide hidden sm:block">
                Reliable Construction Equipment. Ready When You Are.
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              if (link.isHash) {
                return (
                  <button
                    key={link.label}
                    onClick={() => handleNavClick(link.to, true)}
                    className="px-3.5 py-2 rounded-lg text-sm font-heading font-semibold text-blue-50 hover:text-white hover:bg-[#2473B5] transition-colors cursor-pointer"
                  >
                    {link.label}
                  </button>
                );
              }
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    `px-3.5 py-2 rounded-lg text-sm font-heading transition-colors ${
                      isActive
                        ? 'bg-white text-[#2473B5] shadow-xs font-bold'
                        : 'text-blue-50 hover:text-white hover:bg-[#2473B5] font-semibold'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              );
            })}
          </nav>

          {/* Right Auth / Account Area */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-2.5">
                {/* User Info Capsule */}
                <div className="flex items-center gap-2 bg-[#2473B5] border border-blue-300/30 py-1.5 px-3 rounded-full text-xs text-white">
                  <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                  <span className="font-semibold text-white max-w-[130px] truncate">
                    {user?.name}
                  </span>
                  <span className="text-blue-200">|</span>
                  <span className="text-3xs font-heading font-bold uppercase tracking-wider text-blue-100">
                    {isCustomer ? user?.customerType || 'Customer' : role}
                  </span>
                </div>

                {/* Dashboard Shortcut */}
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-heading font-bold bg-white text-[#2473B5] hover:bg-[#F5F9FC] transition-colors shadow-xs"
                >
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  <span>Dashboard</span>
                </Link>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="inline-flex items-center gap-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold text-blue-100 hover:text-rose-200 hover:bg-[#2473B5] transition-colors cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 py-2 px-4 rounded-lg text-xs font-heading font-bold text-white hover:bg-[#2473B5] transition-colors"
                >
                  <LogIn className="h-4 w-4 text-white" />
                  <span>Sign In</span>
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 py-2 px-4 rounded-lg text-xs font-heading font-bold bg-white text-[#2473B5] hover:bg-[#F5F9FC] transition-all shadow-sm"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Get Started</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="lg:hidden flex items-center gap-2">
            {isAuthenticated && (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1 py-1.5 px-2.5 rounded-lg text-xs font-heading font-bold bg-white text-[#2473B5]"
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                <span>Portal</span>
              </Link>
            )}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg text-white hover:bg-[#2473B5] focus:outline-none cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <X className="h-6 w-6 text-white" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-[#2473B5] px-4 pt-4 pb-6 space-y-3 bg-[#2473B5] shadow-2xl">
          <div className="space-y-1">
            {navLinks.map((link) => {
              if (link.isHash) {
                return (
                  <button
                    key={link.label}
                    onClick={() => handleNavClick(link.to, true)}
                    className="w-full text-left flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold text-blue-100 hover:bg-[#1C5D94] hover:text-white"
                  >
                    <span>{link.label}</span>
                    <ChevronRight className="h-4 w-4 text-blue-200" />
                  </button>
                );
              }
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold ${
                      isActive
                        ? 'bg-white text-[#2473B5] font-bold'
                        : 'text-blue-100 hover:bg-[#1C5D94] hover:text-white'
                    }`
                  }
                >
                  <span>{link.label}</span>
                  <ChevronRight className="h-4 w-4 text-blue-200" />
                </NavLink>
              );
            })}
          </div>

          <div className="pt-3 border-t border-blue-400/30">
            {isAuthenticated ? (
              <div className="space-y-2">
                <div className="p-3 bg-[#1C5D94] rounded-lg text-xs text-blue-100">
                  <p className="text-blue-200 text-3xs uppercase tracking-wider font-semibold">Active Session</p>
                  <p className="font-bold text-white text-sm mt-0.5">{user?.name}</p>
                  <p className="text-white text-2xs font-semibold mt-0.5">
                    {isCustomer ? user?.customerType || 'Customer' : role}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold bg-white text-[#2473B5]"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold text-rose-200 bg-[#1C5D94] hover:bg-rose-900/40"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-bold bg-[#1C5D94] text-white hover:bg-[#154874]"
                >
                  <LogIn className="h-4 w-4 text-white" />
                  <span>Sign In</span>
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-extrabold bg-white text-[#2473B5] hover:bg-[#F5F9FC]"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Register</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
