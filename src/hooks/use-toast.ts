import { useState, useCallback } from "react";

type ToastVariant = "default" | "destructive" | "success";

interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
}

interface UseToastReturn {
  toast: (opts: Omit<Toast, "id">) => void;
  dismiss: (id: string) => void;
  toasts: Toast[];
}

let count = 0;

export function useToast(): UseToastReturn {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((opts: Omit<Toast, "id">) => {
    count++;
    const id = `toast-${count}`;
    setToasts((prev) => [...prev, { id, ...opts }]);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toast, dismiss, toasts };
}
