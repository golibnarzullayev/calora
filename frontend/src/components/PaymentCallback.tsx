import React, { useEffect, useState } from "react";
import { subscriptionAPI } from "../services/api";
import { useToast } from "../context/ToastContext";

export const PaymentCallback: React.FC = () => {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");
  const { success, error: errorToast } = useToast();

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const orderId = params.get("order_id");

        if (!orderId) {
          setStatus("error");
          setMessage("Order ID topilmadi");
          return;
        }

        const order = await subscriptionAPI.getOrder(orderId);

        if (order.data.status === "completed") {
          setStatus("success");
          setMessage("To'lov muvaffaqiyatli amalga oshirildi!");
          success("Subscription faollashtirildi");

          setTimeout(() => {
            window.location.href = "/";
          }, 3000);
        } else if (order.data.status === "pending") {
          setStatus("loading");
          setMessage("To'lov qayta tekshirilmoqda...");

          setTimeout(() => {
            checkPaymentStatus();
          }, 3000);
        } else {
          setStatus("error");
          setMessage("To'lov amalga oshmadi");
          errorToast("To'lov amalga oshmadi");
        }
      } catch (err) {
        setStatus("error");
        setMessage("Xato yuz berdi");
        errorToast("Xato yuz berdi");
      }
    };

    checkPaymentStatus();
  }, [success, errorToast]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        {status === "loading" && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Tekshirilmoqda...
            </h2>
            <p className="text-gray-600 dark:text-gray-400">{message}</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="text-6xl mb-4">✓</div>
            <h2 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
              Muvaffaqiyat!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{message}</p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Bosh sahifaga yo'naltirilyapti...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="text-6xl mb-4">✗</div>
            <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">
              Xato
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{message}</p>
            <button
              onClick={() => (window.location.href = "/")}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg"
            >
              Bosh sahifaga qaytish
            </button>
          </>
        )}
      </div>
    </div>
  );
};
