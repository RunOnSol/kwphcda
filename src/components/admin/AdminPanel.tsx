import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from './AdminLayout';
import Dashboard from './Dashboard';
import UserManagement from './UserManagement';
import PHCManagement from './PHCManagement';
import BlogManagement from './BlogManagement';

const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!user || user.status !== 'approved') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <div className="mb-4">
            <div className="mx-auto h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Account Pending Approval</h2>
          <p className="text-gray-600 mb-4">
            Your account is currently pending approval. Please wait for an administrator to approve your access.
          </p>
          <p className="text-sm text-gray-500">
            You will receive an email notification once your account has been approved.
          </p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'users':
        return <UserManagement />;
      case 'phcs':
        return <PHCManagement />;
      case 'blog':
        return <BlogManagement />;
      case 'analytics':
        return <div className="text-center py-12"><p className="text-gray-500">Analytics coming soon...</p></div>;
      case 'settings':
        return <div className="text-center py-12"><p className="text-gray-500">Settings coming soon...</p></div>;
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