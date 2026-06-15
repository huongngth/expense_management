import React, { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  ArrowRightLeft,
  Wallet,
  Tags,
  Target,
  User,
  LogOut,
  Bell,
  Plus,
} from "lucide-react";

export function Layout() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const cachedUser = localStorage.getItem("user");
  const user = cachedUser
    ? JSON.parse(cachedUser)
    : {
        fullName: "Nguyễn Văn A",
        avatarUrl: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
      };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const navItems = [
    {
      path: "/dashboard",
      label: "Tổng quan",
      icon: LayoutDashboard,
    },
    {
      path: "/transactions",
      label: "Giao dịch",
      icon: ArrowRightLeft,
    },
    {
      path: "/accounts",
      label: "Tài khoản",
      icon: Wallet,
    },
    {
      path: "/categories",
      label: "Danh mục",
      icon: Tags,
    },
    {
      path: "/budget-history",
      label: "Ngân sách",
      icon: Target,
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-navy-900 text-white transition-all duration-300">
        <div className="p-6 flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-white">
            F
          </div>
          <span className="text-xl font-bold tracking-tight">FinTrack</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive(item.path) ? "bg-navy-800 text-emerald-400 font-medium" : "text-slate-300 hover:bg-navy-800 hover:text-white"}`}
              >
                <Icon
                  size={20}
                  className={
                    isActive(item.path) ? "text-emerald-400" : "text-slate-400"
                  }
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-navy-800">
          <Link
            to="/profile"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors mb-1 ${isActive("/profile") ? "bg-navy-800 text-emerald-400 font-medium" : "text-slate-300 hover:bg-navy-800 hover:text-white"}`}
          >
            <User
              size={20}
              className={
                isActive("/profile") ? "text-emerald-400" : "text-slate-400"
              }
            />
            <span>Hồ sơ cá nhân</span>
          </Link>
          <Link
            to="/login"
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-navy-800 hover:text-red-400 transition-colors"
          >
            <LogOut size={20} className="text-slate-400" />
            <span>Đăng xuất</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-10">
          <div className="flex items-center md:hidden">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-white mr-3">
              F
            </div>
            <span className="text-lg font-bold text-navy-900">FinTrack</span>
          </div>

          <div className="hidden md:block">
            <h1 className="text-xl font-semibold text-slate-800 capitalize">
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-100">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="hidden md:flex items-center space-x-3 pl-4 border-l border-slate-200">
              <img
                src={user.avatarUrl || "https://i.pravatar.cc/150"}
                alt="User avatar"
                className="w-8 h-8 rounded-full border border-slate-200"
              />
              <span className="text-sm font-medium text-slate-700">
                {user.fullName}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center h-16 px-2 z-30 pb-safe">
        {[
          {
            path: "/dashboard",
            icon: LayoutDashboard,
            label: "Trang chủ",
          },
          {
            path: "/transactions",
            icon: ArrowRightLeft,
            label: "Giao dịch",
          },
          {
            path: "/budget-history",
            icon: Target,
            label: "Ngân sách",
          },
          {
            path: "/profile",
            icon: User,
            label: "Cá nhân",
          },
        ].map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${active ? "text-emerald-500" : "text-slate-500"}`}
            >
              <Icon
                size={20}
                className={active ? "text-emerald-500" : "text-slate-400"}
              />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
