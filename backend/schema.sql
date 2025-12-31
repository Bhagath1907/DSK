-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Enums
create type user_role as enum ('user', 'admin');
create type submission_status as enum ('pending', 'approved', 'rejected');
create type transaction_type as enum ('credit', 'debit');

-- Users Table (extends Supabase Auth)
create table public.users (
  id uuid references auth.users not null primary key,
  email text,
  role user_role default 'user',
  wallet_balance decimal(10, 2) default 0.00,
  privacy_policy_accepted boolean default false,
  accepted_at timestamptz,
  ip_address text,
  created_at timestamptz default now()
);

-- Categories Table
create table public.categories (
  id serial primary key,
  name text not null,
  icon text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Services Table
create table public.services (
  id serial primary key,
  category_id int references public.categories(id),
  name text not null,
  description text,
  price decimal(10, 2) default 0.00,
  logo_url text,
  fields jsonb not null default '[]',
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Submissions Table
create table public.submissions (
  id serial primary key,
  user_id uuid references public.users(id),
  service_id int references public.services(id),
  data jsonb not null default '{}',
  status submission_status default 'pending',
  final_document_url text,
  captcha_verified boolean default false,
  submitted_ip text,
  created_at timestamptz default now()
);

-- Transactions Table
create table public.transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id),
  amount decimal(10, 2) not null,
  type transaction_type not null,
  description text,
  created_at timestamptz default now()
);

-- Login History Table
create table public.login_history (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id),
  ip_address text,
  user_agent text,
  login_at timestamptz default now()
);

-- Triggers for User Creation
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.users (id, email, wallet_balance)
  values (new.id, new.email, 0.00);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- RLS Policies
alter table public.users enable row level security;
alter table public.services enable row level security;
alter table public.submissions enable row level security;
alter table public.transactions enable row level security;
alter table public.login_history enable row level security;

-- Users can view own profile
create policy "Users can view own profile" on public.users 
  for select using (auth.uid() = id);

-- Public services
create policy "Public services are viewable" on public.services
  for select using (is_active = true);

-- Users can view own transactions
create policy "Users can view own transactions" on public.transactions
  for select using (auth.uid() = user_id);

-- Users can view own submissions
create policy "Users can view own submissions" on public.submissions
  for select using (auth.uid() = user_id);

-- Users can view own login history
create policy "Users can view own login history" on public.login_history
  for select using (auth.uid() = user_id);

-- RPC for Service Application (Transaction)
create or replace function public.submit_application(
  p_user_id uuid,
  p_service_id int,
  p_data jsonb
) returns jsonb as $$
declare
  v_price decimal(10, 2);
  v_balance decimal(10, 2);
  v_service_name text;
  v_submission_id int;
begin
  -- Get Service details
  select price, name into v_price, v_service_name
  from public.services where id = p_service_id;
  
  if not found then
    raise exception 'Service not found';
  end if;

  -- Get User Balance
  select wallet_balance into v_balance
  from public.users where id = p_user_id;

  if v_balance < v_price then
    raise exception 'Insufficient wallet balance';
  end if;

  -- Deduct Balance
  update public.users 
  set wallet_balance = wallet_balance - v_price
  where id = p_user_id;

  -- Create Submission
  insert into public.submissions (user_id, service_id, data, status)
  values (p_user_id, p_service_id, p_data, 'pending')
  returning id into v_submission_id;

  -- Create Transaction Record
  insert into public.transactions (user_id, amount, type, description)
  values (p_user_id, v_price, 'debit', 'Application fee for ' || v_service_name);

  return jsonb_build_object(
    'success', true, 
    'submission_id', v_submission_id,
    'new_balance', v_balance - v_price
  );
end;
$$ language plpgsql security definer;

-- Enable Realtime
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;
alter publication supabase_realtime add table public.transactions;
alter publication supabase_realtime add table public.submissions;
alter publication supabase_realtime add table public.users;

-- Create-- Storage Bucket for Final Documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('final-documents', 'final-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow authenticated uploads (Admins, via backend service key usually bypasses this, but good to have)
-- Note: Backend using Service Role Key bypasses RLS, so this is mostly for completeness or if we switch to client-side upload.
-- However, we must ensure the bucket exists.
