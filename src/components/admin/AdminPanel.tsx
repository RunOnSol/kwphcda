import React, { useState } from "react";

import { Navigate, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import ActivityLogs from "./ActivityLogs";
import AdminLayout from "./AdminLayout";
import Analytics from "./Analytics";
import AttendanceManagement from "./AttendanceManagement";
import BlogManagement from "./BlogManagement";
import Dashboard from "./Dashboard";
import GalleryManagement from "./GalleryManagement";
import PHCManagement from "./PHCManagement";
import Settings from "./Settings";
import StaffManagement from "./StaffManagement";
import UserManagement from "./UserManagement";

const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const navigate = useNavigate();

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  if (user.status !== "approved") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <div className="mb-4">
            <div className="mx-auto h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg
                className="h-8 w-8 text-yellow-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Account Pending Approval
          </h2>
          <p className="text-gray-600 mb-4">
            Your account is currently pending approval. Please wait for an
            administrator to approve your access.
          </p>
          <p className="text-sm text-gray-500">
            You will receive an email notification once your account has been
            approved.
          </p>
          <div className="mt-6">
            <button
              onClick={() => navigate("/dashboard")}
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "users":
        return <UserManagement />;
      case "phcs":
        return <PHCManagement />;
      case "staff":
        return <StaffManagement />;
      case "attendance":
        return <AttendanceManagement />;
      case "blog":
        return <BlogManagement />;
      case "gallery":
        return <GalleryManagement />;
      case "activity_logs":
        return <ActivityLogs />;
      case "analytics":
        return <Analytics />;
      case "settings":
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <AdminLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </AdminLayout>
  );
};

export default AdminPanel;
