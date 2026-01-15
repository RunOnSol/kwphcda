import React, { useEffect, useState } from 'react';
import { Users, Building2, FileText, Mail, Activity, TrendingUp, Calendar, Clock, CheckCircle, LogIn } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

interface Stats {
  totalUsers: number;
  pendingUsers: number;
  approvedUsers: number;
  totalPHCs: number;
  totalBlogPosts: number;
  publishedPosts: number;
  totalStaff: number;
  staffEmails: number;
  recentActivities: number;
  totalAttendance: number;
  attendanceToday: number;
  currentlyClocked: number;
  attendanceThisWeek: number;
}

const Analytics: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    pendingUsers: 0,
    approvedUsers: 0,
    totalPHCs: 0,
    totalBlogPosts: 0,
    publishedPosts: 0,
    totalStaff: 0,
    staffEmails: 0,
    recentActivities: 0,
    totalAttendance: 0,
    attendanceToday: 0,
    currentlyClocked: 0,
    attendanceThisWeek: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    try {
      const isRefreshing = !loading;
      if (isRefreshing) {
        setRefreshing(true);
      }

      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        console.warn('No active session found');
        toast.error('Session expired. Please log in again.');
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const [
        usersResult,
        phcsResult,
        blogPostsResult,
        staffResult,
        emailsResult,
        activitiesResult,
        totalAttendanceResult,
        attendanceTodayResult,
        currentlyClockedResult,
        attendanceWeekResult,
      ] = await Promise.all([
        supabase.from('users').select('id, status', { count: 'exact' }),
        supabase.from('phcs').select('id', { count: 'exact' }),
        supabase.from('blog_posts').select('id, status', { count: 'exact' }),
        supabase.from('staff').select('id', { count: 'exact' }),
        supabase.from('staff_emails').select('id', { count: 'exact' }),
        supabase
          .from('user_activity_logs')
          .select('id', { count: 'exact' })
          .gte('created_at', weekAgo.toISOString()),
        supabase.from('attendance_records').select('id', { count: 'exact' }),
        supabase
          .from('attendance_records')
          .select('id', { count: 'exact' })
          .gte('clock_in_time', today.toISOString()),
        supabase
          .from('attendance_records')
          .select('id', { count: 'exact' })
          .eq('status', 'clocked_in'),
        supabase
          .from('attendance_records')
          .select('id', { count: 'exact' })
          .gte('clock_in_time', weekAgo.toISOString()),
      ]);

      if (usersResult.error) {
        console.error('Error fetching users:', usersResult.error);
        throw usersResult.error;
      }
      if (phcsResult.error) {
        console.error('Error fetching PHCs:', phcsResult.error);
        throw phcsResult.error;
      }
      if (blogPostsResult.error) {
        console.error('Error fetching blog posts:', blogPostsResult.error);
        throw blogPostsResult.error;
      }
      if (staffResult.error) {
        console.error('Error fetching staff:', staffResult.error);
        throw staffResult.error;
      }
      if (emailsResult.error) {
        console.error('Error fetching emails:', emailsResult.error);
        throw emailsResult.error;
      }
      if (activitiesResult.error) {
        console.error('Error fetching activities:', activitiesResult.error);
        throw activitiesResult.error;
      }

      const users = usersResult.data || [];
      const blogPosts = blogPostsResult.data || [];

      setStats({
        totalUsers: users.length,
        pendingUsers: users.filter((u) => u.status === 'pending').length,
        approvedUsers: users.filter((u) => u.status === 'approved').length,
        totalPHCs: phcsResult.count || 0,
        totalBlogPosts: blogPosts.length,
        publishedPosts: blogPosts.filter((p) => p.status === 'published').length,
        totalStaff: staffResult.count || 0,
        staffEmails: emailsResult.count || 0,
        recentActivities: activitiesResult.count || 0,
        totalAttendance: totalAttendanceResult.count || 0,
        attendanceToday: attendanceTodayResult.count || 0,
        currentlyClocked: currentlyClockedResult.count || 0,
        attendanceThisWeek: attendanceWeekResult.count || 0,
      });

      if (isRefreshing) {
        toast.success('Analytics refreshed successfully');
      }
    } catch (error: any) {
      console.error('Error fetching analytics:', error);

      if (error?.message?.includes('JWT') || error?.message?.includes('auth')) {
        toast.error('Authentication error. Please log in again.');
      } else {
        toast.error('Failed to load analytics data');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgLight: 'bg-blue-50',
    },
    {
      title: 'Pending Approval',
      value: stats.pendingUsers,
      icon: Users,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
      bgLight: 'bg-yellow-50',
    },
    {
      title: 'Approved Users',
      value: stats.approvedUsers,
      icon: Users,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgLight: 'bg-green-50',
    },
    {
      title: 'PHC Facilities',
      value: stats.totalPHCs,
      icon: Building2,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgLight: 'bg-purple-50',
    },
    {
      title: 'Total Staff',
      value: stats.totalStaff,
      icon: Users,
      color: 'bg-indigo-500',
      textColor: 'text-indigo-600',
      bgLight: 'bg-indigo-50',
    },
    {
      title: 'Staff Emails Created',
      value: stats.staffEmails,
      icon: Mail,
      color: 'bg-pink-500',
      textColor: 'text-pink-600',
      bgLight: 'bg-pink-50',
    },
    {
      title: 'Blog Posts',
      value: stats.totalBlogPosts,
      icon: FileText,
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
      bgLight: 'bg-orange-50',
    },
    {
      title: 'Published Posts',
      value: stats.publishedPosts,
      icon: FileText,
      color: 'bg-teal-500',
      textColor: 'text-teal-600',
      bgLight: 'bg-teal-50',
    },
    {
      title: 'Activities (7 days)',
      value: stats.recentActivities,
      icon: Activity,
      color: 'bg-red-500',
      textColor: 'text-red-600',
      bgLight: 'bg-red-50',
    },
    {
      title: 'Total Attendance Records',
      value: stats.totalAttendance,
      icon: Clock,
      color: 'bg-cyan-500',
      textColor: 'text-cyan-600',
      bgLight: 'bg-cyan-50',
    },
    {
      title: 'Attendance Today',
      value: stats.attendanceToday,
      icon: LogIn,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-600',
      bgLight: 'bg-emerald-50',
    },
    {
      title: 'Currently Clocked In',
      value: stats.currentlyClocked,
      icon: CheckCircle,
      color: 'bg-lime-500',
      textColor: 'text-lime-600',
      bgLight: 'bg-lime-50',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-600 mt-1">System overview and statistics</p>
        </div>
        <button
          onClick={fetchAnalytics}
          disabled={refreshing}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            refreshing
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700'
          } text-white`}
        >
          {refreshing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Refreshing...
            </>
          ) : (
            <>
              <TrendingUp className="h-4 w-4" />
              Refresh Data
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className={`text-3xl font-bold mt-2 ${card.textColor}`}>
                    {card.value.toLocaleString()}
                  </p>
                </div>
                <div className={`${card.bgLight} p-3 rounded-full`}>
                  <Icon className={`h-8 w-8 ${card.textColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Statistics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total Registered</span>
              <span className="font-semibold text-blue-600">{stats.totalUsers}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: '100%' }}
              ></div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <span className="text-gray-600">Approved Users</span>
              <span className="font-semibold text-green-600">{stats.approvedUsers}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{
                  width: `${stats.totalUsers > 0 ? (stats.approvedUsers / stats.totalUsers) * 100 : 0}%`,
                }}
              ></div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <span className="text-gray-600">Pending Approval</span>
              <span className="font-semibold text-yellow-600">{stats.pendingUsers}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-yellow-500 h-2 rounded-full"
                style={{
                  width: `${stats.totalUsers > 0 ? (stats.pendingUsers / stats.totalUsers) * 100 : 0}%`,
                }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Statistics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total Blog Posts</span>
              <span className="font-semibold text-orange-600">{stats.totalBlogPosts}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-orange-500 h-2 rounded-full"
                style={{ width: '100%' }}
              ></div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <span className="text-gray-600">Published Posts</span>
              <span className="font-semibold text-teal-600">{stats.publishedPosts}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-teal-500 h-2 rounded-full"
                style={{
                  width: `${stats.totalBlogPosts > 0 ? (stats.publishedPosts / stats.totalBlogPosts) * 100 : 0}%`,
                }}
              ></div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <span className="text-gray-600">PHC Facilities</span>
              <span className="font-semibold text-purple-600">{stats.totalPHCs}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-purple-500 h-2 rounded-full" style={{ width: '75%' }}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">System Activity</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
            <p className="text-sm text-blue-800 font-medium mb-1">Activities This Week</p>
            <p className="text-2xl font-bold text-blue-900">{stats.recentActivities}</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
            <p className="text-sm text-green-800 font-medium mb-1">Staff Emails Created</p>
            <p className="text-2xl font-bold text-green-900">{stats.staffEmails}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
            <p className="text-sm text-purple-800 font-medium mb-1">Total Staff Records</p>
            <p className="text-2xl font-bold text-purple-900">{stats.totalStaff}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Attendance Statistics</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Total Attendance Records</span>
            <span className="font-semibold text-cyan-600">{stats.totalAttendance}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-cyan-500 h-2 rounded-full"
              style={{ width: '100%' }}
            ></div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <span className="text-gray-600">Attendance This Week</span>
            <span className="font-semibold text-blue-600">{stats.attendanceThisWeek}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full"
              style={{
                width: `${stats.totalAttendance > 0 ? (stats.attendanceThisWeek / stats.totalAttendance) * 100 : 0}%`,
              }}
            ></div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <span className="text-gray-600">Attendance Today</span>
            <span className="font-semibold text-emerald-600">{stats.attendanceToday}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-emerald-500 h-2 rounded-full"
              style={{
                width: `${stats.attendanceThisWeek > 0 ? (stats.attendanceToday / stats.attendanceThisWeek) * 100 : 0}%`,
              }}
            ></div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <span className="text-gray-600">Currently Clocked In</span>
            <span className="font-semibold text-lime-600">{stats.currentlyClocked}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-lime-500 h-2 rounded-full"
              style={{
                width: `${stats.attendanceToday > 0 ? (stats.currentlyClocked / stats.attendanceToday) * 100 : 0}%`,
              }}
            ></div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <p className="text-sm text-blue-800">
          <span className="font-semibold">Note:</span> Analytics data is updated in real-time. Use
          the refresh button to get the latest statistics.
        </p>
      </div>
    </div>
  );
};

export default Analytics;
