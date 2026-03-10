'use server';

import { createClient } from '@/lib/supabase/server';
import type { Post, PostMetrics, ContentDraft } from '@/lib/types';

export async function getPosts(workspaceId: string, limit = 50): Promise<Post[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('posts')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })
    .limit(limit);

  return data || [];
}

export async function createPost(workspaceId: string, post: Partial<Post>): Promise<Post | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('posts')
    .insert({
      workspace_id: workspaceId,
      social_account_id: post.social_account_id,
      platform: post.platform || 'x',
      posted_at: post.posted_at || new Date().toISOString(),
      content_draft_id: post.content_draft_id,
      theme: post.theme || '',
      hook: post.hook || '',
      body: post.body || '',
      cta: post.cta || '',
      hashtags: post.hashtags || [],
      post_type: post.post_type || '',
      media_url: post.media_url || '',
      external_post_url: post.external_post_url || '',
    })
    .select()
    .single();

  return data;
}

export async function updatePost(postId: string, updates: Partial<Post>): Promise<Post | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('posts')
    .update(updates)
    .eq('id', postId)
    .select()
    .single();

  return data;
}

export async function savePostMetrics(postId: string, metrics: Partial<PostMetrics>): Promise<PostMetrics | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('post_metrics')
    .insert({
      post_id: postId,
      views: metrics.views || 0,
      likes: metrics.likes || 0,
      comments: metrics.comments || 0,
      shares: metrics.shares || 0,
      saves: metrics.saves || 0,
      profile_visits: metrics.profile_visits || 0,
      follows_gained: metrics.follows_gained || 0,
      watch_time: metrics.watch_time || 0,
      retention_rate: metrics.retention_rate || 0,
      notes: metrics.notes || '',
    })
    .select()
    .single();

  return data;
}

export async function getPostWithMetrics(postId: string) {
  const supabase = await createClient();
  const { data: post } = await supabase
    .from('posts')
    .select('*')
    .eq('id', postId)
    .single();

  const { data: metrics } = await supabase
    .from('post_metrics')
    .select('*')
    .eq('post_id', postId)
    .order('captured_at', { ascending: false })
    .limit(1);

  return { post, metrics: metrics?.[0] || null };
}

// Content Drafts
export async function getDrafts(workspaceId: string, platform?: string): Promise<ContentDraft[]> {
  const supabase = await createClient();
  let query = supabase
    .from('content_drafts')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false });

  if (platform) {
    query = query.eq('platform', platform);
  }

  const { data } = await query.limit(50);
  return data || [];
}

export async function saveDraft(workspaceId: string, draft: Partial<ContentDraft>): Promise<ContentDraft | null> {
  const supabase = await createClient();

  if (draft.id) {
    const { data } = await supabase
      .from('content_drafts')
      .update({
        title: draft.title,
        theme: draft.theme,
        hook: draft.hook,
        body: draft.body,
        cta: draft.cta,
        hashtags: draft.hashtags,
        tone: draft.tone,
        status: draft.status,
      })
      .eq('id', draft.id)
      .select()
      .single();
    return data;
  }

  const { data } = await supabase
    .from('content_drafts')
    .insert({
      workspace_id: workspaceId,
      platform: draft.platform || 'x',
      content_type: draft.content_type || 'x_post',
      title: draft.title || '',
      theme: draft.theme || '',
      hook: draft.hook || '',
      body: draft.body || '',
      cta: draft.cta || '',
      hashtags: draft.hashtags || [],
      tone: draft.tone || 'neutral',
      status: draft.status || 'draft',
      created_from_task_id: draft.created_from_task_id,
    })
    .select()
    .single();

  return data;
}
