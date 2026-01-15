import React, { useEffect, useState } from 'react';
import { getAllUsers, updateUserProfile } from '../../lib/supabase';
import { User, USER_ROLES } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Check, X, Edit, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { logActivity } from '../../lib/activityLogger';

const UserManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await getAllUsers();
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUser = async (userId: string) => {
    try {
      const targetUser = users.find(u => u.id === userId);
      const { error } = await updateUserProfile(userId, { status: 'approved' });
      if (error) throw error;

      setUsers(users.map(user =>
        user.id === userId ? { ...user, status: 'approved' as const } : user
      ));
      toast.success('User approved successfully');

      if (targetUser) {
        logActivity('user_approve', `Approved user: ${targetUser.email}`, {
          target_user_id: userId,
          target_user_email: targetUser.email,
          target_user_name: targetUser.full_name,
        });
      }
    } catch (error) {
      console.error('Error approving user:', error);
      toast.error('Failed to approve user');
    }
  };

  const handleRejectUser = async (userId: string) => {
    try {
      const targetUser = users.find(u => u.id === userId);
      const { error } = await updateUserProfile(userId, { status: 'rejected' });
      if (error) throw error;

      setUsers(users.map(user =>
        user.id === userId ? { ...user, status: 'rejected' as const } : user
      ));
      toast.success('User rejected');

      if (targetUser) {
        logActivity('user_reject', `Rejected user: ${targetUser.email}`, {
          target_user_id: userId,
          target_user_email: targetUser.email,
          target_user_name: targetUser.full_name,
        });
      }
    } catch (error) {
      console.error('Error rejecting user:', error);
      toast.error('Failed to reject user');
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const targetUser = users.find(u => u.id === userId);
      const oldRole = targetUser?.role;
      const { error } = await updateUserProfile(userId, { role: newRole });
      if (error) throw error;

      setUsers(users.map(user =>
        user.id === userId ? { ...user, role: newRole as any } : user
      ));
      toast.success('User role updated successfully');

      if (targetUser) {
        logActivity('user_upgrade', `Updated user role: ${targetUser.email} from ${oldRole} to ${newRole}`, {
          target_user_id: userId,
          target_user_email: targetUser.email,
          target_user_name: targetUser.full_name,
          old_role: oldRole,
          new_role: newRole,
        });
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    }
  };

  const canManageUser = (user: User) => {
    if (currentUser?.role === 'super_admin') return true;
    if (currentUser?.role === 'admin' && user.role !== 'super_admin') return true;
    if (currentUser?.role === 'phc_administrator' && user.phc_id === currentUser.phc_id && user.role === 'user') return true;
    return false;
  };

  const getAvailableRoles = (user: User) => {
    if (currentUser?.role === 'super_admin') {
      return USER_ROLES;
    }

    if (currentUser?.role === 'admin') {
      // Admins cannot assign super_admin role
      // Also, admins cannot upgrade themselves to super_admin
      if (user.id === currentUser.id) {
        return USER_ROLES.filter(role => role.value !== 'super_admin');
      }
      return USER_ROLES.filter(role => role.value !== 'super_admin');
    }

    return USER_ROLES;
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;

    // Hide super_admin users from regular admins
    const canSeeUser = currentUser?.role === 'super_admin' || user.role !== 'super_admin';

    return matchesSearch && matchesStatus && matchesRole && canSeeUser;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
          >
            <option value="all">All Roles</option>
            {USER_ROLES.filter(role =>
              currentUser?.role === 'super_admin' || role.value !== 'super_admin'
            ).map(role => (
              <option key={role.value} value={role.value}>{role.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                      <div className="text-xs text-gray-400">@{user.username}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.lga}</div>
                    <div className="text-sm text-gray-500">{user.ward}</div>
                    {user.phc && (
                      <div className="text-xs text-gray-400">{user.phc.name}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {canManageUser(user) ? (
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-green-500 focus:border-green-500"
                      >
                        {getAvailableRoles(user).map(role => (
                          <option key={role.value} value={role.value}>{role.label}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                        {user.role.replace('_', ' ')}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.status === 'approved' ? 'bg-green-100 text-green-800' :
                      user.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {canManageUser(user) && user.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApproveUser(user.id)}
                          className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-100"
                          title="Approve user"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleRejectUser(user.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-100"
                          title="Reject user"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No users found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;