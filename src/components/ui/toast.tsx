"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  showToast: (toast: Omit<ToastItem, "id">) => void;
  removeToast: (id: string) => void;
  toast: {
    success: (title: string, message?: string) => void;
    error: (title: string, message?: string) => void;
    warning: (title: string, message?: string) => void;
    info: (title: string, message?: string) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type, title, message, duration = 3500 }: Omit<ToastItem, "id">) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const newToast: ToastItem = { id, type, title, message, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const toastHelpers = {
    success: (title: string, message?: string) => showToast({ type: "success", title, message }),
    error: (title: string, message?: string) => showToast({ type: "error", title, message }),
    warning: (title: string, message?: string) => showToast({ type: "warning", title, message }),
    info: (title: string, message?: string) => showToast({ type: "info", title, message }),
  };

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast, toast: toastHelpers }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((item) => (
          <div
            key={item.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-xl shadow-black/40 backdrop-blur-md transition-all duration-300 animate-in slide-in-from-bottom-3 ${
              item.type === "success"
                ? "bg-emerald-950/90 border-emerald-500/40 text-emerald-100"
                : item.type === "error"
                ? "bg-rose-950/90 border-rose-500/40 text-rose-100"
                : item.type === "warning"
                ? "bg-amber-950/90 border-amber-500/40 text-amber-100"
                : "bg-navy-900/95 border-brand-purple/40 text-slate-100"
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {item.type === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              {item.type === "error" && <AlertCircle className="w-4 h-4 text-rose-400" />}
              {item.type === "warning" && <AlertTriangle className="w-4 h-4 text-amber-400" />}
              {item.type === "info" && <Info className="w-4 h-4 text-brand-purple" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold leading-tight">{item.title}</p>
              {item.message && <p className="text-[11px] opacity-80 mt-0.5 leading-normal">{item.message}</p>}
            </div>
            <button
              onClick={() => removeToast(item.id)}
              className="shrink-0 p-1 rounded-md opacity-60 hover:opacity-100 transition-opacity"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
