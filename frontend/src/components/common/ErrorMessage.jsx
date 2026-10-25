import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export const ErrorMessage = ({
  title = 'Something went wrong',
  message = 'An unexpected error occurred while loading this section.',
  onRetry,
  className = '',
}) => {
  return (
    <div className={`p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 ${className}`}>
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-rose-900">{title}</h4>
          <p className="mt-1 text-xs text-rose-700 leading-relaxed">{message}</p>
          {onRetry && (
            <div className="mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                icon={RefreshCw}
                className="bg-white text-rose-700 border-rose-300 hover:bg-rose-100"
              >
                Try Again
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;
