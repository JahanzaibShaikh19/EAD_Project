-- Enable RLS on all tables
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Note: Since the backend connects using the `postgres` role (superuser), 
-- it automatically bypasses RLS for all database operations.
-- By enabling RLS here without adding explicit ALLOW policies for the `anon` or `authenticated` roles,
-- we are effectively DENYING all direct access to the database via the Supabase REST/GraphQL APIs,
-- forcing all traffic to go through your secure Express.js backend.

-- (Optional) If you ever use Supabase Auth and want to allow authenticated users to read announcements:
-- CREATE POLICY "Announcements are viewable by authenticated users" ON announcements FOR SELECT TO authenticated USING (true);

-- Enable RLS on the Storage bucket for employee photos (if using Supabase Storage)
-- Allow public read access to the bucket
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'employee-photos');

-- Allow the backend (using anon key temporarily) to upload files. 
-- *Ideally*, the backend should use the SERVICE_ROLE_KEY to bypass this.
CREATE POLICY "Anon Uploads" 
ON storage.objects FOR INSERT 
TO anon 
WITH CHECK (bucket_id = 'employee-photos');
