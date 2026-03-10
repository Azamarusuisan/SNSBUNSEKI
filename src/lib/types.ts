// Database types matching Supabase schema

export type Platform = 'x' | 'instagram' | 'note';
export type PlatformWithGeneral = Platform | 'general';
export type PlatformWithVideo = Platform | 'video';
export type PlatformWithOther = Platform | 'other';

export type TaskType = 'write_post' | 'publish_post' | 'write_note' | 'analyze' | 'create_script' | 'research' | 'review' | 'engage';
export type TaskStatus = 'todo' | 'done' | 'postponed' | 'skipped';
export type TaskGeneratedBy = 'system' | 'ai' | 'user';
export type ContentType = 'x_post' | 'instagram_caption' | 'note_article' | 'video_prompt';
export type DraftStatus = 'draft' | 'ready' | 'archived';
export type TrendSourceType = 'competitor_account' | 'reference_url' | 'manual_note';
export type ChatRole = 'user' | 'assistant' | 'system';

export interface Profile {
  id: string;
  display_name: string;
  created_at: string;
  updated_at: string;
}

export interface Workspace {
  id: string;
  user_id: string;
  name: string;
  goal_followers: number;
  primary_platform: string;
  created_at: string;
  updated_at: string;
}

export interface SocialAccount {
  id: string;
  workspace_id: string;
  platform: Platform;
  account_name: string;
  niche: string;
  target_audience: string;
  current_followers: number;
  goal_followers: number;
  posting_style: string;
  created_at: string;
  updated_at: string;
}

export interface DailyTask {
  id: string;
  workspace_id: string;
  task_date: string;
  platform: PlatformWithGeneral;
  task_type: TaskType;
  title: string;
  description: string;
  scheduled_time: string | null;
  estimated_minutes: number;
  priority: number;
  status: TaskStatus;
  generated_by: TaskGeneratedBy;
  source_reason: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContentDraft {
  id: string;
  workspace_id: string;
  platform: PlatformWithVideo;
  content_type: ContentType;
  title: string;
  theme: string;
  hook: string;
  body: string;
  cta: string;
  hashtags: string[];
  tone: string;
  status: DraftStatus;
  created_from_task_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  workspace_id: string;
  social_account_id: string | null;
  platform: Platform;
  posted_at: string | null;
  content_draft_id: string | null;
  theme: string;
  hook: string;
  body: string;
  cta: string;
  hashtags: string[];
  post_type: string;
  media_url: string;
  external_post_url: string;
  created_at: string;
  updated_at: string;
}

export interface PostMetrics {
  id: string;
  post_id: string;
  captured_at: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  profile_visits: number;
  follows_gained: number;
  watch_time: number;
  retention_rate: number;
  notes: string;
  created_at: string;
}

export interface TrendSource {
  id: string;
  workspace_id: string;
  source_type: TrendSourceType;
  platform: PlatformWithOther;
  source_name: string;
  source_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TrendPost {
  id: string;
  workspace_id: string;
  trend_source_id: string | null;
  platform: PlatformWithOther;
  title: string;
  hook: string;
  body_summary: string;
  source_url: string;
  posted_at: string | null;
  metrics_snapshot_json: Record<string, unknown>;
  raw_text: string;
  created_at: string;
  updated_at: string;
}

export interface TrendAnalysis {
  id: string;
  workspace_id: string;
  trend_post_id: string;
  analysis_summary: string;
  hook_pattern: string;
  structure_pattern: string;
  cta_pattern: string;
  tone_pattern: string;
  suggested_action: string;
  created_by: 'ai' | 'user';
  created_at: string;
}

export interface DailyReport {
  id: string;
  workspace_id: string;
  report_date: string;
  completion_rate: number;
  tasks_completed: number;
  tasks_total: number;
  summary: string;
  ai_insight: string;
  next_actions: string;
  created_at: string;
}

export interface AiConversation {
  id: string;
  workspace_id: string;
  role: ChatRole;
  content: string;
  message_group_id: string;
  created_at: string;
}

export interface AiUsageLog {
  id: string;
  workspace_id: string;
  feature_name: string;
  provider: string;
  model: string;
  input_tokens: number;
  output_tokens: number;
  estimated_cost: number;
  created_at: string;
}
