import React, { createContext, useState, useCallback, ReactNode } from 'react';
import { X, AlertTriangle, CheckCircle, Info } from 'lucide-react';


type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  addToast: (message: string, type: ToastType) => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

const ToastContainer: React.FC<{ toasts: Toast[], removeToast: (id: number) => void }> = ({ toasts, removeToast }) => {
  const icons = {
    success: <CheckCircle className="text-green-500" />,
    error: <AlertTriangle className="text-red-500" />,
    info: <Info className="text-blue-500" />,
  };

  return (
    <div className="fixed top-5 right-5 z-[100] w-full max-w-sm">
      <div className="flex flex-col gap-3">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className="w-full bg-white/80 backdrop-blur-lg border border-slate-200/80 rounded-xl shadow-2xl p-4 flex items-start gap-3 animate-in slide-in-from-top-4 duration-300"
          >
            <div className="flex-shrink-0 mt-1">{icons[toast.type]}</div>
            <p className="flex-grow text-slate-700 text-sm font-medium">{toast.message}</p>
            <button onClick={() => removeToast(toast.id)} className="p-1 text-slate-400 hover:text-slate-600">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 5000); // Auto-remove after 5 seconds
  }, []);

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};
