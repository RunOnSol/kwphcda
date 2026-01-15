import React, { useEffect, useState } from 'react';
import { Users, Building2, FileText, TrendingUp, Clock, CheckCircle, Key } from 'lucide-react';
import { getAllUsers, getAllPHCs, getAllBlogPosts, supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingUsers: 0,
    totalPHCs: 0,
    activePHCs: 0,
    totalPosts: 0,
    publishedPosts: 0,
    attendanceToday: 0,
    currentlyClocked: 0,
  });
  const [loading, setLoading] = useState(true);
  const [approvalCode, setApprovalCode] = useState('');
  const [codeExpiry, setCodeExpiry] = useState<Date | null>(null);
  const [generatingCode, setGeneratingCode] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [usersResult, phcsResult, postsResult, attendanceResult, clockedInResult] = await Promise.all([
          getAllUsers(),
          getAllPHCs(),
          getAllBlogPosts(),
          supabase
            .from('attendance_records')
            .select('*', { count: 'exact' })
            .gte('clock_in_time', today.toISOString()),
          supabase
            .from('attendance_records')
            .select('*', { count: 'exact' })
            .eq('status', 'clocked_in'),
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
          attendanceToday: attendanceResult.count || 0,
          currentlyClocked: clockedInResult.count || 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const generateApprovalCode = async () => {
    setGeneratingCode(true);
    try {
      await supabase
        .from('attendance_approval_codes')
        .update({ is_active: false })
        .eq('is_active', true);

      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 30000);

      const { error } = await supabase
        .from('attendance_approval_codes')
        .insert({
          code,
          generated_by: user?.id,
          expires_at: expiresAt.toISOString(),
          is_active: true,
        });

      if (error) throw error;

      setApprovalCode(code);
      setCodeExpiry(expiresAt);
      toast.success('Approval code generated!');

      setTimeout(() => {
        setApprovalCode('');
        setCodeExpiry(null);
      }, 30000);
    } catch (error: any) {
      toast.error('Error generating approval code');
    } finally {
      setGeneratingCode(false);
    }
  };

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
      color: 'bg-teal-500',
      textColor: 'text-teal-600',
      bgColor: 'bg-teal-50',
    },
    {
      title: 'Currently Clocked In',
      value: stats.currentlyClocked,
      icon: CheckCircle,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      title: 'Attendance Today',
      value: stats.attendanceToday,
      icon: TrendingUp,
      textColor: 'text-orange-600',
      bgColor: 'bg-orange-50',
      color: 'bg-orange-500',
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

      {/* Attendance Code Generator */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold mb-1">Attendance Approval Code</h3>
            <p className="text-blue-100 text-sm">Generate a 6-digit code for staff attendance approval</p>
          </div>
          <Key className="w-10 h-10 text-blue-200" />
        </div>

        {approvalCode ? (
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="text-5xl font-bold text-blue-600 tracking-widest mb-3">
              {approvalCode}
            </div>
            <div className="text-gray-600 text-sm mb-3">
              Expires in {codeExpiry ? Math.max(0, Math.ceil((codeExpiry.getTime() - Date.now()) / 1000)) : 0}s
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-1000"
                style={{
                  width: codeExpiry ? `${Math.max(0, ((codeExpiry.getTime() - Date.now()) / 30000) * 100)}%` : '0%'
                }}
              />
            </div>
          </div>
        ) : (
          <button
            onClick={generateApprovalCode}
            disabled={generatingCode}
            className="w-full bg-white text-blue-600 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors disabled:opacity-50"
          >
            {generatingCode ? 'Generating...' : 'Generate New Code'}
          </button>
        )}
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