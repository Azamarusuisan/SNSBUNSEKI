import { redirect } from 'next/navigation';
import { isDemoMode, DEMO_WORKSPACE, DEMO_ACCOUNTS } from '@/lib/demo';
import { SettingsContent } from './settings-content';

export default async function SettingsPage() {
  if (isDemoMode()) {
    return <SettingsContent workspace={DEMO_WORKSPACE} initialAccounts={DEMO_ACCOUNTS} />;
  }

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: workspace } = await supabase
    .from('workspaces')
    .select('*')
    .eq('user_id', user.id)
    .limit(1)
    .single();

  if (!workspace) redirect('/dashboard');

  const { data: accounts } = await supabase
    .from('social_accounts')
    .select('*')
    .eq('workspace_id', workspace.id)
    .order('platform');

  return <SettingsContent workspace={workspace} initialAccounts={accounts || []} />;
}
