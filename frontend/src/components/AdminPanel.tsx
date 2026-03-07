import React, { useState } from "react";
import {
  Users,
  ShoppingCart,
  BarChart3,
  CreditCard,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import AdminUsers from "./admin/AdminUsers";
import AdminOrders from "./admin/AdminOrders";
import AdminStats from "./admin/AdminStats";
import AdminPayments from "./admin/AdminPayments";

interface AdminPanelProps {
  onLogout?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout }) => {
  const [currentPage, setCurrentPage] = useState<
    "users" | "orders" | "stats" | "payments"
  >("users");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { id: "users", label: "Foydalanuvchilar", icon: Users },
    { id: "orders", label: "Buyurtmalar", icon: ShoppingCart },
    { id: "stats", label: "Statistika", icon: BarChart3 },
    { id: "payments", label: "To'lovlar", icon: CreditCard },
  ];

  const renderPage = () => {
    switch (currentPage) {
      case "users":
        return <AdminUsers />;
      case "orders":
        return <AdminOrders />;
      case "stats":
        return <AdminStats />;
      case "payments":
        return <AdminPayments />;
      default:
        return <AdminUsers />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 right-6 z-50 lg:hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 rounded-lg"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed lg:relative w-64 h-screen bg-gradient-to-b from-blue-600 to-purple-600 text-white p-6 transform transition-transform duration-300 z-40 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-black mb-2">Admin Panel</h1>
          <p className="text-blue-100 text-sm">Boshqaruv markazi</p>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id as any);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  currentPage === item.id
                    ? "bg-white text-blue-600 font-bold shadow-lg"
                    : "text-blue-100 hover:bg-white/10"
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <button
          onClick={() => {
            localStorage.removeItem("authToken");
            onLogout?.();
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-blue-100 hover:bg-red-500/20 transition-all mt-8 border border-blue-100/20"
        >
          <LogOut size={20} />
          <span>Chiqish</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto pt-16 lg:pt-0">
        <div className="p-4 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
              {menuItems.find((item) => item.id === currentPage)?.label}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Tizimni boshqaring va statistikani ko'ring
            </p>
          </div>

          {/* Content */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            {renderPage()}
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminPanel;
