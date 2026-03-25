import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { X, CheckCircle, AlertCircle, Info, Loader2 } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'loading';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (type !== 'loading') {
      setTimeout(() => removeToast(id), 5000);
    }
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:bottom-8 sm:right-8 z-[100] flex flex-col space-y-4 sm:w-[400px]">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              flex items-center p-4 shadow-2xl border bg-white animate-slide-up
              ${toast.type === 'success' ? 'border-green-100' : 
                toast.type === 'error' ? 'border-red-100' : 
                'border-luxury-gray-100'}
            `}
          >
            <div className="mr-4">
              {toast.type === 'success' && <CheckCircle className="text-green-500" size={20} />}
              {toast.type === 'error' && <AlertCircle className="text-red-500" size={20} />}
              {toast.type === 'info' && <Info className="text-accent" size={20} />}
              {toast.type === 'loading' && <Loader2 className="text-accent animate-spin" size={20} />}
            </div>
            <p className="text-[10px] uppercase tracking-widest font-medium text-luxury-charcoal flex-grow">
              {toast.message}
            </p>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-4 text-luxury-gray-300 hover:text-black transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};
