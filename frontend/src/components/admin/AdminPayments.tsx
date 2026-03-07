import React, { useState } from "react";
import { Search, TrendingUp } from "lucide-react";
import {
  useAdminPayments,
  type PaginatedResponse,
  type AdminPayment,
} from "../../hooks/useQueries";

export const AdminPayments: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "pending" | "completed" | "failed"
  >("all");
  const [dateRange, setDateRange] = useState("30");
  const [page, setPage] = useState(1);

  const { data: response, isLoading } = useAdminPayments(
    parseInt(dateRange),
    page,
    5,
  );

  const payments =
    (response as PaginatedResponse<AdminPayment> | undefined)?.data || [];
  const pagination = (response as PaginatedResponse<AdminPayment> | undefined)
    ?.pagination;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300";
      case "pending":
        return "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300";
      case "failed":
        return "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "✓ Yakunlandi";
      case "pending":
        return "⏳ Kutilmoqda";
      case "failed":
        return "✕ Muvaffaqiyatsiz";
      default:
        return status;
    }
  };

  const filteredPayments = payments.filter((payment: AdminPayment) => {
    const matchesSearch =
      (payment.userId?.firstName || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (payment.userId?.lastName || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (payment.userId?.phoneNumber || "").includes(searchTerm) ||
      (payment.transactionId || "").includes(searchTerm);

    const matchesStatus =
      filterStatus === "all" || payment.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const completedPayments = payments.filter(
    (p: AdminPayment) => p.status === "completed",
  );
  const failedPayments = payments.filter(
    (p: AdminPayment) => p.status === "failed",
  );
  const totalAmount = completedPayments.reduce(
    (sum: number, p: AdminPayment) => sum + p.amount,
    0,
  );
  const failedAmount = failedPayments.reduce(
    (sum: number, p: AdminPayment) => sum + p.amount,
    0,
  );

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-lg p-4">
          <p className="text-blue-600 dark:text-blue-300 text-sm font-semibold">
            Jami To'lovlar
          </p>
          <p className="text-3xl font-black text-blue-900 dark:text-blue-100">
            {payments.length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 rounded-lg p-4">
          <p className="text-green-600 dark:text-green-300 text-sm font-semibold">
            Yakunlangan
          </p>
          <p className="text-2xl font-black text-green-900 dark:text-green-100">
            {(totalAmount / 1000000).toFixed(1)}M
          </p>
        </div>
        <div className="bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900 dark:to-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-300 text-sm font-semibold">
            Muvaffaqiyatsiz
          </p>
          <p className="text-2xl font-black text-red-900 dark:text-red-100">
            {(failedAmount / 1000000).toFixed(1)}M
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800 rounded-lg p-4">
          <p className="text-purple-600 dark:text-purple-300 text-sm font-semibold">
            Muvaffaqiyat Foizi
          </p>
          <p className="text-3xl font-black text-purple-900 dark:text-purple-100">
            {payments.length > 0
              ? ((completedPayments.length / payments.length) * 100).toFixed(0)
              : 0}
            %
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Ism, telefon yoki tranzaksiya ID..."
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
          <option value="completed">Yakunlangan</option>
          <option value="pending">Kutilmoqda</option>
          <option value="failed">Muvaffaqiyatsiz</option>
        </select>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="7">Oxirgi 7 kun</option>
          <option value="30">Oxirgi 30 kun</option>
          <option value="90">Oxirgi 90 kun</option>
          <option value="365">Oxirgi yil</option>
        </select>
      </div>

      {/* Payments Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {filteredPayments.map((payment: AdminPayment) => (
          <div
            key={payment._id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">
                  {payment.userId?.firstName || "-"}{" "}
                  {payment.userId?.lastName || ""}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {payment.userId?.phoneNumber || "-"}
                </p>
              </div>
              <span
                className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getStatusColor(payment.status)}`}
              >
                {getStatusLabel(payment.status)}
              </span>
            </div>

            <div className="space-y-2 mb-4 text-sm border-t border-gray-200 dark:border-gray-700 pt-3">
              <p className="text-gray-700 dark:text-gray-300">
                <span className="font-semibold">Summa:</span>{" "}
                {payment.amount.toLocaleString()} so'm
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <span className="font-semibold">Sana:</span>{" "}
                {new Date(payment.createdAt).toLocaleDateString("uz-UZ")}
              </p>
              {payment.transactionId && (
                <p className="text-gray-700 dark:text-gray-300 font-mono text-xs break-all">
                  <span className="font-semibold">Tranzaksiya:</span>{" "}
                  {payment.transactionId}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredPayments.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            To'lovlar topilmadi
          </p>
        </div>
      )}

      {/* Revenue Chart Info */}
      <div className="mt-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp size={28} />
          <h3 className="text-lg font-bold">Daromad Tahlili</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-green-100 text-sm mb-1">
              O'rtacha To'lov Summasi
            </p>
            <p className="text-2xl font-black">
              {completedPayments.length > 0
                ? (totalAmount / completedPayments.length).toLocaleString()
                : 0}{" "}
              so'm
            </p>
          </div>
          <div>
            <p className="text-green-100 text-sm mb-1">Eng Katta To'lov</p>
            <p className="text-2xl font-black">
              {payments.length > 0
                ? Math.max(
                    ...payments.map((p: AdminPayment) => p.amount),
                  ).toLocaleString()
                : 0}{" "}
              so'm
            </p>
          </div>
          <div>
            <p className="text-green-100 text-sm mb-1">Eng Kichik To'lov</p>
            <p className="text-2xl font-black">
              {payments.length > 0
                ? Math.min(
                    ...payments.map((p: AdminPayment) => p.amount),
                  ).toLocaleString()
                : 0}{" "}
              so'm
            </p>
          </div>
        </div>
      </div>

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

export default AdminPayments;
