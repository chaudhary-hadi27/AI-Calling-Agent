"use client";

import React from "react";
import { ToastContainer } from "./ui/Toast";
import { useToastStore } from "@/lib/store/toastStore";

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { toasts, removeToast } = useToastStore();

  return (
    <>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </>
  );
};