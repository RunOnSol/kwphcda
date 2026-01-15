/*
  # Create User Activity Logs System

  1. New Tables
    - `user_activity_logs`
      - `id` (uuid, primary key) - Unique identifier for each log entry
      - `user_id` (uuid, foreign key) - Reference to the user who performed the action
      - `activity_type` (text) - Type of activity (login, signup, staff_search, user_upgrade, blog_post_create, blog_post_update, blog_post_delete, etc.)
      - `activity_description` (text) - Detailed description of the activity
      - `metadata` (jsonb) - Additional metadata about the activity (IP address, user agent, affected resources, etc.)
      - `created_at` (timestamptz) - Timestamp when the activity occurred

  2. Security
    - Enable RLS on `user_activity_logs` table
    - Add policy for super_admin to view all logs
    - Add policy for admin to view non-super_admin logs
    - Add policy for authenticated users to create logs (system will use this)

  3. Indexes
    - Index on user_id for faster lookups
    - Index on activity_type for filtering
    - Index on created_at for time-based queries

  4. Important Notes
    - Activity logs are NOT created for super_admin users
    - Admin users can only see logs of non-super_admin users
    - All activities (login, signup, searches, updates, etc.) are logged for audit purposes
*/

CREATE TABLE IF NOT EXISTS user_activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  activity_type text NOT NULL,
  activity_description text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user_id ON user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_activity_type ON user_activity_logs(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_created_at ON user_activity_logs(created_at DESC);

-- Enable RLS
ALTER TABLE user_activity_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to insert logs (for system logging)
CREATE POLICY "Authenticated users can create activity logs"
  ON user_activity_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Super admin can view all logs
CREATE POLICY "Super admin can view all activity logs"
  ON user_activity_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'super_admin'
      AND users.status = 'approved'
    )
  );

-- Policy: Admin can view logs except for super_admin activities
CREATE POLICY "Admin can view non-super-admin activity logs"
  ON user_activity_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
      AND users.status = 'approved'
    )
    AND NOT EXISTS (
      SELECT 1 FROM users
      WHERE users.id = user_activity_logs.user_id
      AND users.role = 'super_admin'
    )
  );