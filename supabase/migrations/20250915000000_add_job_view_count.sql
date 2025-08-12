-- Adds a view counter for jobs and helper function to increment it
alter table if exists jobs
  add column if not exists view_count integer not null default 0;

create or replace function increment_job_view(job_id uuid)
returns void as $$
  update jobs set view_count = view_count + 1 where id = job_id;
$$ language sql security definer;
