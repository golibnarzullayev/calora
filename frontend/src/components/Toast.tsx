import React, { useEffect } from "react";
import { AlertCircle, CheckCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastProps {
  toast: ToastMessage;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (toast.duration) {
      const timer = setTimeout(() => {
        onClose(toast.id);
      }, toast.duration);

      return () => clearTimeout(timer);
    }

    return undefined;
  }, [toast, onClose]);

  const getStyles = () => {
    const styleMap = {
      success: {
        bg: "bg-green-200 dark:bg-green-900/60",
        border: "border-green-500 dark:border-green-700",
        text: "text-green-900 dark:text-green-100",
        icon: "text-green-700 dark:text-green-300",
      },
      error: {
        bg: "bg-red-200 dark:bg-red-900/60",
        border: "border-red-500 dark:border-red-700",
        text: "text-red-900 dark:text-red-100",
        icon: "text-red-700 dark:text-red-300",
      },
      warning: {
        bg: "bg-yellow-200 dark:bg-yellow-900/60",
        border: "border-yellow-500 dark:border-yellow-700",
        text: "text-yellow-900 dark:text-yellow-100",
        icon: "text-yellow-700 dark:text-yellow-300",
      },
      info: {
        bg: "bg-blue-200 dark:bg-blue-900/60",
        border: "border-blue-500 dark:border-blue-700",
        text: "text-blue-900 dark:text-blue-100",
        icon: "text-blue-700 dark:text-blue-300",
      },
    };

    return styleMap[toast.type] || styleMap.info;
  };

  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return <CheckCircle size={18} />;
      case "error":
        return <AlertCircle size={18} />;
      case "warning":
        return <AlertCircle size={18} />;
      default:
        return <Info size={18} />;
    }
  };

  const styles = getStyles();

  return (
    <div
      className={`${styles.bg} ${styles.border} border rounded-md px-3 py-2 shadow-md flex items-start gap-2 animate-slide-in`}
    >
      <div className={`${styles.icon} flex-shrink-0 mt-0.5`}>{getIcon()}</div>

      <p className={`${styles.text} flex-1 text-xs font-medium`}>
        {toast.message}
      </p>

      <button
        onClick={() => onClose(toast.id)}
        className={`${styles.icon} flex-shrink-0 hover:opacity-70 transition-opacity`}
      >
        <X size={16} />
      </button>
    </div>
  );
};

interface ToastContainerProps {
  toasts: ToastMessage[];
  onClose: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onClose,
}) => {
  return (
    <div className="fixed top-3 right-3 z-50 space-y-2 w-[200px]">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  );
};
