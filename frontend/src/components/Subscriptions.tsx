import React, { useEffect, useState } from "react";
import { subscriptionAPI } from "../services/api";
import { useToast } from "../context/ToastContext";
import { formatDateWithDay } from "../utils/dateFormatter";
import { Check, Zap, Calendar, TrendingUp } from "lucide-react";

interface Subscription {
  _id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  durationUnit: "month" | "year";
  discount: number;
  isActive: boolean;
}

interface UserSubscription {
  _id: string;
  subscriptionId: Subscription;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export const Subscriptions: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [userSubscription, setUserSubscription] =
    useState<UserSubscription | null>(null);

  const [loading, setLoading] = useState(true);
  const [creatingOrder, setCreatingOrder] = useState<string | null>(null);

  const { error } = useToast();

  useEffect(() => {
    loadSubscriptions();
    loadUserSubscription();
  }, []);

  const loadSubscriptions = async () => {
    try {
      const res = await subscriptionAPI.getAllSubscriptions();
      setSubscriptions(res.data);
    } catch {
      error("Obunalarni yuklashda xatolik");
    }
  };

  const loadUserSubscription = async () => {
    try {
      const res = await subscriptionAPI.getUserActiveSubscription();
      setUserSubscription(res.data);
    } catch {
      setUserSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (subscriptionId: string) => {
    try {
      setCreatingOrder(subscriptionId);

      const res = await subscriptionAPI.createOrder(subscriptionId);
      const order = res.data;

      if (order.paymeUrl) {
        localStorage.setItem("paymeOrder", JSON.stringify(order));
        window.location.href = order.paymeUrl;
      } else {
        error("Payme URL yaratilmadi");
      }
    } catch (err: any) {
      error(err.response?.data?.error || "Order yaratishda xato");
    } finally {
      setCreatingOrder(null);
    }
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    return Math.max(Math.ceil(diff / (1000 * 60 * 60 * 24)), 0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin h-12 w-12 border-b-2 border-blue-500 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-block bg-gradient-to-r from-purple-500 to-blue-500 p-3 rounded-full mb-4">
            <Zap className="text-white" size={30} />
          </div>

          <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-3">
            Obunalar
          </h1>

          <p className="text-gray-600 dark:text-gray-300">
            Eng yaxshi rejani tanlang va barcha imkoniyatlardan foydalaning
          </p>
        </div>

        {/* ACTIVE SUB */}
        {userSubscription && userSubscription.isActive && (
          <div className="mb-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-3xl p-8 text-white shadow-xl">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-full">
                  <Check size={28} />
                </div>

                <div>
                  <h2 className="text-xl font-bold">Faol Obuna</h2>

                  <p>{userSubscription.subscriptionId.name}</p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-4xl font-black">
                  {getDaysRemaining(userSubscription.endDate)}
                </p>
                <p>kun qoldi</p>
              </div>
            </div>

            <div className="grid grid-cols-2 mt-6 pt-6 border-t border-white/30">
              <div>
                <p className="text-sm opacity-80">Boshlanish</p>
                <p className="font-semibold">
                  {formatDateWithDay(userSubscription.startDate)}
                </p>
              </div>

              <div>
                <p className="text-sm opacity-80">Tugash</p>
                <p className="font-semibold">
                  {formatDateWithDay(userSubscription.endDate)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SUBSCRIPTION CARDS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {subscriptions.map((subscription) => {
            const isYearly = subscription.durationUnit === "year";

            const isActive =
              userSubscription?.subscriptionId._id === subscription._id &&
              userSubscription.isActive;

            const durationText =
              subscription.durationUnit === "month"
                ? `${subscription.duration} oy`
                : `${subscription.duration} yil`;

            const savings =
              subscription.discount > 0
                ? Math.round(
                    subscription.price / (1 - subscription.discount / 100) -
                      subscription.price,
                  )
                : 0;

            return (
              <div
                key={subscription._id}
                className={`relative rounded-3xl overflow-hidden transition-all duration-300 bg-white dark:bg-gray-800 shadow-xl hover:shadow-2xl hover:-translate-y-1 ${
                  isActive ? "ring-4 ring-green-500" : ""
                }`}
              >
                {/* Recommended */}
                {subscription.discount > 0 && (
                  <div className="absolute top-4 right-4">
                    <div className="flex items-center gap-2 bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-bold shadow">
                      <span>🔥 Eng mashhur</span>
                      <span className="opacity-70">·</span>
                      <span>{subscription.discount}% chegirma</span>
                    </div>
                  </div>
                )}

                {/* Active badge */}
                {isActive && (
                  <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 text-xs rounded-full font-bold">
                    Sizning rejangiz
                  </div>
                )}

                {/* HEADER */}
                <div
                  className={`p-8 text-white ${
                    isYearly
                      ? "bg-gradient-to-r from-purple-600 to-blue-600"
                      : "bg-gradient-to-r from-blue-500 to-cyan-500"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-3 rounded-xl">
                      {isYearly ? <Calendar /> : <TrendingUp />}
                    </div>

                    <div>
                      <h3 className="text-2xl font-black">
                        {subscription.name}
                      </h3>

                      <p className="text-white/80 text-sm">
                        {subscription.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* BODY */}
                <div className="p-8">
                  {/* PRICE */}
                  <div className="mb-6">
                    <div className="flex items-end gap-2">
                      <span className="text-5xl font-black">
                        {subscription.price.toLocaleString()}
                      </span>

                      <span className="text-gray-500 text-lg mb-1">so'm</span>
                    </div>

                    <p className="text-gray-500">{durationText}</p>

                    {savings > 0 && (
                      <p className="text-green-600 font-semibold mt-2">
                        💰 {savings.toLocaleString()} so'm tejaysiz
                      </p>
                    )}
                  </div>

                  {/* FEATURES */}
                  <ul className="space-y-3 mb-8 text-sm">
                    <li className="flex items-center gap-2">
                      <Check size={16} className="text-green-500" />
                      Cheksiz kaloriya hisoblash
                    </li>

                    <li className="flex items-center gap-2">
                      <Check size={16} className="text-green-500" />
                      Kunlik ovqat statistikasi
                    </li>

                    <li className="flex items-center gap-2">
                      <Check size={16} className="text-green-500" />
                      AI orqali ovqat tahlili
                    </li>
                  </ul>

                  {/* BUTTON */}
                  <button
                    onClick={() => handleSubscribe(subscription._id)}
                    disabled={creatingOrder === subscription._id || isActive}
                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                      isActive
                        ? "bg-green-500 text-white"
                        : "bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 text-white"
                    }`}
                  >
                    {creatingOrder === subscription._id
                      ? "Yuklanmoqda..."
                      : isActive
                        ? "✓ Faol"
                        : "Tanlash"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
