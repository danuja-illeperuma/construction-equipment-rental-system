import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  CalendarCheck,
  Truck,
  FolderTree,
  CreditCard,
  RotateCcw,
  AlertTriangle,
  Wrench,
  BarChart3,
  Users,
  ShieldAlert,
  HardHat,
} from 'lucide-react';

export const Sidebar = ({ onClose }) => {
  const { user, role } = useAuth();

  // Navigation items mapped to internal roles (STAFF, ADMIN)
  const navItems = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['STAFF', 'ADMIN'],
    },
    {
      to: '/rentals',
      label: 'Rentals',
      icon: CalendarCheck,
      roles: ['STAFF', 'ADMIN'],
    },
    {
      to: '/equipment',
      label: 'Equipment Fleet',
      icon: Truck,
      roles: ['STAFF', 'ADMIN'],
    },
    {
      to: '/categories',
      label: 'Categories',
      icon: FolderTree,
      roles: ['STAFF', 'ADMIN'],
    },
    {
      to: '/payment',
      label: 'Payments',
      icon: CreditCard,
      roles: ['STAFF', 'ADMIN'],
    },
    {
      to: '/returns',
      label: 'Returns',
      icon: RotateCcw,
      roles: ['STAFF', 'ADMIN'],
    },
    {
      to: '/damage',
      label: 'Damage Reports',
      icon: AlertTriangle,
      roles: ['STAFF', 'ADMIN'],
    },
    {
      to: '/maintenance',
      label: 'Maintenance',
      icon: Wrench,
      roles: ['STAFF', 'ADMIN'],
    },
    {
      to: '/reports',
      label: 'Reports',
      icon: BarChart3,
      roles: ['STAFF', 'ADMIN'],
    },
    {
      to: '/users',
      label: 'Users',
      icon: Users,
      roles: ['ADMIN'],
    },
    {
      to: '/audit-logs',
      label: 'Audit Logs',
      icon: ShieldAlert,
      roles: ['STAFF', 'ADMIN'],
    },
  ];

  const filteredNavItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(role)
  );

  return (
    <div className="flex flex-col h-full bg-white text-[#263746] w-64 border-r border-[#DFE8F0]">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-5 border-b border-[#DFE8F0] gap-3 shrink-0 bg-[#F5F9FC]">
        <div className="p-2 rounded-lg bg-[#368BD1] text-white shadow-xs">
          <HardHat className="h-5 w-5" />
        </div>
        <div>
          <span className="font-heading font-bold text-[#263746] text-sm tracking-tight">LK Construction Rental</span>
          <span className="block text-3xs font-heading font-bold text-[#368BD1] uppercase tracking-widest">
            Sri Lanka Operations
          </span>
        </div>
      </div>

      {/* Role Pill Indicator */}
      <div className="px-5 py-2.5 border-b border-[#DFE8F0] bg-[#F5F9FC]/60">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#657786] font-medium text-2xs">Console Role:</span>
          <span className="px-2 py-0.5 rounded font-heading font-bold text-2xs uppercase tracking-wider bg-[#E8F2FA] text-[#2473B5] border border-[#DFE8F0]">
            {role || 'USER'}
          </span>
        </div>
      </div>

      {/* Nav Items List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-2xs font-heading font-bold uppercase tracking-wider text-[#657786]">
          Management Console
        </div>
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-[#368BD1] text-white font-heading font-bold shadow-xs'
                    : 'text-[#657786] hover:text-[#263746] hover:bg-[#F5F9FC] font-medium'
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User Footer Profile */}
      <div className="p-4 border-t border-[#DFE8F0] bg-[#F5F9FC] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#E8F2FA] border border-[#DFE8F0] flex items-center justify-center font-heading font-bold text-[#368BD1] text-xs">
            {user?.name ? user.name.substring(0, 2).toUpperCase() : 'U'}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-heading font-bold text-[#263746] truncate">{user?.name || 'Staff User'}</p>
            <p className="text-2xs text-[#657786] truncate">{user?.email || 'user@rental.com'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
