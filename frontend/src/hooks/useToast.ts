import { useToastStore } from "@/lib/store/toastStore";
import { useCallback } from "react";

export const useToast = () => {
  const { addToast, removeToast, clearToasts } = useToastStore();

  const toast = useCallback(
    {
      success: (message: string, duration?: number) => {
        addToast({ message, type: "success", duration });
      },
      error: (message: string, duration?: number) => {
        addToast({ message, type: "error", duration });
      },
      warning: (message: string, duration?: number) => {
        addToast({ message, type: "warning", duration });
      },
      info: (message: string, duration?: number) => {
        addToast({ message, type: "info", duration });
      },
    },
    [addToast]
  );

  return {
    toast,
    removeToast,
    clearToasts,
  };
};