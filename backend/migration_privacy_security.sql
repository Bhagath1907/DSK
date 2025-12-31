-- Migration: Add Privacy Policy and CAPTCHA fields

-- Update Users Table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS privacy_policy_accepted boolean DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS accepted_at timestamptz;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS ip_address text;

-- Update Submissions Table
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS captcha_verified boolean DEFAULT false;
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS submitted_ip text;
