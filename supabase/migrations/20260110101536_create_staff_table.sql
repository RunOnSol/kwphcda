/*
  # Create Staff Management Table

  1. New Tables
    - `staff`
      - `id` (uuid, primary key) - Unique identifier
      - `sn` (text) - Serial number
      - `name` (text) - Full name of staff
      - `psn` (text) - Personal Staff Number
      - `gl` (text) - Grade Level
      - `sex` (text) - Gender (Male/Female)
      - `date_of_birth` (date) - Date of birth
      - `lga` (text) - Local Government Area
      - `date_of_first_appt` (date) - Date of first appointment
      - `date_of_confirmation` (date) - Date of confirmation
      - `date_of_present_appt` (date) - Date of present appointment
      - `qualification` (text) - Educational qualification
      - `rank` (text) - Current rank
      - `cadre` (text) - Staff cadre
      - `parent_mda` (text) - Parent MDA
      - `present_posting` (text) - Present posting location
      - `mobile_number` (text) - Mobile phone number
      - `tier` (text) - Staff tier (Tier 1, 2, 3)
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Record update timestamp

  2. Security
    - Enable RLS on `staff` table
    - Add policy for admins to manage staff
    - Add policy for all authenticated users to view staff

  3. Indexes
    - Index on psn for quick lookups
    - Index on lga for filtering
    - Index on sex for filtering
    - Index on cadre for filtering

  4. Important Notes
    - Staff data is accessible to all authenticated users for viewing
    - Only super_admin and admin can create, update, or delete staff
    - PSN is a unique identifier for staff members
*/

CREATE TABLE IF NOT EXISTS staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sn text NOT NULL,
  name text NOT NULL,
  psn text UNIQUE,
  gl text,
  sex text NOT NULL CHECK (sex IN ('Male', 'Female')),
  date_of_birth date,
  lga text NOT NULL,
  date_of_first_appt date,
  date_of_confirmation date,
  date_of_present_appt date,
  qualification text,
  rank text,
  cadre text,
  parent_mda text DEFAULT 'KWPHCDA',
  present_posting text,
  mobile_number text,
  tier text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_staff_psn ON staff(psn);
CREATE INDEX IF NOT EXISTS idx_staff_lga ON staff(lga);
CREATE INDEX IF NOT EXISTS idx_staff_sex ON staff(sex);
CREATE INDEX IF NOT EXISTS idx_staff_cadre ON staff(cadre);
CREATE INDEX IF NOT EXISTS idx_staff_tier ON staff(tier);
CREATE INDEX IF NOT EXISTS idx_staff_name ON staff(name);

-- Enable RLS
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

-- Policy: All authenticated users can view staff
CREATE POLICY "Authenticated users can view staff"
  ON staff
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Super admins and admins can manage staff
CREATE POLICY "Super admins and admins can insert staff"
  ON staff
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('super_admin', 'admin')
      AND users.status = 'approved'
    )
  );

CREATE POLICY "Super admins and admins can update staff"
  ON staff
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('super_admin', 'admin')
      AND users.status = 'approved'
    )
  );

CREATE POLICY "Super admins and admins can delete staff"
  ON staff
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('super_admin', 'admin')
      AND users.status = 'approved'
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_staff_updated_at
  BEFORE UPDATE ON staff
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();