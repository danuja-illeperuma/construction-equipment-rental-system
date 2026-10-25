import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
}) => {
  const iconMap = {
    danger: <AlertTriangle className="h-6 w-6 text-rose-600" />,
    warning: <AlertCircle className="h-6 w-6 text-amber-600" />,
    info: <Info className="h-6 w-6 text-blue-600" />,
    success: <AlertCircle className="h-6 w-6 text-emerald-600" />,
  };

  const bgMap = {
    danger: 'bg-rose-100',
    warning: 'bg-amber-100',
    info: 'bg-blue-100',
    success: 'bg-emerald-100',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-full shrink-0 ${bgMap[variant] || bgMap.danger}`}>
          {iconMap[variant] || iconMap.danger}
        </div>
        <div>
          <p className="text-sm text-[#657786] mt-1 leading-relaxed">{message}</p>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-[#DFE8F0]">
        <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
          {cancelText}
        </Button>
        <Button variant={variant} size="sm" onClick={onConfirm} loading={loading}>
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
