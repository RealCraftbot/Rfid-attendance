import { useState } from 'react';
import { Toast, ToastProvider } from '@/components/ui/toast';

export const useToast = () => {
  const [toasts, setToasts] = useState<Array<{ id: string; title: string; description?: string; variant?: string }>>([]);

  const toast = (props: { title: string; description?: string; variant?: string }) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, ...props }]);
    
    // Auto-remove toast after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  return { toast, toasts };
};