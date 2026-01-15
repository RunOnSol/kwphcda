import React, { useEffect, useState } from 'react';
import { Users, Building2, FileText, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { getAllUsers, getAllPHCs, getAllBlogPosts } from '../../lib/supabase';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingUsers: 0,
    totalPHCs: 0,
    activePHCs: 0,
    totalPosts: 0,
    publishedPosts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersResult, phcsResult, postsResult] = await Promise.all([
          getAllUsers(),
          getAllPHCs(),
          getAllBlogPosts(),
        ]);

        const users = usersResult.data || [];
        const phcs = phcsResult.data || [];
        const posts = postsResult.data || [];

        setStats({
          totalUsers: users.length,
          pendingUsers: users.filter(u => u.status === 'pending').length,
          totalPHCs: phcs.length,
          activePHCs: phcs.filter(p => p.status === 'active').length,
          totalPosts: posts.length,
          publishedPosts: posts.filter(p => p.status === 'published').length,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Pending Approvals',
      value: stats.pendingUsers,
      icon: Clock,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Active PHCs',
      value: stats.activePHCs,
      icon: Building2,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Published Posts',
      value: stats.publishedPosts,
      icon: FileText,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome to KWPHCDA Admin Dashboard</h2>
        <p className="text-green-100">
          Manage users, PHC facilities, and content for Kwara State Primary Health Care Development Agency
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className={`${stat.bgColor} rounded-lg p-6 border border-gray-200`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className={`text-3xl font-bold ${stat.textColor}`}>{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-full`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="flex items-center">
                <Users className="h-5 w-5 text-green-600 mr-3" />
                <span className="font-medium">Review Pending Users</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {stats.pendingUsers} users waiting for approval
              </p>
            </button>
            
            <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="flex items-center">
                <Building2 className="h-5 w-5 text-green-600 mr-3" />
                <span className="font-medium">Add New PHC</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Register a new primary health care facility
              </p>
            </button>
            
            <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-green-600 mr-3" />
                <span className="font-medium">Create Blog Post</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Share news and updates with the community
              </p>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Overview</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">User Approval Rate</span>
              <span className="text-sm font-medium text-green-600">
                {stats.totalUsers > 0 ? Math.round(((stats.totalUsers - stats.pendingUsers) / stats.totalUsers) * 100) : 0}%
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active PHC Facilities</span>
              <span className="text-sm font-medium text-green-600">
                {stats.activePHCs} / {stats.totalPHCs}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Content Publication Rate</span>
              <span className="text-sm font-medium text-green-600">
                {stats.totalPosts > 0 ? Math.round((stats.publishedPosts / stats.totalPosts) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-900">System initialized successfully</p>
              <p className="text-xs text-gray-500">Dashboard is ready for use</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;