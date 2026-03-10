'use server';

import { createClient } from '@/lib/supabase/server';
import type { Workspace, SocialAccount } from '@/lib/types';

export async function getWorkspace(): Promise<Workspace | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('workspaces')
    .select('*')
    .eq('user_id', user.id)
    .limit(1)
    .single();

  return data;
}

export async function getSocialAccounts(workspaceId: string): Promise<SocialAccount[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('social_accounts')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('platform');

  return data || [];
}

export async function createOrUpdateSocialAccount(
  workspaceId: string,
  account: Partial<SocialAccount> & { platform: string }
): Promise<SocialAccount | null> {
  const supabase = await createClient();

  if (account.id) {
    const { data } = await supabase
      .from('social_accounts')
      .update({
        account_name: account.account_name,
        niche: account.niche,
        target_audience: account.target_audience,
        current_followers: account.current_followers,
        goal_followers: account.goal_followers,
        posting_style: account.posting_style,
      })
      .eq('id', account.id)
      .select()
      .single();
    return data;
  }

  const { data } = await supabase
    .from('social_accounts')
    .insert({
      workspace_id: workspaceId,
      platform: account.platform,
      account_name: account.account_name || '',
      niche: account.niche || '',
      target_audience: account.target_audience || '',
      current_followers: account.current_followers || 0,
      goal_followers: account.goal_followers || 10000,
      posting_style: account.posting_style || '',
    })
    .select()
    .single();

  return data;
}

export async function updateWorkspaceSettings(
  workspaceId: string,
  updates: Partial<Pick<Workspace, 'name' | 'goal_followers' | 'primary_platform'>>
) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('workspaces')
    .update(updates)
    .eq('id', workspaceId)
    .select()
    .single();
  return data;
}
