-- Enable RLS on categories table
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Allow public read access to categories (so users can see them)
CREATE POLICY "Public categories are viewable by everyone" ON categories
FOR SELECT USING (true);

-- Allow admins to insert/update/delete categories
CREATE POLICY "Admins can manage categories" ON categories
FOR ALL USING (
  auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
);
