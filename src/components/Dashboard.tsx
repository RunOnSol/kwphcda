import React from "react";

import {
  Activity,
  ArrowRight,
  Building2,
  CheckCircle,
  Clock,
  FileText,
  TrendingUp,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleAdminAccess = () => {
    navigate("/dashboard");
  };

  const canAccessAdmin =
    user?.status === "approved" &&
    [
      "super_admin",
      "admin",
      "manager",
      "blogger",
      "phc_administrator",
    ].includes(user?.role || "");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  KWPHCDA Dashboard
                </h1>
                <p className="text-sm text-gray-500">
                  Kwara State Primary Health Care Development Agency
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.full_name}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {user?.role?.replace("_", " ")}
                </p>
              </div>

              <div className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {user?.full_name?.charAt(0).toUpperCase()}
                </span>
              </div>

              <button
                onClick={handleSignOut}
                className="text-gray-500 hover:text-gray-700 text-sm font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {user?.status === "pending" ? (
          // Pending Approval State
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="mb-4">
                <div className="mx-auto h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Account Pending Approval
              </h2>
              <p className="text-gray-600 mb-4">
                Your account is currently pending approval. Please wait for an
                administrator to approve your access.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                You will receive an email notification once your account has
                been approved.
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => navigate("/")}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Return to Homepage
                </button>
                <button
                  onClick={handleSignOut}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Approved User Dashboard
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-6 text-white">
              <h2 className="text-2xl font-bold mb-2">
                Welcome back, {user?.full_name}!
              </h2>
              <p className="text-green-100">
                Access your KWPHCDA dashboard and manage your healthcare
                services.
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Your Role
                    </p>
                    <p className="text-lg font-semibold text-gray-900 capitalize">
                      {user?.role?.replace("_", " ")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Status</p>
                    <p className="text-lg font-semibold text-green-600 capitalize">
                      {user?.status}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-purple-100">
                    <Building2 className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Location
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {user?.lga}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-yellow-100">
                    <Activity className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Ward</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {user?.ward}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  {canAccessAdmin && (
                    <button
                      onClick={handleAdminAccess}
                      className="w-full text-left p-4 rounded-lg border border-gray-200 hover:bg-green-50 hover:border-green-300 transition-all duration-200 group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <TrendingUp className="h-5 w-5 text-green-600 mr-3" />
                          <div>
                            <span className="font-medium text-gray-900">
                              Access Admin Panel
                            </span>
                            <p className="text-sm text-gray-500 mt-1">
                              Manage users, facilities, and content
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-green-600 transition-colors" />
                      </div>
                    </button>
                  )}

                  <button
                    onClick={() => navigate("/")}
                    className="w-full text-left p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-green-600 mr-3" />
                      <div>
                        <span className="font-medium text-gray-900">
                          View Public Site
                        </span>
                        <p className="text-sm text-gray-500 mt-1">
                          Browse news, services, and information
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Account Information
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Email:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {user?.email}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Username:</span>
                    <span className="text-sm font-medium text-gray-900">
                      @{user?.username}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Gender:</span>
                    <span className="text-sm font-medium text-gray-900 capitalize">
                      {user?.gender}
                    </span>
                  </div>
                  {user?.phc && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">PHC:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {user.phc.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* System Status */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                System Status
              </h3>
              <div className="flex items-center p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    All systems operational
                  </p>
                  <p className="text-xs text-gray-500">
                    Last updated: {new Date().toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
