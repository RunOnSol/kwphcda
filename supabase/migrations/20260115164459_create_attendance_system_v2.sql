/*
  # Staff Attendance System

  ## Overview
  Creates a comprehensive attendance tracking system with approval code verification.

  ## New Tables
  
  ### `attendance_records`
  Stores all staff clock-in and clock-out records
  - `id` (uuid, primary key) - Unique record identifier
  - `staff_id` (uuid, nullable) - References staff if they exist in system
  - `psn` (text) - Personal Service Number
  - `gender` (text) - Staff gender
  - `staff_name` (text) - Full name of staff member
  - `staff_email` (text, nullable) - Staff email
  - `staff_phone` (text, nullable) - Staff phone number
  - `clock_in_time` (timestamptz) - When staff clocked in
  - `clock_out_time` (timestamptz, nullable) - When staff clocked out
  - `approval_code_in` (text) - Code used for clock in approval
  - `approval_code_out` (text, nullable) - Code used for clock out approval
  - `status` (text) - Record status (clocked_in, clocked_out)
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `attendance_approval_codes`
  Stores generated approval codes with expiry
  - `id` (uuid, primary key) - Unique code identifier
  - `code` (text, unique) - 6-digit approval code
  - `generated_by` (uuid) - Admin who generated the code
  - `expires_at` (timestamptz) - Code expiration time (30 seconds)
  - `is_active` (boolean) - Whether code is currently active
  - `created_at` (timestamptz) - Code generation timestamp

  ## Security
  - Enable RLS on both tables
  - attendance_records: Anyone can insert (for public clock in/out)
  - attendance_records: Anyone can view records
  - attendance_records: Only authenticated users can update/delete
  - attendance_approval_codes: Anyone can view active codes for verification
  - attendance_approval_codes: Only authenticated users can manage codes

  ## Indexes
  - Index on psn for quick staff lookup
  - Index on clock_in_time for date range queries
  - Index on code for quick verification
  - Index on expires_at for cleanup queries
*/

-- Create attendance_records table
CREATE TABLE IF NOT EXISTS attendance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid,
  psn text NOT NULL,
  gender text NOT NULL,
  staff_name text NOT NULL,
  staff_email text,
  staff_phone text,
  clock_in_time timestamptz NOT NULL DEFAULT now(),
  clock_out_time timestamptz,
  approval_code_in text NOT NULL,
  approval_code_out text,
  status text NOT NULL DEFAULT 'clocked_in' CHECK (status IN ('clocked_in', 'clocked_out')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create attendance_approval_codes table
CREATE TABLE IF NOT EXISTS attendance_approval_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  generated_by uuid,
  expires_at timestamptz NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_attendance_records_psn ON attendance_records(psn);
CREATE INDEX IF NOT EXISTS idx_attendance_records_clock_in ON attendance_records(clock_in_time);
CREATE INDEX IF NOT EXISTS idx_attendance_records_status ON attendance_records(status);
CREATE INDEX IF NOT EXISTS idx_attendance_codes_code ON attendance_approval_codes(code);
CREATE INDEX IF NOT EXISTS idx_attendance_codes_expires ON attendance_approval_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_attendance_codes_active ON attendance_approval_codes(is_active);

-- Enable RLS
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_approval_codes ENABLE ROW LEVEL SECURITY;

-- Policies for attendance_records
CREATE POLICY "Anyone can insert attendance records"
  ON attendance_records FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can view attendance records"
  ON attendance_records FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can update attendance records"
  ON attendance_records FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete attendance records"
  ON attendance_records FOR DELETE
  TO authenticated
  USING (true);

-- Policies for attendance_approval_codes
CREATE POLICY "Anyone can view active codes"
  ON attendance_approval_codes FOR SELECT
  TO public
  USING (is_active = true AND expires_at > now());

CREATE POLICY "Authenticated users can insert codes"
  ON attendance_approval_codes FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update codes"
  ON attendance_approval_codes FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete codes"
  ON attendance_approval_codes FOR DELETE
  TO authenticated
  USING (true);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_attendance_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS attendance_records_updated_at ON attendance_records;
CREATE TRIGGER attendance_records_updated_at
  BEFORE UPDATE ON attendance_records
  FOR EACH ROW
  EXECUTE FUNCTION update_attendance_updated_at();

-- Function to deactivate expired codes
CREATE OR REPLACE FUNCTION deactivate_expired_codes()
RETURNS void AS $$
BEGIN
  UPDATE attendance_approval_codes
  SET is_active = false
  WHERE expires_at <= now() AND is_active = true;
END;
$$ LANGUAGE plpgsql;