'use server';

import { createClient } from '@/lib/supabase/server';
import type { TrendSource, TrendPost, TrendAnalysis } from '@/lib/types';

export async function getTrendSources(workspaceId: string): Promise<TrendSource[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('trend_sources')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false });

  return data || [];
}

export async function createTrendSource(
  workspaceId: string,
  source: Partial<TrendSource>
): Promise<TrendSource | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('trend_sources')
    .insert({
      workspace_id: workspaceId,
      source_type: source.source_type || 'reference_url',
      platform: source.platform || 'other',
      source_name: source.source_name || '',
      source_url: source.source_url || '',
      is_active: true,
    })
    .select()
    .single();

  return data;
}

export async function getTrendPosts(workspaceId: string, limit = 30): Promise<TrendPost[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('trend_posts')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })
    .limit(limit);

  return data || [];
}

export async function createTrendPost(
  workspaceId: string,
  post: Partial<TrendPost>
): Promise<TrendPost | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('trend_posts')
    .insert({
      workspace_id: workspaceId,
      trend_source_id: post.trend_source_id,
      platform: post.platform || 'other',
      title: post.title || '',
      hook: post.hook || '',
      body_summary: post.body_summary || '',
      source_url: post.source_url || '',
      posted_at: post.posted_at,
      raw_text: post.raw_text || '',
    })
    .select()
    .single();

  return data;
}

export async function getTrendAnalyses(workspaceId: string, trendPostId?: string): Promise<TrendAnalysis[]> {
  const supabase = await createClient();
  let query = supabase
    .from('trend_analyses')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false });

  if (trendPostId) {
    query = query.eq('trend_post_id', trendPostId);
  }

  const { data } = await query.limit(30);
  return data || [];
}
