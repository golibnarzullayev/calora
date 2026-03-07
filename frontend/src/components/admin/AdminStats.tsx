import React from "react";
import { TrendingUp, Users, ShoppingCart, DollarSign } from "lucide-react";
import { useAdminStats } from "../../hooks/useQueries";

export const AdminStats: React.FC = () => {
  const { data: stats, isLoading } = useAdminStats();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8 text-gray-500">Statistika topilmadi</div>
    );
  }

  const statCards = [
    {
      title: "Jami foydalanuvchilar",
      value: stats.totalUsers,
      icon: Users,
      color: "from-blue-500 to-blue-600",
      bgColor: "from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800",
    },
    {
      title: "Jami buyurtmalar",
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: "from-purple-500 to-purple-600",
      bgColor:
        "from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800",
    },
    {
      title: "Jami daromad",
      value: `${stats.totalRevenue} so'm`,
      icon: DollarSign,
      color: "from-green-500 to-green-600",
      bgColor:
        "from-green-100 to-green-200 dark:from-green-900 dark:to-green-800",
    },
    {
      title: "Oylik daromad",
      value: `${stats.monthlyRevenue} so'm`,
      icon: TrendingUp,
      color: "from-orange-500 to-orange-600",
      bgColor:
        "from-orange-100 to-orange-200 dark:from-orange-900 dark:to-orange-800",
    },
  ];

  return (
    <div>
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className={`bg-gradient-to-br ${card.bgColor} rounded-lg p-6 shadow-lg`}
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`bg-gradient-to-br ${card.color} p-3 rounded-lg`}
                >
                  <Icon size={24} className="text-white" />
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-semibold mb-1">
                {card.title}
              </p>
              <p className="text-3xl font-black text-gray-900 dark:text-white">
                {card.value}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminStats;
