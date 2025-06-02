// Define types
export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface SlantToastProps {
  message: string;
  type?: ToastType;
  onClose: () => void;
}

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

export interface SlantToastAPI {
  success: (message: string) => string;
  error: (message: string) => string;
  info: (message: string) => string;
  warning: (message: string) => string;
  remove: (id: string) => void;
}

declare global {
  interface Window {
    slantToast: SlantToastAPI;
  }
}