import React, { useState } from "react";
import { Search } from "lucide-react";
import {
  useAllOrders,
  type AdminOrder,
  type PaginatedResponse,
} from "../../hooks/useQueries";

export const AdminOrders: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "pending" | "paid" | "cancelled"
  >("all");
  const [page, setPage] = useState(1);

  const { data: response, isLoading } = useAllOrders(page, 5);

  const orders =
    (response as PaginatedResponse<AdminOrder> | undefined)?.data || [];
  const pagination = (response as PaginatedResponse<AdminOrder> | undefined)
    ?.pagination;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300";
      case "pending":
        return "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300";
      case "cancelled":
        return "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "paid":
        return "✓ To'landi";
      case "pending":
        return "⏳ Kutilmoqda";
      case "cancelled":
        return "✕ Bekor qilindi";
      default:
        return status;
    }
  };

  const filteredOrders = (orders as AdminOrder[]).filter(
    (order: AdminOrder) => {
      const matchesSearch =
        order.userId.firstName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        order.userId.lastName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        order.userId.phoneNumber.includes(searchTerm) ||
        order.subscriptionId.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === "all" || order.status === filterStatus;

      return matchesSearch && matchesStatus;
    },
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Filters */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Ism, telefon yoki obuna nomi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Barcha Statuslar</option>
          <option value="paid">To'langan</option>
          <option value="pending">Kutilmoqda</option>
          <option value="cancelled">Bekor qilindi</option>
        </select>
      </div>

      {/* Orders Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {filteredOrders.map((order: AdminOrder) => (
          <div
            key={order._id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">
                  {order.userId.firstName} {order.userId.lastName}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {order.userId.phoneNumber}
                </p>
              </div>
              <span
                className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getStatusColor(order.status)}`}
              >
                {getStatusLabel(order.status)}
              </span>
            </div>

            <div className="space-y-2 mb-4 text-sm border-t border-gray-200 dark:border-gray-700 pt-3">
              <p className="text-gray-700 dark:text-gray-300">
                <span className="font-semibold">Obuna:</span>{" "}
                {order.subscriptionId.name}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <span className="font-semibold">Summa:</span>{" "}
                {order.amount.toLocaleString()} so'm
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <span className="font-semibold">Sana:</span>{" "}
                {new Date(order.createdAt).toLocaleDateString("uz-UZ")}
              </p>
            </div>
          </div>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            Buyurtmalar topilmadi
          </p>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="mt-8 flex justify-center items-center gap-4">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700"
          >
            Oldingi
          </button>
          <div className="flex items-center gap-2">
            <span className="text-gray-700 dark:text-gray-300">
              Sahifa {page} / {pagination.pages}
            </span>
          </div>
          <button
            onClick={() => setPage(Math.min(pagination.pages, page + 1))}
            disabled={page === pagination.pages}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700"
          >
            Keyingi
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
