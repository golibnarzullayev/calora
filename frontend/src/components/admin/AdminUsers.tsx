import React, { useState } from "react";
import { Shield, Trash2, Search } from "lucide-react";
import { useToast } from "../../context/ToastContext";
import {
  useAllUsers,
  useToggleUserAdmin,
  useDeleteUser,
  type AdminUser,
  type PaginatedResponse,
} from "../../hooks/useQueries";

export const AdminUsers: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const { success: showSuccess, error: showError } = useToast();

  const { data: response, isLoading } = useAllUsers(page, 5);
  const toggleAdminMutation = useToggleUserAdmin();
  const deleteUserMutation = useDeleteUser();

  const users =
    (response as PaginatedResponse<AdminUser> | undefined)?.data || [];
  const pagination = (response as PaginatedResponse<AdminUser> | undefined)
    ?.pagination;

  const handleToggleAdmin = async (userId: string, isAdmin: boolean) => {
    try {
      await toggleAdminMutation.mutateAsync({ userId, isAdmin: !isAdmin });
      showSuccess(!isAdmin ? "Admin qilindi" : "Admin huquqi olib tashlandi");
    } catch (error) {
      showError("Xato yuz berdi");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Rostanham bu foydalanuvchini o'chirmoqchisiz?")) return;
    try {
      await deleteUserMutation.mutateAsync(userId);
      showSuccess("Foydalanuvchi o'chirildi");
    } catch (error) {
      showError("O'chirishda xato");
    }
  };

  const filteredUsers = (users as AdminUser[]).filter(
    (user: AdminUser) =>
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phoneNumber.includes(searchTerm),
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
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Ism, familiya yoki telefon raqamini qidiring..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Users Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {filteredUsers.map((user: AdminUser) => (
          <div
            key={user._id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">
                  {user.firstName} {user.lastName}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(user.createdAt).toLocaleDateString("uz-UZ")}
                </p>
              </div>
              {user.isAdmin && (
                <span className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-1 rounded text-xs font-semibold">
                  👑 Admin
                </span>
              )}
            </div>

            <div className="space-y-2 mb-4 text-sm">
              <p className="text-gray-700 dark:text-gray-300">
                <span className="font-semibold">Telefon:</span>{" "}
                {user.phoneNumber}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <span className="font-semibold">Yosh:</span> {user.age} yosh
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <span className="font-semibold">Vazn:</span> {user.weight} kg
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <span className="font-semibold">Bo'y:</span> {user.height} cm
              </p>
            </div>

            <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => handleToggleAdmin(user._id, user.isAdmin)}
                className={`flex-1 p-2 rounded-lg transition-all text-sm font-semibold ${
                  user.isAdmin
                    ? "bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 hover:bg-purple-200"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200"
                }`}
                title={
                  user.isAdmin ? "Admin huquqini olib tashlash" : "Admin qilish"
                }
              >
                <Shield size={16} className="inline mr-1" />
                {user.isAdmin ? "Admin" : "Admin qilish"}
              </button>
              <button
                onClick={() => handleDeleteUser(user._id)}
                className="flex-1 p-2 rounded-lg bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 hover:bg-red-200 transition-all text-sm font-semibold"
                title="O'chirish"
              >
                <Trash2 size={16} className="inline mr-1" />
                O'chirish
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            Foydalanuvchilar topilmadi
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

export default AdminUsers;
