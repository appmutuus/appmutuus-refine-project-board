-- Notification system tables

create table if not exists notification_settings (
  user_id uuid primary key references profiles(user_id) on delete cascade,
  job_updates boolean default true,
  new_messages boolean default true,
  karma_changes boolean default false,
  promotions boolean default true,
  weekly_digest boolean default true,
  language text default 'de',
  quiet_hours_start time default '22:00',
  quiet_hours_end time default '07:00',
  updated_at timestamptz default now()
);

create table if not exists device_tokens (
  id bigserial primary key,
  user_id uuid references profiles(user_id) on delete cascade,
  provider text check (provider in ('onesignal','fcm','apns')),
  token text not null,
  platform text check (platform in ('ios','android','web')),
  last_seen timestamptz default now(),
  unique(user_id, token)
);

create table if not exists notification_events (
  id bigserial primary key,
  user_id uuid references profiles(user_id),
  channel text check (channel in ('push','email','inapp')),
  type text,
  priority text check (priority in ('low','medium','high','critical')),
  status text check (status in ('queued','sent','delivered','opened','clicked','bounced','failed','unsub')),
  dedupe_key text,
  meta jsonb,
  created_at timestamptz default now()
);
create index if not exists idx_notif_user on notification_events(user_id);
create index if not exists idx_notif_type on notification_events(type, channel);
create index if not exists idx_notif_dedupe on notification_events(dedupe_key);

create table if not exists email_events (
  id bigserial primary key,
  user_id uuid references profiles(user_id),
  email_type text,
  event text check (event in ('sent','opened','clicked','bounced','unsub')),
  meta jsonb,
  created_at timestamptz default now()
);

create table if not exists consent_log (
  id bigserial primary key,
  user_id uuid references profiles(user_id),
  action text check (action in ('opt_in','opt_out','unsubscribed','dob_confirmed')),
  channel text check (channel in ('email','push','sms','inapp')),
  meta jsonb,
  created_at timestamptz default now()
);

-- RLS
alter table notification_settings enable row level security;
create policy "select own settings" on notification_settings for select using (auth.uid() = user_id);
create policy "update own settings" on notification_settings for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table device_tokens enable row level security;
create policy "select own tokens" on device_tokens for select using (auth.uid() = user_id);
create policy "insert own tokens" on device_tokens for insert with check (auth.uid() = user_id);
create policy "delete own tokens" on device_tokens for delete using (auth.uid() = user_id);

alter table notification_events enable row level security;
create policy "select own events" on notification_events for select using (auth.uid() = user_id);

alter table email_events enable row level security;
create policy "select own email events" on email_events for select using (auth.uid() = user_id);

alter table consent_log enable row level security;
create policy "select own consent" on consent_log for select using (auth.uid() = user_id);
