import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-lg',
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-2xs transition-opacity"
          onClick={onClose}
        />

        {/* Modal Dialog Box */}
        <div
          className={`relative w-full ${maxWidth} transform overflow-hidden rounded-xl bg-white text-left shadow-2xl transition-all p-6 border border-[#DFE8F0] z-10`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-[#DFE8F0]">
            <h3 className="text-base sm:text-lg font-heading font-bold text-[#263746]">{title}</h3>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-[#657786] hover:bg-[#F5F9FC] hover:text-[#263746] transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-4">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
