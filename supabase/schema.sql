-- Create entries table
create table entries (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  type text check (type in ('mind', 'body', 'soul')) not null,
  title text,
  content text,
  category text,
  mood text,
  created_at timestamptz default now()
);

-- Enable RLS
alter table entries enable row level security;

-- Create policies
create policy "Users can create their own entries"
  on entries for insert
  with check (auth.uid() = user_id);

create policy "Users can view their own entries"
  on entries for select
  using (auth.uid() = user_id);

create policy "Users can update their own entries"
  on entries for update
  using (auth.uid() = user_id);

create policy "Users can delete their own entries"
  on entries for delete
  using (auth.uid() = user_id);
