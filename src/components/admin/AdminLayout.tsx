import React, { useState } from "react";

import {
  Activity,
  BarChart3,
  Building2,
  Clock,
  FileText,
  Home,
  LogOut,
  Menu,
  Settings,
  Shield,
  Users,
  X,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  activeTab,
  onTabChange,
}) => {
  const { user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const canAccessUsers = user?.role === "super_admin" || user?.role === "admin";
  const canAccessPHCs = user?.role === "super_admin" || user?.role === "admin";
  const canAccessStaff = user?.role === "super_admin" || user?.role === "admin";
  const canAccessBlog = ["super_admin", "admin", "manager", "blogger"].includes(
    user?.role || ""
  );
  const canAccessActivityLogs = user?.role === "super_admin" || user?.role === "admin";
  const canAccessAttendance = ["super_admin", "admin", "manager", "phc_admin"].includes(
    user?.role || ""
  );

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home, show: true },
    {
      id: "users",
      label: "User Management",
      icon: Users,
      show: canAccessUsers,
    },
    {
      id: "phcs",
      label: "PHC Management",
      icon: Building2,
      show: canAccessPHCs,
    },
    {
      id: "staff",
      label: "Staff Management",
      icon: Users,
      show: canAccessStaff,
    },
    {
      id: "attendance",
      label: "Attendance",
      icon: Clock,
      show: canAccessAttendance,
    },
    {
      id: "blog",
      label: "Events & Activities",
      icon: FileText,
      show: canAccessBlog,
    },
    {
      id: "activity_logs",
      label: "Activity Logs",
      icon: Activity,
      show: canAccessActivityLogs,
    },
    { id: "analytics", label: "Analytics", icon: BarChart3, show: true },
    { id: "settings", label: "Settings", icon: Settings, show: true },
  ].filter((item) => item.show);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-green-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">
              KWSPHCDA
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex flex-col h-full">
          <nav className="flex-1 px-4 py-6 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors duration-200
                    ${
                      activeTab === item.id
                        ? "bg-green-100 text-green-700 border-r-4 border-green-600"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }
                  `}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center mb-4">
              <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center">
                <span className="text-white font-medium">
                  {user?.full_name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {user?.full_name}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {user?.role?.replace("_", " ")}
                </p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors duration-200"
            >
              <LogOut className="h-4 w-4 mr-3" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <Menu className="h-6 w-6" />
            </button>

            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900 capitalize">
                {activeTab === "dashboard"
                  ? "Dashboard"
                  : activeTab === "users"
                  ? "User Management"
                  : activeTab === "phcs"
                  ? "PHC Management"
                  : activeTab === "staff"
                  ? "Staff Management"
                  : activeTab === "attendance"
                  ? "Attendance Management"
                  : activeTab === "blog"
                  ? "Events & Activities"
                  : activeTab === "activity_logs"
                  ? "Activity Logs"
                  : activeTab === "analytics"
                  ? "Analytics"
                  : activeTab === "settings"
                  ? "Settings"
                  : activeTab}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.username}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
