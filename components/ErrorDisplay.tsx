import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ErrorDisplayProps {
  message: string;
  onClose?: () => void;
  type?: 'error' | 'warning' | 'info';
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  message,
  onClose,
  type = 'error',
}) => {
  const getTypeStyles = () => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-red-50 border-red-200 text-red-800';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'warning':
        return <AlertCircle size={16} className="text-yellow-500" />;
      case 'info':
        return <AlertCircle size={16} className="text-blue-500" />;
      default:
        return <AlertCircle size={16} className="text-red-500" />;
    }
  };

  return (
    <div
      className={`flex items-start gap-3 rounded-lg border p-4 ${getTypeStyles()}`}
    >
      {getIcon()}
      <div className="flex-1">
        <p className="text-sm font-medium">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-slate-400 transition-colors hover:text-slate-600"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default ErrorDisplay;
