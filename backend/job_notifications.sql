-- Create job_notifications table
create table if not exists job_notifications (
  id bigint primary key generated always as identity,
  title text not null,
  description text,
  link text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table job_notifications enable row level security;

-- Policy: active jobs are visible to everyone (public)
create policy "Active jobs are visible to everyone"
  on job_notifications for select
  using ( is_active = true );

-- Policy: Admins can do everything
-- Note: This requires the user to have a custom claim or checking the public.users table.
-- For simplicity in this setup using service role key in backend bypasses RLS,
-- but for frontend client actions (if any), we need policies.
-- Assuming backend does the heavy lifting for admins, we might only need read access for frontend.

-- Allow read access to authenticated users for active jobs (redundant with public policy but good for safety)
create policy "Authenticated users can view active jobs"
  on job_notifications for select
  to authenticated
  using ( is_active = true );
