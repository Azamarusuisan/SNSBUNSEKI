import { redirect } from 'next/navigation';
import { isDemoMode, DEMO_WORKSPACE } from '@/lib/demo';
import { DashboardContent } from './dashboard-content';

export default async function DashboardPage() {
  if (isDemoMode()) {
    return <DashboardContent workspace={DEMO_WORKSPACE} />;
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

  if (!workspace) {
    const { data: newWs } = await supabase
      .from('workspaces')
      .insert({ user_id: user.id, name: 'My Workspace' })
      .select()
      .single();
    if (!newWs) redirect('/login');
    return <DashboardContent workspace={newWs} />;
  }

  return <DashboardContent workspace={workspace} />;
}
