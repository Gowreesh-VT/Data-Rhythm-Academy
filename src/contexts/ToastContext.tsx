import React, { createContext, useContext, useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  persistent?: boolean;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  success: (title: string, message?: string, action?: Toast['action']) => void;
  error: (title: string, message?: string, action?: Toast['action'], persistent?: boolean) => void;
  warning: (title: string, message?: string, action?: Toast['action']) => void;
  info: (title: string, message?: string, action?: Toast['action']) => void;
  errorWithRetry: (title: string, message: string, onRetry: () => void) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);

    // Auto remove after duration (default 5 seconds) unless persistent
    if (!toast.persistent) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration || (toast.type === 'error' ? 7000 : 5000));
    }
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const success = (title: string, message?: string, action?: Toast['action']) => 
    addToast({ type: 'success', title, message, action });
  
  const error = (title: string, message?: string, action?: Toast['action'], persistent?: boolean) => 
    addToast({ type: 'error', title, message, action, persistent });
  
  const warning = (title: string, message?: string, action?: Toast['action']) => 
    addToast({ type: 'warning', title, message, action });
  
  const info = (title: string, message?: string, action?: Toast['action']) => 
    addToast({ type: 'info', title, message, action });

  const errorWithRetry = (title: string, message: string, onRetry: () => void) => {
    addToast({
      type: 'error',
      title,
      message,
      action: {
        label: 'Retry',
        onClick: onRetry
      },
      persistent: true,
      duration: 10000
    });
  };

  const getIcon = (type: Toast['type']) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5" />;
      case 'error': return <XCircle className="w-5 h-5" />;
      case 'warning': return <AlertCircle className="w-5 h-5" />;
      case 'info': return <Info className="w-5 h-5" />;
    }
  };

  const getColors = (type: Toast['type']) => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200 text-green-800';
      case 'error': return 'bg-red-50 border-red-200 text-red-800';
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info': return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, warning, info, errorWithRetry }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[9999] space-y-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.95 }}
              className={`
                max-w-sm w-full rounded-lg border shadow-lg p-4 
                ${getColors(toast.type)}
                backdrop-blur-sm
              `}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {getIcon(toast.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm">{toast.title}</h4>
                  {toast.message && (
                    <p className="text-sm opacity-90 mt-1">{toast.message}</p>
                  )}
                  {toast.action && (
                    <button
                      onClick={() => {
                        toast.action!.onClick();
                        removeToast(toast.id);
                      }}
                      className="mt-2 text-xs font-medium underline hover:no-underline transition-all"
                    >
                      {toast.action.label}
                    </button>
                  )}
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};