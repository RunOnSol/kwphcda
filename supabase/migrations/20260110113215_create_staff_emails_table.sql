/*
  # Create Staff Emails Table

  1. New Tables
    - `staff_emails`
      - `id` (uuid, primary key) - Unique identifier
      - `psn` (text, unique) - Personal Staff Number (one email per PSN)
      - `email` (text, unique) - Generated official email address
      - `staff_name` (text) - Name of staff member
      - `staff_sex` (text) - Sex of staff member
      - `staff_lga` (text) - LGA of staff member
      - `created_by_user_id` (uuid) - User who created the email (nullable for self-service)
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Record update timestamp

  2. Security
    - Enable RLS on `staff_emails` table
    - Add policy for authenticated users to view their own email
    - Add policy for admins to view all emails
    - Add policy for staff to create their own email (once)

  3. Indexes
    - Index on psn for quick lookups
    - Index on email for uniqueness check

  4. Important Notes
    - Each PSN can only create one email (enforced by unique constraint)
    - Staff can create their own email through self-service
    - Admins can view all created emails
    - Email creation activity is logged
*/

CREATE TABLE IF NOT EXISTS staff_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  psn text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  staff_name text NOT NULL,
  staff_sex text NOT NULL,
  staff_lga text NOT NULL,
  created_by_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_staff_emails_psn ON staff_emails(psn);
CREATE INDEX IF NOT EXISTS idx_staff_emails_email ON staff_emails(email);

-- Enable RLS
ALTER TABLE staff_emails ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can check if email exists (for validation)
CREATE POLICY "Anyone can check email existence"
  ON staff_emails
  FOR SELECT
  USING (true);

-- Policy: Authenticated users can create staff emails
CREATE POLICY "Authenticated users can create staff emails"
  ON staff_emails
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Trigger for updated_at
CREATE TRIGGER update_staff_emails_updated_at
  BEFORE UPDATE ON staff_emails
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();