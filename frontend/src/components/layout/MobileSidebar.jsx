import React, { useEffect } from 'react';
import Sidebar from './Sidebar';
import { X } from 'lucide-react';

export const MobileSidebar = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-2xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative flex w-full max-w-xs flex-1 flex-col bg-slate-900 h-full shadow-2xl z-10">
        <div className="absolute top-2 right-2 z-20">
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <Sidebar onClose={onClose} />
      </div>
    </div>
  );
};

export default MobileSidebar;
