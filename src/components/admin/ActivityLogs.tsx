import React, { useEffect, useState, useCallback } from 'react';
import { Activity, Calendar, Filter, Search, User, Download } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { getActivityLogs } from '../../lib/activityLogger';
import { useAuth } from '../../context/AuthContext';

interface ActivityLog {
  id: string;
  user_id: string;
  activity_type: string;
  activity_description: string;
  metadata: any;
  created_at: string;
  user: {
    id: string;
    email: string;
    full_name: string;
    username: string;
    role: string;
  } | null;
}

const ACTIVITY_TYPES: { value: string; label: string }[] = [
  { value: 'all', label: 'All Activities' },
  { value: 'login', label: 'Login' },
  { value: 'signup', label: 'Signup' },
  { value: 'logout', label: 'Logout' },
  { value: 'staff_search', label: 'Staff Search' },
  { value: 'staff_email_create', label: 'Staff Email Created' },
  { value: 'user_upgrade', label: 'User Role Change' },
  { value: 'user_approve', label: 'User Approval' },
  { value: 'user_reject', label: 'User Rejection' },
  { value: 'blog_post_create', label: 'Blog Post Created' },
  { value: 'blog_post_update', label: 'Blog Post Updated' },
  { value: 'blog_post_delete', label: 'Blog Post Deleted' },
  { value: 'phc_create', label: 'PHC Created' },
  { value: 'phc_update', label: 'PHC Updated' },
  { value: 'phc_delete', label: 'PHC Deleted' },
  { value: 'profile_update', label: 'Profile Update' },
];

const ActivityLogs: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activityTypeFilter, setActivityTypeFilter] = useState('all');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: '',
  });

  const fetchLogs = async () => {
    try {
      const { data, error } = await getActivityLogs({ limit: 1000 });
      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      toast.error('Failed to fetch activity logs');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = useCallback(() => {
    let filtered = logs;

    if (searchTerm) {
      filtered = filtered.filter((log) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          log.activity_description.toLowerCase().includes(searchLower) ||
          log.user?.email?.toLowerCase().includes(searchLower) ||
          log.user?.full_name?.toLowerCase().includes(searchLower) ||
          log.user?.username?.toLowerCase().includes(searchLower)
        );
      });
    }

    if (activityTypeFilter !== 'all') {
      filtered = filtered.filter((log) => log.activity_type === activityTypeFilter);
    }

    if (dateRange.start) {
      const startDate = new Date(dateRange.start);
      filtered = filtered.filter((log) => new Date(log.created_at) >= startDate);
    }

    if (dateRange.end) {
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((log) => new Date(log.created_at) <= endDate);
    }

    setFilteredLogs(filtered);
  }, [logs, searchTerm, activityTypeFilter, dateRange]);

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const getActivityIcon = (type: string) => {
    const iconClass = 'h-5 w-5';
    switch (type) {
      case 'login':
      case 'logout':
      case 'signup':
        return <User className={iconClass} />;
      case 'blog_post_create':
      case 'blog_post_update':
      case 'blog_post_delete':
        return <Activity className={iconClass} />;
      default:
        return <Activity className={iconClass} />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'login':
      case 'signup':
        return 'bg-green-100 text-green-800';
      case 'logout':
        return 'bg-gray-100 text-gray-800';
      case 'user_upgrade':
      case 'user_approve':
        return 'bg-blue-100 text-blue-800';
      case 'user_reject':
      case 'blog_post_delete':
      case 'phc_delete':
        return 'bg-red-100 text-red-800';
      case 'blog_post_create':
      case 'phc_create':
      case 'staff_email_create':
        return 'bg-purple-100 text-purple-800';
      case 'blog_post_update':
      case 'phc_update':
        return 'bg-yellow-100 text-yellow-800';
      case 'staff_search':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const exportToCSV = () => {
    const headers = ['Date & Time', 'User', 'Email', 'Activity Type', 'Description'];
    const rows = filteredLogs.map((log) => [
      format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss'),
      log.user?.full_name || 'Unknown',
      log.user?.email || 'Unknown',
      log.activity_type,
      log.activity_description,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `activity_logs_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Activity logs exported successfully');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Activity Logs</h2>
          <p className="text-gray-600 mt-1">Monitor user activities and system events</p>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by user or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          <select
            value={activityTypeFilter}
            onChange={(e) => setActivityTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
          >
            {ACTIVITY_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 flex-1"
              placeholder="Start Date"
            />
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 flex-1"
              placeholder="End Date"
            />
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredLogs.length} of {logs.length} activities
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-gray-500">No activity logs found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredLogs.map((log) => (
                <div key={log.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${getActivityColor(log.activity_type)}`}>
                      {getActivityIcon(log.activity_type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">
                            {log.user?.full_name || 'Unknown User'}
                          </span>
                          <span className="text-sm text-gray-500">
                            @{log.user?.username || 'unknown'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="h-4 w-4" />
                          <span>{format(new Date(log.created_at), 'MMM dd, yyyy HH:mm')}</span>
                        </div>
                      </div>

                      <p className="text-gray-700 mb-2">{log.activity_description}</p>

                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActivityColor(
                            log.activity_type
                          )}`}
                        >
                          {log.activity_type.replace(/_/g, ' ')}
                        </span>
                        <span className="text-xs text-gray-500">{log.user?.email}</span>
                        {log.user?.role && (
                          <span className="text-xs text-gray-500 capitalize">
                            Role: {log.user.role.replace(/_/g, ' ')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityLogs;
