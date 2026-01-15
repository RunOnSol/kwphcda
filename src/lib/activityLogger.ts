import { supabase } from './supabase';

export type ActivityType =
  | 'login'
  | 'signup'
  | 'logout'
  | 'staff_search'
  | 'staff_email_create'
  | 'user_upgrade'
  | 'user_approve'
  | 'user_reject'
  | 'blog_post_create'
  | 'blog_post_update'
  | 'blog_post_delete'
  | 'phc_create'
  | 'phc_update'
  | 'phc_delete'
  | 'profile_update';

interface ActivityMetadata {
  [key: string]: any;
}

export const logActivity = async (
  activityType: ActivityType,
  description: string,
  metadata: ActivityMetadata = {}
): Promise<void> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.warn('No authenticated user found for activity logging');
      return;
    }

    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (userProfile?.role === 'super_admin') {
      return;
    }

    const { error } = await supabase.from('user_activity_logs').insert({
      user_id: user.id,
      activity_type: activityType,
      activity_description: description,
      metadata: metadata,
    });

    if (error) {
      console.error('Error logging activity:', error);
    }
  } catch (error) {
    console.error('Error in logActivity:', error);
  }
};

export const getActivityLogs = async (filters?: {
  userId?: string;
  activityType?: ActivityType;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}) => {
  try {
    let query = supabase
      .from('user_activity_logs')
      .select(`
        id,
        user_id,
        activity_type,
        activity_description,
        metadata,
        created_at
      `)
      .order('created_at', { ascending: false });

    if (filters?.userId) {
      query = query.eq('user_id', filters.userId);
    }

    if (filters?.activityType) {
      query = query.eq('activity_type', filters.activityType);
    }

    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate.toISOString());
    }

    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate.toISOString());
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data: logs, error } = await query;

    if (error) throw error;

    if (!logs || logs.length === 0) {
      return { data: [], error: null };
    }

    const uniqueUserIds = [...new Set(logs.map(log => log.user_id))];

    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, full_name, username, role')
      .in('id', uniqueUserIds);

    if (usersError) {
      console.error('Error fetching users:', usersError);
    }

    const userMap = new Map(users?.map(u => [u.id, u]) || []);

    const logsWithUsers = logs.map(log => ({
      ...log,
      user: userMap.get(log.user_id) || null
    }));

    return { data: logsWithUsers, error: null };
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    return { data: null, error };
  }
};

export const getActivityStats = async () => {
  try {
    const { data: totalLogs, error: totalError } = await supabase
      .from('user_activity_logs')
      .select('id', { count: 'exact', head: true });

    const { data: todayLogs, error: todayError } = await supabase
      .from('user_activity_logs')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString());

    const { data: typeStats, error: typeError } = await supabase
      .from('user_activity_logs')
      .select('activity_type')
      .order('created_at', { ascending: false })
      .limit(1000);

    if (totalError || todayError || typeError) {
      throw totalError || todayError || typeError;
    }

    const activityTypeCounts = typeStats?.reduce((acc, log) => {
      acc[log.activity_type] = (acc[log.activity_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      data: {
        total: totalLogs?.length || 0,
        today: todayLogs?.length || 0,
        byType: activityTypeCounts || {},
      },
      error: null,
    };
  } catch (error) {
    console.error('Error fetching activity stats:', error);
    return { data: null, error };
  }
};
