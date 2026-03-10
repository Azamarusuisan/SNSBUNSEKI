-- SNS Growth Operating System - Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- profiles
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- workspaces
create table workspaces (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  name text not null default 'My Workspace',
  goal_followers integer default 10000,
  primary_platform text default 'x',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- social_accounts
create table social_accounts (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  platform text not null check (platform in ('x', 'instagram', 'note')),
  account_name text not null default '',
  niche text default '',
  target_audience text default '',
  current_followers integer default 0,
  goal_followers integer default 10000,
  posting_style text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- daily_tasks
create table daily_tasks (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  task_date date not null,
  platform text check (platform in ('x', 'instagram', 'note', 'general')),
  task_type text not null check (task_type in ('write_post', 'publish_post', 'write_note', 'analyze', 'create_script', 'research', 'review', 'engage')),
  title text not null,
  description text default '',
  scheduled_time time,
  estimated_minutes integer default 15,
  priority integer default 2 check (priority between 1 and 3),
  status text not null default 'todo' check (status in ('todo', 'done', 'postponed', 'skipped')),
  generated_by text not null default 'system' check (generated_by in ('system', 'ai', 'user')),
  source_reason text default '',
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- content_drafts
create table content_drafts (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  platform text not null check (platform in ('x', 'instagram', 'note', 'video')),
  content_type text not null check (content_type in ('x_post', 'instagram_caption', 'note_article', 'video_prompt')),
  title text default '',
  theme text default '',
  hook text default '',
  body text default '',
  cta text default '',
  hashtags text[] default '{}',
  tone text default 'neutral',
  status text not null default 'draft' check (status in ('draft', 'ready', 'archived')),
  created_from_task_id uuid references daily_tasks(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- posts
create table posts (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  social_account_id uuid references social_accounts(id) on delete set null,
  platform text not null check (platform in ('x', 'instagram', 'note')),
  posted_at timestamptz,
  content_draft_id uuid references content_drafts(id) on delete set null,
  theme text default '',
  hook text default '',
  body text default '',
  cta text default '',
  hashtags text[] default '{}',
  post_type text default '',
  media_url text default '',
  external_post_url text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- post_metrics
create table post_metrics (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid not null references posts(id) on delete cascade,
  captured_at timestamptz not null default now(),
  views integer default 0,
  likes integer default 0,
  comments integer default 0,
  shares integer default 0,
  saves integer default 0,
  profile_visits integer default 0,
  follows_gained integer default 0,
  watch_time numeric default 0,
  retention_rate numeric default 0,
  notes text default '',
  created_at timestamptz not null default now()
);

-- trend_sources
create table trend_sources (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  source_type text not null check (source_type in ('competitor_account', 'reference_url', 'manual_note')),
  platform text check (platform in ('x', 'instagram', 'note', 'other')),
  source_name text not null default '',
  source_url text default '',
  is_active boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- trend_posts
create table trend_posts (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  trend_source_id uuid references trend_sources(id) on delete set null,
  platform text check (platform in ('x', 'instagram', 'note', 'other')),
  title text default '',
  hook text default '',
  body_summary text default '',
  source_url text default '',
  posted_at timestamptz,
  metrics_snapshot_json jsonb default '{}',
  raw_text text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- trend_analyses
create table trend_analyses (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  trend_post_id uuid references trend_posts(id) on delete cascade,
  analysis_summary text default '',
  hook_pattern text default '',
  structure_pattern text default '',
  cta_pattern text default '',
  tone_pattern text default '',
  suggested_action text default '',
  created_by text not null default 'user' check (created_by in ('ai', 'user')),
  created_at timestamptz not null default now()
);

-- daily_reports
create table daily_reports (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  report_date date not null,
  completion_rate numeric default 0,
  tasks_completed integer default 0,
  tasks_total integer default 0,
  summary text default '',
  ai_insight text default '',
  next_actions text default '',
  created_at timestamptz not null default now()
);

-- ai_conversations
create table ai_conversations (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  message_group_id uuid not null default uuid_generate_v4(),
  created_at timestamptz not null default now()
);

-- ai_usage_logs
create table ai_usage_logs (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  feature_name text not null,
  provider text not null default 'mock',
  model text not null default 'mock',
  input_tokens integer default 0,
  output_tokens integer default 0,
  estimated_cost numeric default 0,
  created_at timestamptz not null default now()
);

-- ============================================
-- INDEXES
-- ============================================

create index idx_workspaces_user_id on workspaces(user_id);
create index idx_social_accounts_workspace on social_accounts(workspace_id);
create index idx_daily_tasks_workspace_date on daily_tasks(workspace_id, task_date);
create index idx_content_drafts_workspace on content_drafts(workspace_id);
create index idx_posts_workspace on posts(workspace_id);
create index idx_post_metrics_post on post_metrics(post_id);
create index idx_trend_sources_workspace on trend_sources(workspace_id);
create index idx_trend_posts_workspace on trend_posts(workspace_id);
create index idx_trend_analyses_workspace on trend_analyses(workspace_id);
create index idx_daily_reports_workspace_date on daily_reports(workspace_id, report_date);
create index idx_ai_conversations_workspace on ai_conversations(workspace_id, message_group_id);
create index idx_ai_usage_logs_workspace on ai_usage_logs(workspace_id);

-- ============================================
-- RLS POLICIES
-- ============================================

alter table profiles enable row level security;
alter table workspaces enable row level security;
alter table social_accounts enable row level security;
alter table daily_tasks enable row level security;
alter table content_drafts enable row level security;
alter table posts enable row level security;
alter table post_metrics enable row level security;
alter table trend_sources enable row level security;
alter table trend_posts enable row level security;
alter table trend_analyses enable row level security;
alter table daily_reports enable row level security;
alter table ai_conversations enable row level security;
alter table ai_usage_logs enable row level security;

-- profiles: own row only
create policy "profiles_select_own" on profiles for select using (id = auth.uid());
create policy "profiles_insert_own" on profiles for insert with check (id = auth.uid());
create policy "profiles_update_own" on profiles for update using (id = auth.uid());

-- workspaces: own rows only
create policy "workspaces_select_own" on workspaces for select using (user_id = auth.uid());
create policy "workspaces_insert_own" on workspaces for insert with check (user_id = auth.uid());
create policy "workspaces_update_own" on workspaces for update using (user_id = auth.uid());
create policy "workspaces_delete_own" on workspaces for delete using (user_id = auth.uid());

-- Helper function: check workspace ownership
create or replace function is_workspace_owner(ws_id uuid)
returns boolean as $$
  select exists (
    select 1 from workspaces where id = ws_id and user_id = auth.uid()
  );
$$ language sql security definer;

-- social_accounts
create policy "social_accounts_select" on social_accounts for select using (is_workspace_owner(workspace_id));
create policy "social_accounts_insert" on social_accounts for insert with check (is_workspace_owner(workspace_id));
create policy "social_accounts_update" on social_accounts for update using (is_workspace_owner(workspace_id));
create policy "social_accounts_delete" on social_accounts for delete using (is_workspace_owner(workspace_id));

-- daily_tasks
create policy "daily_tasks_select" on daily_tasks for select using (is_workspace_owner(workspace_id));
create policy "daily_tasks_insert" on daily_tasks for insert with check (is_workspace_owner(workspace_id));
create policy "daily_tasks_update" on daily_tasks for update using (is_workspace_owner(workspace_id));
create policy "daily_tasks_delete" on daily_tasks for delete using (is_workspace_owner(workspace_id));

-- content_drafts
create policy "content_drafts_select" on content_drafts for select using (is_workspace_owner(workspace_id));
create policy "content_drafts_insert" on content_drafts for insert with check (is_workspace_owner(workspace_id));
create policy "content_drafts_update" on content_drafts for update using (is_workspace_owner(workspace_id));
create policy "content_drafts_delete" on content_drafts for delete using (is_workspace_owner(workspace_id));

-- posts
create policy "posts_select" on posts for select using (is_workspace_owner(workspace_id));
create policy "posts_insert" on posts for insert with check (is_workspace_owner(workspace_id));
create policy "posts_update" on posts for update using (is_workspace_owner(workspace_id));
create policy "posts_delete" on posts for delete using (is_workspace_owner(workspace_id));

-- post_metrics (via post ownership)
create policy "post_metrics_select" on post_metrics for select using (
  exists (select 1 from posts where posts.id = post_metrics.post_id and is_workspace_owner(posts.workspace_id))
);
create policy "post_metrics_insert" on post_metrics for insert with check (
  exists (select 1 from posts where posts.id = post_metrics.post_id and is_workspace_owner(posts.workspace_id))
);
create policy "post_metrics_update" on post_metrics for update using (
  exists (select 1 from posts where posts.id = post_metrics.post_id and is_workspace_owner(posts.workspace_id))
);

-- trend_sources
create policy "trend_sources_select" on trend_sources for select using (is_workspace_owner(workspace_id));
create policy "trend_sources_insert" on trend_sources for insert with check (is_workspace_owner(workspace_id));
create policy "trend_sources_update" on trend_sources for update using (is_workspace_owner(workspace_id));
create policy "trend_sources_delete" on trend_sources for delete using (is_workspace_owner(workspace_id));

-- trend_posts
create policy "trend_posts_select" on trend_posts for select using (is_workspace_owner(workspace_id));
create policy "trend_posts_insert" on trend_posts for insert with check (is_workspace_owner(workspace_id));
create policy "trend_posts_update" on trend_posts for update using (is_workspace_owner(workspace_id));
create policy "trend_posts_delete" on trend_posts for delete using (is_workspace_owner(workspace_id));

-- trend_analyses
create policy "trend_analyses_select" on trend_analyses for select using (is_workspace_owner(workspace_id));
create policy "trend_analyses_insert" on trend_analyses for insert with check (is_workspace_owner(workspace_id));
create policy "trend_analyses_update" on trend_analyses for update using (is_workspace_owner(workspace_id));

-- daily_reports
create policy "daily_reports_select" on daily_reports for select using (is_workspace_owner(workspace_id));
create policy "daily_reports_insert" on daily_reports for insert with check (is_workspace_owner(workspace_id));
create policy "daily_reports_update" on daily_reports for update using (is_workspace_owner(workspace_id));

-- ai_conversations
create policy "ai_conversations_select" on ai_conversations for select using (is_workspace_owner(workspace_id));
create policy "ai_conversations_insert" on ai_conversations for insert with check (is_workspace_owner(workspace_id));

-- ai_usage_logs
create policy "ai_usage_logs_select" on ai_usage_logs for select using (is_workspace_owner(workspace_id));
create policy "ai_usage_logs_insert" on ai_usage_logs for insert with check (is_workspace_owner(workspace_id));

-- ============================================
-- TRIGGERS: auto-update updated_at
-- ============================================

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at before update on profiles for each row execute function update_updated_at();
create trigger workspaces_updated_at before update on workspaces for each row execute function update_updated_at();
create trigger social_accounts_updated_at before update on social_accounts for each row execute function update_updated_at();
create trigger daily_tasks_updated_at before update on daily_tasks for each row execute function update_updated_at();
create trigger content_drafts_updated_at before update on content_drafts for each row execute function update_updated_at();
create trigger posts_updated_at before update on posts for each row execute function update_updated_at();
create trigger trend_sources_updated_at before update on trend_sources for each row execute function update_updated_at();
create trigger trend_posts_updated_at before update on trend_posts for each row execute function update_updated_at();

-- ============================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', ''));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
