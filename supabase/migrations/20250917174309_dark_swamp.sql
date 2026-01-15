/*
  # Seed Initial Data for KWPHCDA

  1. Sample PHC Facilities
  2. Sample Blog Posts
  3. Initial Super Admin User (will be created when first user signs up)

  Note: The first user to sign up should be manually promoted to super_admin
*/

-- Insert sample PHC facilities
INSERT INTO phcs (name, lga, ward, address, phone, email, services, staff_count, status) VALUES
('Ilorin Central PHC', 'Ilorin East', 'Adewole', 'No. 15 Adewole Road, Ilorin', '+234 803 123 4567', 'ilorincentral@kwphcda.gov.ng', ARRAY['Immunization', 'Maternal Care', 'Child Health', 'Family Planning', 'Laboratory Services'], 15, 'active'),
('Offa Township PHC', 'Offa', 'Offa Central', 'Offa-Ilorin Road, Offa', '+234 805 234 5678', 'offa@kwphcda.gov.ng', ARRAY['Immunization', 'Maternal Care', 'Child Health', 'Disease Control'], 12, 'active'),
('Lafiagi Community PHC', 'Edu', 'Lafiagi', 'Lafiagi Town, Edu LGA', '+234 807 345 6789', 'lafiagi@kwphcda.gov.ng', ARRAY['Immunization', 'Maternal Care', 'Nutrition Services', 'Health Education'], 10, 'active'),
('Omu-Aran Health Center', 'Irepodun', 'Omu-Aran', 'Omu-Aran Township', '+234 809 456 7890', 'omuaran@kwphcda.gov.ng', ARRAY['Immunization', 'Maternal Care', 'Child Health', 'Emergency Care'], 14, 'active'),
('Patigi PHC', 'Patigi', 'Patigi Central', 'Patigi Town Center', '+234 811 567 8901', 'patigi@kwphcda.gov.ng', ARRAY['Immunization', 'Maternal Care', 'Family Planning', 'Disease Control'], 11, 'active'),
('Kaiama Health Center', 'Kaiama', 'Kaiama Central', 'Kaiama Main Road', '+234 813 678 9012', 'kaiama@kwphcda.gov.ng', ARRAY['Immunization', 'Maternal Care', 'Child Health', 'Nutrition Services'], 9, 'active'),
('Baruten PHC', 'Baruten', 'Kosubosu', 'Kosubosu Village, Baruten', '+234 815 789 0123', 'baruten@kwphcda.gov.ng', ARRAY['Immunization', 'Maternal Care', 'Disease Control', 'Health Education'], 8, 'active'),
('Asa PHC', 'Asa', 'Afon', 'Afon Community, Asa LGA', '+234 817 890 1234', 'asa@kwphcda.gov.ng', ARRAY['Immunization', 'Maternal Care', 'Child Health', 'Family Planning'], 13, 'active'),
('Ekiti PHC', 'Ekiti', 'Araromi', 'Araromi Ward, Ekiti LGA', '+234 819 901 2345', 'ekiti@kwphcda.gov.ng', ARRAY['Immunization', 'Maternal Care', 'Nutrition Services', 'Laboratory Services'], 10, 'active'),
('Ifelodun PHC', 'Ifelodun', 'Share', 'Share Township, Ifelodun', '+234 821 012 3456', 'ifelodun@kwphcda.gov.ng', ARRAY['Immunization', 'Maternal Care', 'Child Health', 'Disease Control'], 12, 'active');

-- Note: Blog posts will be created by users through the admin interface
-- Sample blog posts can be added here if needed for testing

-- Insert a sample blog post (this will need a valid author_id after a user is created)
-- The first super admin can create initial blog posts through the interface