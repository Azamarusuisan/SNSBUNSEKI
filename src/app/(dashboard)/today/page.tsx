import { redirect } from 'next/navigation';
import { isDemoMode, DEMO_WORKSPACE } from '@/lib/demo';
import { TodayContent } from './today-content';

export default async function TodayPage() {
  if (isDemoMode()) {
    return <TodayContent workspace={DEMO_WORKSPACE} />;
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
  return <TodayContent workspace={workspace} />;
}
