create table if not exists jobs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(user_id) not null,
  title varchar(100) not null,
  description text not null,
  mode varchar(20) not null check (mode in ('goodDeeds','paid')),
  price numeric(10,2),
  category varchar(50),
  location geography(point),
  status varchar(20) default 'open' check (status in ('open','in_progress','completed','canceled')),
  deadline timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_jobs_user on jobs(user_id);
create index if not exists idx_jobs_status on jobs(status);
