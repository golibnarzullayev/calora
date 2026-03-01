import React from "react";
import { LogOut, X } from "lucide-react";
import { UZ } from "../constants/uz";

interface LogoutModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const LogoutModal: React.FC<LogoutModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      ></div>

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-sm w-full animate-slide-up">
        {/* Close Button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
        >
          <X size={20} className="text-gray-600 dark:text-gray-400" />
        </button>

        {/* Content */}
        <div className="p-6 pt-8">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-full">
              <LogOut size={32} className="text-red-600 dark:text-red-400" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
            Chiqishni tasdiqlang
          </h2>

          {/* Message */}
          <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
            Siz akkauntdan chiqmoqchisiz. Ushbu amalni qaytarib bo'lmaydi.
          </p>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 transition-all"
            >
              {UZ.common.cancel}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-red-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              <LogOut size={18} />
              {isLoading ? UZ.common.loading : "Chiqish"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
