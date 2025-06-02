// customToast.ts
import { Toast, ToastType } from "./toast";

type AddToastFn = (toast: Toast) => void;
type RemoveToastFn = (id: string) => void;

let addToast: AddToastFn | null = null;
let removeToast: RemoveToastFn | null = null;

export const customToast = {
  register: (add: AddToastFn, remove: RemoveToastFn) => {
    addToast = add;
    removeToast = remove;
  },

  success: (message: string): string => {
    const id = Date.now().toString();
    addToast?.({ id, message, type: 'success' });
    return id;
  },

  error: (message: string): string => {
    const id = Date.now().toString();
    addToast?.({ id, message, type: 'error' });
    return id;
  },

  info: (message: string): string => {
    const id = Date.now().toString();
    addToast?.({ id, message, type: 'info' });
    return id;
  },

  warning: (message: string): string => {
    const id = Date.now().toString();
    addToast?.({ id, message, type: 'warning' });
    return id;
  },

  remove: (id: string) => {
    removeToast?.(id);
  }
};
